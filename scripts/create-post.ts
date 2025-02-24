const path = require("path");
const fs = require("fs/promises");
const { format } = require("date-fns");

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

async function createNewPost() {
  const date = new Date();
  const dateStr = format(date, "yyyyMMdd");
  const isoDate = date.toISOString().split("T")[0];

  // コマンドライン引数からタイトルを取得
  const title = process.argv[2] || "新規ブログ記事";

  // スラッグを生成
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const fileName = `${dateStr}_${slug}.md`;
  const filePath = path.join(BLOG_DIR, fileName);

  // テンプレートの内容
  const content = `---
title: "${title}"
date: "${isoDate}"
tags: []
description: ""
---

ここに記事の内容を書きます。
`;

  try {
    await fs.writeFile(filePath, content, "utf-8");
    console.log(`✨ 新規記事を作成しました: ${fileName}`);
    console.log(`📝 ファイルパス: ${filePath}`);
  } catch (error) {
    console.error("❌ 記事の作成に失敗しました:", error);
    process.exit(1);
  }
}

// スクリプトの実行
createNewPost();
