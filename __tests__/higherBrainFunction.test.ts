import fs from "fs";
import path from "path";
import { categories } from "@/constants/higherBrainFunction";

const SYMPTOMS_DIR = path.join(
  process.cwd(),
  "content/database/higher-brain-function/symptoms"
);

/** content/ 配下の実ファイルを {category}/{id} の形で列挙する */
function listFilesOnDisk(): string[] {
  return fs
    .readdirSync(SYMPTOMS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((dir) =>
      fs
        .readdirSync(path.join(SYMPTOMS_DIR, dir.name))
        .filter((f) => f.endsWith(".md"))
        .map((f) => `${dir.name}/${f.replace(/\.md$/, "")}`)
    )
    .sort();
}

/** 一覧の定義を {category}/{id} の形で列挙する */
function listEntriesInIndex(): string[] {
  return categories
    .flatMap((c) => c.items.map((i) => `${c.id}/${i.id}`))
    .sort();
}

/** Markdown の最初の H1 を取り出す */
function readTitle(rel: string): string | null {
  const raw = fs.readFileSync(path.join(SYMPTOMS_DIR, `${rel}.md`), "utf-8");
  const m = raw.match(/^# (.+)$/m);
  return m ? m[1].trim() : null;
}

describe("高次脳機能データベースの一覧と実ファイルの整合", () => {
  // 一覧は page.tsx にハードコードされているため、ファイルとずれると
  // 「一覧に出ない孤児」や「クリックすると 404 になるリンク」が生まれる。
  // 実際に両方が起きたので、ここで機械的に止める。

  it("一覧のすべての項目に対応する Markdown が存在する", () => {
    const onDisk = new Set(listFilesOnDisk());
    const missing = listEntriesInIndex().filter((e) => !onDisk.has(e));
    expect(missing).toEqual([]);
  });

  it("すべての Markdown が一覧に載っている（孤児がない）", () => {
    const inIndex = new Set(listEntriesInIndex());
    const orphans = listFilesOnDisk().filter((f) => !inIndex.has(f));
    expect(orphans).toEqual([]);
  });

  it("一覧のタイトルが Markdown の H1 と一致する", () => {
    const mismatches = categories.flatMap((c) =>
      c.items
        .map((i) => {
          const title = readTitle(`${c.id}/${i.id}`);
          return title === i.title
            ? null
            : `${c.id}/${i.id}: 一覧="${i.title}" 本文="${title}"`;
        })
        .filter((x): x is string => x !== null)
    );
    expect(mismatches).toEqual([]);
  });

  it("id が重複していない", () => {
    const all = listEntriesInIndex();
    expect(all.length).toBe(new Set(all).size);
  });

  it("同じタイトルが複数の項目に使われていない", () => {
    // 「遂行機能障害」が行為と前頭葉の2箇所に重複していた経緯がある
    const titles = categories.flatMap((c) => c.items.map((i) => i.title));
    const dupes = titles.filter((t, idx) => titles.indexOf(t) !== idx);
    expect(dupes).toEqual([]);
  });
});
