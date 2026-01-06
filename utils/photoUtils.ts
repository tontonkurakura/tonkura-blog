import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import ExifReader from "exifreader";
import type { Photo, ExifData } from "@/types/photo";
import { readFileSync, writeFileSync, existsSync } from "fs";
import yaml from "js-yaml";

const PHOTOS_DIR = path.join(process.cwd(), "public/images");
const WEBP_DIR = path.join(process.cwd(), "public/images/webp");
const PHOTO_INFO_PATH = path.join(process.cwd(), "content/photos.yaml");

interface PhotoInfo {
  [key: string]: {
    description: string;
  };
}

interface RawExif {
  Image: {
    Make: string;
    Model: string;
  };
  Photo: {
    DateTimeOriginal: string;
    FNumber: number;
    ExposureTime: number;
    ISOSpeedRatings: number;
    FocalLength: number;
    LensModel: string;
  };
}

async function ensureWebpDir() {
  try {
    await fs.access(WEBP_DIR);
  } catch {
    await fs.mkdir(WEBP_DIR, { recursive: true });
  }
}

function loadPhotoInfo(): PhotoInfo {
  try {
    const fileContents = readFileSync(PHOTO_INFO_PATH, "utf8");
    const data = yaml.load(fileContents);
    if (data && typeof data === "object") {
      return data as PhotoInfo;
    }
    return {};
  } catch {
    return {};
  }
}

function formatDateForFileName(dateStr: string | Date): string {
  if (dateStr instanceof Date) {
    // Dateオブジェクトの場合はYYYYMMDDHHmmss形式に変換
    return dateStr
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
  }

  // 文字列の場合は元の処理を実行
  const match = dateStr.match(
    /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/
  );
  if (!match) {
    // マッチしない場合は現在時刻を使用
    return new Date()
      .toISOString()
      .replace(/[-:T.Z]/g, "")
      .slice(0, 14);
  }
  return match.slice(1).join(""); // YYYYMMDDHHmmss形式
}

async function updatePhotoYaml(newPhotoFileName: string) {
  try {
    // 既存のYAMLファイルを読み込む
    let photoInfo: PhotoInfo = {};
    if (existsSync(PHOTO_INFO_PATH)) {
      const yamlContent = readFileSync(PHOTO_INFO_PATH, "utf8");
      photoInfo = (yaml.load(yamlContent) as PhotoInfo) || {};
    }

    // 新しい写真のエントリがない場合のみ追加
    if (!photoInfo[newPhotoFileName]) {
      photoInfo[newPhotoFileName] = {
        description: "写真の説明を入力してください",
      };

      // YAMLファイルに書き出し
      const yamlContent = yaml.dump(photoInfo, {
        indent: 2,
        lineWidth: -1,
        quotingType: '"',
      });

      // ヘッダーコメントを追加
      const yamlWithHeader = `# 写真の説明を設定するファイル
# 各写真に対して以下の情報を設定できます：
# - description: 写真の詳細な説明

${yamlContent}`;

      writeFileSync(PHOTO_INFO_PATH, yamlWithHeader);
      console.log(`Added new photo entry to photos.yaml: ${newPhotoFileName}`);
    }
  } catch (error) {
    console.error("Error updating photos.yaml:", error);
  }
}

async function convertToWebp(
  filePath: string,
  fileName: string,
  dateTimeOriginal: string | Date | null
): Promise<string> {
  // 撮影日時をファイル名に使用（ない場合はファイル名から拡張子を除いたもの）
  const baseName = dateTimeOriginal
    ? formatDateForFileName(dateTimeOriginal)
    : fileName.replace(/\.[^.]+$/, "");
  const webpFileName = `${baseName}.webp`;
  const webpPath = path.join(WEBP_DIR, webpFileName);

  try {
    await fs.access(webpPath);
  } catch {
    await sharp(filePath)
      .rotate() // 自動的に正しい向きに回転
      .resize(1920, 1920, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);

    // 新しいWEBPファイルが作成されたら、YAMLファイルも更新
    await updatePhotoYaml(fileName);
  }

  return `/images/webp/${webpFileName}`;
}

async function extractExif(
  filePath: string
): Promise<[ExifData, string | Date | null]> {
  const buffer = await fs.readFile(filePath);
  let tags;
  try {
    tags = ExifReader.load(buffer);
  } catch (error) {
    console.log(
      `Error reading Exif data for: ${path.basename(filePath)}`,
      error
    );
    return [
      {
        camera: "Unknown",
        lens: "Unknown",
        focalLength: "Unknown",
        aperture: "Unknown",
        shutterSpeed: "Unknown",
        iso: "Unknown",
        date: new Date().toISOString(),
      },
      null,
    ];
  }

  if (!tags) {
    console.log(`No Exif data found for: ${path.basename(filePath)}`);
    return [
      {
        camera: "Unknown",
        lens: "Unknown",
        focalLength: "Unknown",
        aperture: "Unknown",
        shutterSpeed: "Unknown",
        iso: "Unknown",
        date: new Date().toISOString(),
      },
      null,
    ];
  }

  // シャッタースピードを分数形式で表示
  const formatShutterSpeed = (exposureTime: number): string => {
    if (exposureTime >= 1) return `${exposureTime}s`;
    return `1/${Math.round(1 / exposureTime)}s`;
  };

  let dateTimeOriginal: Date | null = null;
  try {
    if (tags.DateTimeOriginal?.description) {
      const dateStr = tags.DateTimeOriginal.description;
      // EXIF形式の日付文字列（"YYYY:MM:DD HH:MM:SS"）を解析
      const match = dateStr.match(
        /^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/
      );
      if (match) {
        const [_, year, month, day, hours, minutes, seconds] = match;
        dateTimeOriginal = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );
        if (isNaN(dateTimeOriginal.getTime())) {
          dateTimeOriginal = null;
        }
      }
    }
  } catch (error) {
    console.log(`Error parsing date for: ${path.basename(filePath)}`, error);
    dateTimeOriginal = null;
  }

  const formattedExif = {
    camera: `${tags.Make?.description || "Unknown"} ${tags.Model?.description || ""
      }`.trim(),
    lens: tags.LensModel?.description || "Unknown",
    focalLength: tags.FocalLength
      ? `${tags.FocalLength.description}`
      : "Unknown",
    aperture: tags.FNumber?.value?.[0]
      ? `f/${(
        (tags.FNumber.value[0] as number) / (tags.FNumber.value[1] as number)
      ).toFixed(1)}`
      : "Unknown",
    shutterSpeed: tags.ExposureTime?.value?.[0]
      ? formatShutterSpeed(
        (tags.ExposureTime.value[0] as number) /
        (tags.ExposureTime.value[1] as number)
      )
      : "Unknown",
    iso: tags.ISOSpeedRatings?.description?.toString() || "Unknown",
    date: dateTimeOriginal?.toISOString() || new Date().toISOString(),
  };

  return [formattedExif, dateTimeOriginal];
}

async function determineAspectRatio(
  filePath: string
): Promise<"landscape" | "portrait" | "square"> {
  const metadata = await sharp(filePath).metadata();
  if (!metadata.width || !metadata.height) return "landscape";

  const ratio = metadata.width / metadata.height;
  if (ratio > 1.2) return "landscape";
  if (ratio < 0.8) return "portrait";
  return "square";
}

export async function getPhotos(): Promise<Photo[]> {
  await ensureWebpDir();

  const files = await fs.readdir(PHOTOS_DIR);
  const photos: Photo[] = [];
  const photoInfo = loadPhotoInfo();

  for (const file of files) {
    if (file === "webp" || !file.match(/\.(jpg|jpeg)$/i)) continue;

    const filePath = path.join(PHOTOS_DIR, file);
    const [exif, dateTimeOriginal] = await extractExif(filePath);
    const webpPath = await convertToWebp(filePath, file, dateTimeOriginal);
    const aspectRatio = await determineAspectRatio(filePath);

    photos.push({
      id: file.replace(/\.[^.]+$/, ""),
      path: `/images/${file}`,
      webpPath,
      exif,
      description: photoInfo[file]?.description || "",
      aspectRatio,
    });
  }

  return photos.sort((a, b) => {
    return new Date(b.exif.date).getTime() - new Date(a.exif.date).getTime();
  });
}
