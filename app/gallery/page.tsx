import path from "path";
import { getAllImagesWithMetadata, processImage } from "@/utils/images";
import Gallery from "@/components/Gallery";
import { cache } from "react";
import fs from "fs";

interface CachedGalleryData {
  timestamp: number;
  images: Array<{
    src: string;
    metadata: any;
  }>;
}

const CACHE_FILE = path.join(
  process.cwd(),
  "public",
  "processed-images",
  "gallery-cache.json"
);
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

// キャッシュの読み込み
function loadCache(): CachedGalleryData | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      if (Date.now() - cacheData.timestamp < CACHE_DURATION) {
        return cacheData;
      }
    }
  } catch (error) {
    console.error("Error loading cache:", error);
  }
  return null;
}

// キャッシュの保存
function saveCache(data: CachedGalleryData) {
  try {
    const cacheDir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving cache:", error);
  }
}

// getGalleryImagesをキャッシュ
const getGalleryImages = cache(async () => {
  // キャッシュをチェック
  const cachedData = loadCache();
  if (cachedData) {
    console.log("Using cached gallery data");
    return cachedData.images;
  }

  console.log("Processing gallery images...");
  const imagesDir = path.join(process.cwd(), "public", "images");
  const outputDir = path.join(process.cwd(), "public", "processed-images");

  // 撮影日付順に並べ替えた画像メタデータを取得
  const sortedImages = await getAllImagesWithMetadata(imagesDir);

  // 画像を処理して新しいファイル名で保存
  const processedImages = await Promise.all(
    sortedImages.map(async (image, index) => {
      const filename = path.basename(image.originalPath);
      const metadata = await processImage(
        image.originalPath,
        outputDir,
        filename,
        index
      );

      // 新しいファイル名を生成（processImage内で生成されたものと同じ形式を使用）
      const newFilename = `${formatDate(metadata.shootingDate!)}_${String(
        index + 1
      ).padStart(3, "0")}`;

      return {
        src: `/processed-images/${newFilename}.webp`,
        metadata,
      };
    })
  );

  // キャッシュを保存
  saveCache({
    timestamp: Date.now(),
    images: processedImages,
  });

  return processedImages;
});

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

// ページコンポーネントに動的レンダリングを設定
export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1時間ごとに再検証

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8 font-mplus">Photographs</h1>
      <Gallery images={images} />
    </div>
  );
}
