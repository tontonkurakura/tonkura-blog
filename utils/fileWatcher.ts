import { watch } from "fs";
import { join, basename, extname } from "path";
import { rename, readFile } from "fs/promises";
import matter from "gray-matter";

const BLOG_DIR = join(process.cwd(), "content", "blog");

/**
 * ファイル名をYYYYMMDD_title_slug.md形式に変換
 */
async function convertToStandardFileName(filePath: string): Promise<string> {
  try {
    // ファイルの内容を読み取り
    const content = await readFile(filePath, "utf-8");
    const { data } = matter(content);

    // 日付が無い場合は現在の日付を使用
    const date = data.date ? new Date(data.date) : new Date();

    // YYYYMMDD形式の日付を作成
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");

    // タイトルからスラッグを生成
    const title = data.title || basename(filePath, extname(filePath));
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_") // 英数字以外をアンダースコアに
      .replace(/^_+|_+$/g, ""); // 先頭と末尾のアンダースコアを削除

    return `${dateStr}_${slug}.md`;
  } catch (error) {
    console.error("ファイル処理エラー:", error);
    return basename(filePath);
  }
}

/**
 * 新規ファイルを監視して自動的にリネーム
 */
export function watchNewFiles() {
  console.log("ブログディレクトリの監視を開始:", BLOG_DIR);

  watch(BLOG_DIR, async (eventType, filename) => {
    if (!filename || !filename.endsWith(".md")) return;

    const filePath = join(BLOG_DIR, filename);

    // 既に規則に従っているファイルはスキップ
    if (/^\d{8}_[a-z0-9_]+\.md$/.test(filename)) return;

    try {
      const newFileName = await convertToStandardFileName(filePath);
      const newFilePath = join(BLOG_DIR, newFileName);

      await rename(filePath, newFilePath);
      console.log(`ファイルをリネーム: ${filename} → ${newFileName}`);
    } catch (error) {
      console.error("リネームエラー:", error);
    }
  });
}
