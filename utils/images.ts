import fs from "fs";
import path from "path";
import sharp from "sharp";
import { ExifImage } from "exif";

export interface ImageMetadata {
  width: number;
  height: number;
  originalPath: string;
  shootingDate?: Date;
  exif?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    iso?: string;
    shutterSpeed?: string;
    dateTime?: string;
    orientation?: number;
  };
}

interface ProcessedImage {
  metadata: ImageMetadata;
  timestamp: number;
  outputPath: string;
  thumbPath: string;
}

const processedImagesCache = new Map<string, ProcessedImage>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

function formatDate(date: Date): string {
  try {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date();
    }
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    const now = new Date();
    return now
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
  }
}

function parseExifDate(dateStr?: string): Date {
  if (!dateStr) return new Date();

  try {
    // EXIF日付形式のバリエーションに対応
    // 1. "YYYY:MM:DD HH:MM:SS"
    // 2. "YYYY:MM:DD"
    // 3. "YYYY-MM-DD HH:MM:SS"
    // 4. "YYYY-MM-DD"

    // コロンとハイフンを統一
    const normalizedStr = dateStr.replace(/-/g, ":");

    // 日付と時刻に分割
    const [datePart, timePart = "00:00:00"] = normalizedStr.split(" ");

    // 日付部分を分解
    const [yearStr, monthStr, dayStr] = datePart.split(":");
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // JavaScriptの月は0-11
    const day = parseInt(dayStr, 10);

    // 時刻部分を分解
    const [hourStr, minuteStr, secondStr] = timePart.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const second = parseInt(secondStr, 10);

    // 数値の妥当性チェック
    if (
      isNaN(year) ||
      year < 1900 ||
      year > 2100 ||
      isNaN(month) ||
      month < 0 ||
      month > 11 ||
      isNaN(day) ||
      day < 1 ||
      day > 31 ||
      isNaN(hour) ||
      hour < 0 ||
      hour > 23 ||
      isNaN(minute) ||
      minute < 0 ||
      minute > 59 ||
      isNaN(second) ||
      second < 0 ||
      second > 59
    ) {
      throw new Error(`Invalid date components: ${dateStr}`);
    }

    const date = new Date(year, month, day, hour, minute, second);

    // 最終チェック
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date result: ${dateStr}`);
    }

    return date;
  } catch (error) {
    console.error(`Date parsing error for "${dateStr}":`, error);
    return new Date();
  }
}

function isCacheValid(cached: ProcessedImage): boolean {
  return (
    cached &&
    Date.now() - cached.timestamp < CACHE_DURATION &&
    fs.existsSync(cached.outputPath) &&
    fs.existsSync(cached.thumbPath)
  );
}

export async function processImage(
  inputPath: string,
  outputDir: string,
  filename: string,
  index: number
): Promise<ImageMetadata> {
  const cacheKey = inputPath;
  const cached = processedImagesCache.get(cacheKey);

  // EXIF情報を先に取得して撮影日を取得
  const exifData = await getExifData(inputPath);
  const shootingDate = exifData?.dateTime
    ? parseExifDate(exifData.dateTime)
    : new Date(fs.statSync(inputPath).mtime);

  // 新しいファイル名を生成
  const newFilename = `${formatDate(shootingDate)}_${String(index + 1).padStart(
    3,
    "0"
  )}`;
  const outputPath = path.join(outputDir, `${newFilename}.webp`);
  const thumbPath = path.join(outputDir, `thumb_${newFilename}.webp`);

  // キャッシュをチェック
  if (cached && isCacheValid(cached)) {
    return cached.metadata;
  }

  // 出力ディレクトリが存在しない場合は作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 画像の処理
  const image = sharp(inputPath);
  image.rotate(); // 自動回転を有効化
  const metadata = await image.metadata();

  console.log(`Processing image: ${inputPath} -> ${outputPath}`);

  // サムネイルとフル画像の生成
  await Promise.all([
    image
      .clone()
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toFile(thumbPath),
    image
      .clone()
      .resize(2000, null, { fit: "inside" })
      .webp({ quality: 85 })
      .toFile(outputPath),
  ]);

  const imageMetadata: ImageMetadata = {
    width: metadata.width || 0,
    height: metadata.height || 0,
    originalPath: inputPath,
    shootingDate,
    exif: exifData,
  };

  // キャッシュを更新
  processedImagesCache.set(cacheKey, {
    metadata: imageMetadata,
    timestamp: Date.now(),
    outputPath,
    thumbPath,
  });

  return imageMetadata;
}

function getExifData(imagePath: string): Promise<ImageMetadata["exif"]> {
  return new Promise((resolve) => {
    try {
      new ExifImage({ image: imagePath }, (error, exifData) => {
        if (error) {
          console.error(`EXIF reading error for ${imagePath}:`, error);
          resolve(undefined);
          return;
        }

        try {
          // EXIF情報を取得（優先順位順）
          const dateTime =
            exifData.exif.DateTimeOriginal ||
            exifData.exif.CreateDate ||
            exifData.image.ModifyDate ||
            exifData.image.CreateDate;

          // 日付が取得できた場合はパースを試みる
          if (dateTime) {
            try {
              parseExifDate(dateTime);
            } catch (error) {
              console.error(
                `Invalid EXIF date format in ${imagePath}:`,
                dateTime
              );
            }
          }

          resolve({
            camera: `${exifData.image.Make} ${exifData.image.Model}`.trim(),
            lens: exifData.exif.LensModel,
            focalLength: exifData.exif.FocalLength
              ? `${exifData.exif.FocalLength}mm`
              : undefined,
            aperture: exifData.exif.FNumber
              ? `f/${exifData.exif.FNumber}`
              : undefined,
            iso: exifData.exif.ISO ? `${exifData.exif.ISO}` : undefined,
            shutterSpeed: exifData.exif.ExposureTime
              ? `${exifData.exif.ExposureTime}s`
              : undefined,
            dateTime,
            orientation: exifData.image.Orientation,
          });
        } catch (error) {
          console.error(`Error processing EXIF data for ${imagePath}:`, error);
          resolve(undefined);
        }
      });
    } catch (error) {
      console.error(`Error creating ExifImage for ${imagePath}:`, error);
      resolve(undefined);
    }
  });
}

export async function getAllImagesWithMetadata(
  directory: string
): Promise<ImageMetadata[]> {
  const imagePaths = getAllImages(directory);
  const imagesWithDates: { path: string; date: Date }[] = [];

  // 全画像のEXIF情報を取得
  for (const imagePath of imagePaths) {
    try {
      const exifData = await getExifData(imagePath);
      const date = exifData?.dateTime
        ? parseExifDate(exifData.dateTime)
        : new Date(fs.statSync(imagePath).mtime);

      imagesWithDates.push({ path: imagePath, date });
    } catch (error) {
      console.error(`Error processing image ${imagePath}:`, error);
      // エラーが発生した場合はファイルの更新日時を使用
      imagesWithDates.push({
        path: imagePath,
        date: new Date(fs.statSync(imagePath).mtime),
      });
    }
  }

  // 日付で降順ソート
  return imagesWithDates
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((item) => ({
      width: 0,
      height: 0,
      originalPath: item.path,
      shootingDate: item.date,
    }));
}

export function getAllImages(directory: string): string[] {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  const images: string[] = [];

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      images.push(...getAllImages(fullPath));
    } else if (item.isFile() && /\.(jpg|jpeg|png)$/i.test(item.name)) {
      images.push(fullPath);
    }
  }

  return images;
}
