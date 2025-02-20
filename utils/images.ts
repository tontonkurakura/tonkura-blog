import fs from "fs";
import path from "path";
import sharp from "sharp";
import exifReader from "exifreader";

export interface ImageMetadata {
  shootingDate: Date | undefined;
  width: number;
  height: number;
  originalPath: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
}

export async function getAllImagesWithMetadata(
  directory: string
): Promise<Array<{ originalPath: string }>> {
  if (!fs.existsSync(directory)) {
    console.log(`Directory does not exist: ${directory}`);
    return [];
  }

  const files = fs.readdirSync(directory);
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|gif)$/i.test(file)
  );

  return imageFiles.map((file) => ({
    originalPath: path.join(directory, file),
  }));
}

// 日付をYYYYMMDDHHMMSS形式にフォーマットする関数
function formatDate(date: Date | undefined): string {
  if (!date) {
    const now = new Date();
    return formatDateToString(now);
  }
  return formatDateToString(date);
}

// 日付を文字列に変換する補助関数
function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

async function getExifData(filePath: string): Promise<Partial<ImageMetadata>> {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (!metadata.exif) {
      console.log("No EXIF data found in image:", filePath);
      return {};
    }

    const exifData = exifReader(metadata.exif);
    console.log("Raw EXIF data:", JSON.stringify(exifData, null, 2));

    const result: Partial<ImageMetadata> = {};

    // カメラ情報
    if (exifData.image?.Make || exifData.image?.Model) {
      const make = exifData.image?.Make?.trim();
      const model = exifData.image?.Model?.trim();
      result.camera = [make, model].filter(Boolean).join(" ");
    }

    // レンズ情報
    if (exifData.exif?.LensModel) {
      result.lens = exifData.exif.LensModel.trim();
    }

    // 焦点距離
    if (exifData.exif?.FocalLength) {
      const focalLength =
        typeof exifData.exif.FocalLength === "number"
          ? exifData.exif.FocalLength
          : parseFloat(exifData.exif.FocalLength);
      result.focalLength = `${Math.round(focalLength)}mm`;
    }

    // 絞り値
    if (exifData.exif?.FNumber) {
      const fNumber =
        typeof exifData.exif.FNumber === "number"
          ? exifData.exif.FNumber
          : parseFloat(exifData.exif.FNumber);
      result.aperture = `f/${fNumber.toFixed(1)}`;
    }

    // シャッタースピード
    if (exifData.exif?.ExposureTime) {
      const exposureTime =
        typeof exifData.exif.ExposureTime === "number"
          ? exifData.exif.ExposureTime
          : parseFloat(exifData.exif.ExposureTime);
      if (exposureTime < 1) {
        result.shutterSpeed = `1/${Math.round(1 / exposureTime)}`;
      } else {
        result.shutterSpeed = exposureTime.toString();
      }
    }

    // ISO感度
    if (exifData.exif?.ISO) {
      result.iso = `ISO ${exifData.exif.ISO}`;
    }

    // 撮影日時
    if (exifData.exif?.DateTimeOriginal) {
      const dateStr = exifData.exif.DateTimeOriginal;
      // YYYY:MM:DD HH:mm:ss 形式の文字列を解析
      const [date, time] = dateStr.split(" ");
      const [year, month, day] = date.split(":");
      const [hour, minute, second] = time.split(":");

      const parsedDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      );

      if (!isNaN(parsedDate.getTime())) {
        result.shootingDate = parsedDate;
      }
    }

    console.log("Extracted EXIF metadata:", result);
    return result;
  } catch (error) {
    console.error("Error extracting EXIF data:", error);
    return {};
  }
}

export async function processImage(
  inputPath: string,
  outputDir: string,
  filename: string,
  index: number
): Promise<ImageMetadata> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    const exifData = await getExifData(inputPath);

    // 日付ベースのファイル名を生成（タイムスタンプではなく日付を使用）
    const dateStr = formatDate(exifData.shootingDate || new Date());
    const baseName = `${dateStr}_${String(index).padStart(3, "0")}`;

    // サムネイル生成
    const thumbPath = path.join(outputDir, `thumb_${baseName}.webp`);
    console.log("Generating thumbnail at:", thumbPath);
    await image
      .clone()
      .resize(300, 300, {
        fit: "cover",
        position: "centre",
      })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    // 生成されたサムネイルの確認
    if (!fs.existsSync(thumbPath)) {
      console.error("Failed to generate thumbnail:", thumbPath);
    } else {
      console.log("Successfully generated thumbnail:", thumbPath);
      console.log("Thumbnail file exists:", fs.existsSync(thumbPath));
    }

    // 大きな画像生成
    const largePath = path.join(outputDir, `${baseName}.webp`);
    console.log("Generating large image at:", largePath);
    await image
      .clone()
      .resize(1920, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(largePath);

    // 生成された大きな画像の確認
    if (!fs.existsSync(largePath)) {
      console.error("Failed to generate large image:", largePath);
    } else {
      console.log("Successfully generated large image:", largePath);
      console.log("Large image file exists:", fs.existsSync(largePath));
    }

    return {
      shootingDate: exifData.shootingDate,
      width: metadata.width || 0,
      height: metadata.height || 0,
      originalPath: inputPath,
      camera: exifData.camera,
      lens: exifData.lens,
      focalLength: exifData.focalLength,
      aperture: exifData.aperture,
      shutterSpeed: exifData.shutterSpeed,
      iso: exifData.iso,
    };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}
