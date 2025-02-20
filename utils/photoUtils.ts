import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
// @ts-ignore
import exifReader from "exif-reader";
import type { Photo, ExifData } from "@/types/photo";
import { readFileSync } from "fs";
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
  }

  return `/images/webp/${webpFileName}`;
}

async function extractExif(
  filePath: string
): Promise<[ExifData, string | Date | null]> {
  const buffer = await fs.readFile(filePath);
  const metadata = await sharp(buffer).metadata();

  if (!metadata.exif) {
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

  const rawExif = exifReader(metadata.exif) as unknown as RawExif;

  // デバッグ用に日付情報を出力
  if (path.basename(filePath) === "DSC00100.jpg") {
    console.log("Raw Exif data:", JSON.stringify(rawExif, null, 2));
  }

  // シャッタースピードを分数形式で表示
  const formatShutterSpeed = (exposureTime: number): string => {
    if (exposureTime >= 1) return `${exposureTime}s`;
    return `1/${Math.round(1 / exposureTime)}s`;
  };

  const dateTimeOriginal = rawExif.Photo?.DateTimeOriginal
    ? new Date(rawExif.Photo.DateTimeOriginal)
    : null;

  const formattedExif = {
    camera: `${rawExif.Image?.Make || "Unknown"} ${
      rawExif.Image?.Model || ""
    }`.trim(),
    lens: rawExif.Photo?.LensModel || "Unknown",
    focalLength: rawExif.Photo?.FocalLength
      ? `${rawExif.Photo.FocalLength}mm`
      : "Unknown",
    aperture: rawExif.Photo?.FNumber
      ? `f/${rawExif.Photo.FNumber.toFixed(1)}`
      : "Unknown",
    shutterSpeed: rawExif.Photo?.ExposureTime
      ? formatShutterSpeed(rawExif.Photo.ExposureTime)
      : "Unknown",
    iso: rawExif.Photo?.ISOSpeedRatings?.toString() || "Unknown",
    date: dateTimeOriginal?.toISOString() || new Date().toISOString(),
  };

  return [formattedExif, dateTimeOriginal];
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

    photos.push({
      path: `/images/${file}`,
      webpPath,
      exif,
      description: photoInfo[file]?.description || "",
    });
  }

  return photos.sort((a, b) => {
    return new Date(b.exif.date).getTime() - new Date(a.exif.date).getTime();
  });
}
