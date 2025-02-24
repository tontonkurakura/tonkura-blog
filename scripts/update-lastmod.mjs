import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { format } from "date-fns";
import chokidar from "chokidar";

const CONTENT_DIR = "content";

// 指定されたディレクトリ内のMarkdownファイルを再帰的に検索
function findMarkdownFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

// ファイルのlastmodを更新
function updateLastmod(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { data, content: markdown } = matter(content);

    // 現在の日付をYYYY-MM-DD形式で取得
    const today = format(new Date(), "yyyy-MM-dd");

    // lastmodが存在しないか、今日と異なる場合のみ更新
    if (!data.lastmod || data.lastmod !== today) {
      data.lastmod = today;

      // 更新したファイルを書き込み
      const updatedContent = matter.stringify(markdown, data);
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated lastmod for ${filePath} to ${today}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// すべてのファイルを一括更新
function updateAllFiles() {
  const markdownFiles = findMarkdownFiles(CONTENT_DIR);
  for (const file of markdownFiles) {
    updateLastmod(file);
  }
}

// コマンドライン引数をチェック
const args = process.argv.slice(2);
if (args.includes("--watch")) {
  // 監視モード
  console.log("Watching for file changes...");
  const watcher = chokidar.watch(`${CONTENT_DIR}/**/*.md`, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
  });

  watcher
    .on("change", (path) => {
      console.log(`File ${path} has been changed`);
      updateLastmod(path);
    })
    .on("error", (error) => console.error(`Watcher error: ${error}`));
} else {
  // 一括更新モード
  updateAllFiles();
}
