import fs from "fs";
import path from "path";
import { marked } from "marked";

/**
 * Markdown の強調記号が描画されずに素の `**` として表示される問題を止める。
 *
 * CommonMark は強調の開始・終了記号の判定に前後の文字種を使う。日本語では
 * `**用語（term）**の` のように閉じ記号の直前が約物、直後が仮名という並びが
 * 頻出するが、この形は「閉じ記号」と認識されず `**` がそのまま表示される。
 * 実際に本番で発生したため、レンダラに通して機械的に検出する。
 *
 * 直し方は約物を強調の外へ出すこと。
 *   NG: `**用語（term）**の説明`   → OK: `**用語**（term）の説明`
 *   NG: `**文である。**次の文`     → OK: `**文である**。次の文`
 *   NG: `**「引用」**と述べる`      → OK: `「**引用**」と述べる`
 */

type Target = { dir: string; options: Parameters<typeof marked>[1] };

// 各コンテンツを実際に描画している設定に合わせる
const TARGETS: Target[] = [
  // app/lib/markdown.ts
  {
    dir: "content/database/higher-brain-function/symptoms",
    options: { breaks: true, gfm: true },
  },
  // lib/questions.ts
  { dir: "content/questions", options: { breaks: false, gfm: true } },
];

function collect(dir: string): string[] {
  const abs = path.join(process.cwd(), dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? collect(path.join(dir, e.name))
        : /\.mdx?$/.test(e.name)
          ? [path.join(dir, e.name)]
          : []
    );
}

/** frontmatter を除いた本文だけを返す */
function body(raw: string): string {
  const m = raw.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return m ? m[1] : raw;
}

describe("Markdown の強調記号が描画される", () => {
  for (const { dir, options } of TARGETS) {
    const files = collect(dir);

    it(`${dir} にファイルがある`, () => {
      expect(files.length).toBeGreaterThan(0);
    });

    it(`${dir} の全ファイルで ** が残らない`, () => {
      const broken: string[] = [];
      for (const f of files) {
        const src = body(fs.readFileSync(path.join(process.cwd(), f), "utf8"));
        // 段落単位で見て、問題のある箇所を特定できるようにする
        for (const block of src.split(/\n\s*\n/)) {
          const html = marked(block, options) as string;
          if (!html.includes("**")) continue;
          const snippet = block.replace(/\n/g, " ").slice(0, 80);
          broken.push(`${f}: ${snippet}`);
        }
      }
      expect(broken).toEqual([]);
    });
  }
});
