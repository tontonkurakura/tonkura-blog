import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // URLからパスを取得
    const imagePath = request.nextUrl.pathname.replace("/api/images/", "");

    // パスの正規化と検証
    const normalizedPath = path
      .normalize(imagePath)
      .replace(/^(\.\.[\/\\])+/, "");

    // 完全なファイルパスを構築
    const fullPath = path.join(
      process.cwd(),
      "content/neurology",
      normalizedPath
    );

    // ファイルの存在確認
    try {
      await fs.access(fullPath);
    } catch {
      console.error(`File not found: ${fullPath}`);
      return new NextResponse("Image not found", { status: 404 });
    }

    // ファイルの読み込み
    const imageBuffer = await fs.readFile(fullPath);

    // Content-Typeの設定
    const ext = path.extname(fullPath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

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
