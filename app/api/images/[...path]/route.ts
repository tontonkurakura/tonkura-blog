import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // パスの各部分をデコード
    const decodedPath = params.path.map((part) => decodeURIComponent(part));

    // パスの構築（セクションディレクトリを考慮）
    const imagePath = path.join(
      process.cwd(),
      "content/neurology",
      ...decodedPath
    );

    console.log("Trying to access image at:", imagePath); // デバッグ用

    // ファイルの存在確認
    try {
      await fs.access(imagePath);
    } catch {
      console.error(`Image not found at: ${imagePath}`); // デバッグ用
      return new NextResponse("Image not found", { status: 404 });
    }

    // ファイルの読み込み
    const imageBuffer = await fs.readFile(imagePath);

    // Content-Typeの設定
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    console.log("Content-Type:", contentType); // デバッグ用

    // レスポンスヘッダーの設定
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000"); // 1年間のキャッシュ

    return new NextResponse(imageBuffer, { headers });
  } catch (error) {
    console.error("Error serving image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
