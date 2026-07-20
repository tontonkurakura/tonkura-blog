import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import matter from "gray-matter";
import { format } from "date-fns";
import chokidar from "chokidar";

const CONTENT_DIR = "content";

/**
 * lastmod は「そのファイルを実際に変更した日」を表す。
 *
 * 以前はこのスクリプトを走らせた日を content 配下の全ファイルに書き込んでいた。
 * そのため内容を触っていなくても npm run dev のたびに 300 ファイル超の差分が湧き、
 * git のノイズになっていた（実測 314 ファイル）。本当の変更が埋もれてしまう。
 *
 * 現在は「作業ツリーで変更されているファイル」だけを対象にする。
 * git が未変更と判断したファイルには一切書き込まないので、実行しても差分は増えない。
 * 変更済みファイルには今日を書くが、2回目以降は同じ値になるため上書きも起きない。
 */

/**
 * core.quotePath を明示的に切る。
 * 既定では git が非ASCIIパスを "content/.../\344\270\241....md" のように
 * 8進エスケープして出力するため、content 配下の日本語ファイル名が実際のパスと
 * 一致しなくなる（実測で全 1323 パス中 1152 が該当した）。
 */
function git(args) {
  return execFileSync("git", ["-c", "core.quotePath=false", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * 作業ツリーで変更・追加された content 配下の Markdown。
 * -z を使い NUL 区切りで受け取る。ファイル名に空白や引用符が含まれても壊れないため。
 */
function getChangedFiles() {
  let out;
  try {
    out = git(["status", "--porcelain", "-z", "--", CONTENT_DIR]);
  } catch {
    // git リポジトリでない場合（tarball 展開など）は何もしない
    return new Set();
  }

  const changed = new Set();
  // -z のレコードは "XY <path>\0"。リネームは "R  <new>\0<old>\0" と2レコードになる
  const records = out.split("\0").filter(Boolean);

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const status = record.slice(0, 2);
    const filePath = record.slice(3);

    // リネーム/コピーは直後に旧パスのレコードが続くので読み飛ばす
    if (status[0] === "R" || status[0] === "C") i++;

    // 削除されたファイルは書き込む対象がない
    if (status.includes("D")) continue;

    if (filePath.endsWith(".md")) changed.add(filePath);
  }

  return changed;
}

function updateLastmod(filePath, today) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { data, content: markdown } = matter(content);

    // gray-matter は引用符なしの日付を Date にするため、文字列に揃えてから比較する
    const current =
      data.lastmod instanceof Date
        ? format(data.lastmod, "yyyy-MM-dd")
        : data.lastmod;

    if (current === today) return false;

    data.lastmod = today;
    fs.writeFileSync(filePath, matter.stringify(markdown, data));
    console.log(`Updated lastmod for ${filePath} to ${today}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
    return false;
  }
}

function updateChangedFiles() {
  const today = format(new Date(), "yyyy-MM-dd");
  const changed = [...getChangedFiles()].filter((f) => fs.existsSync(f));

  let updated = 0;
  for (const file of changed) {
    if (updateLastmod(file, today)) updated++;
  }
  console.log(`lastmod: ${updated} updated / ${changed.length} changed files`);
}

const args = process.argv.slice(2);
if (args.includes("--watch")) {
  // 監視モード。編集された瞬間に今日の日付を打つ
  console.log("Watching for file changes...");
  const watcher = chokidar.watch(path.join(CONTENT_DIR, "**/*.md"), {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
  });

  watcher
    .on("change", (changed) => {
      updateLastmod(changed, format(new Date(), "yyyy-MM-dd"));
    })
    .on("error", (error) => console.error(`Watcher error: ${error}`));
} else {
  updateChangedFiles();
}
