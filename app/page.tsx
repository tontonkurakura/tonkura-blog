import fs from "fs";
import path from "path";
import Link from "next/link";
import { getRealQuestions } from "@/lib/questions";

/** content 配下の .md/.mdx を数える。トップに実際の分量を出すため。 */
function countMarkdown(...segments: string[]): number {
  const dir = path.join(process.cwd(), "content", ...segments);
  if (!fs.existsSync(dir)) return 0;

  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      total += countMarkdown(...segments, entry.name);
    } else if (/\.mdx?$/.test(entry.name)) {
      total += 1;
    }
  }
  return total;
}

// トップは説明文を持たない。タイトルと件数だけで引ける形にしている。
type Card = {
  href: string;
  title: string;
  count?: string;
};

export default async function Home() {
  const notes = countMarkdown("neurology");
  const symptoms = countMarkdown("database", "higher-brain-function");
  const questions = getRealQuestions().length;
  const posts = countMarkdown("blog");

  // 神経内科ノート（/neurology）はカードに出さない。
  // app/neurology/page.tsx が「開発中」として redirect("/") しているため、
  // リンクするとトップに跳ね返る。公開する判断が出たら復活させる。
  void notes;

  const primary: Card[] = [
    {
      href: "/database/higher-brain-function",
      title: "高次脳機能データベース",
      count: `${symptoms} 症候`,
    },
    {
      href: "/wiki",
      title: "高次脳機能部 wiki",
      count: `${questions} の問い`,
    },
    {
      href: "/database",
      title: "データベース",
    },
    {
      href: "/anatomical-atlas",
      title: "脳アトラス",
    },
    {
      href: "/blog",
      title: "ブログ",
      count: `${posts} 本`,
    },
  ];

  const secondary: Card[] = [
    {
      href: "/tools",
      title: "Tools",
    },
    {
      href: "/gallery",
      title: "Gallery",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold">TonKurA</h1>
      </header>

      <section aria-labelledby="main-sections">
        <h2 id="main-sections" className="sr-only">
          主なコンテンツ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {primary.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex items-baseline justify-between gap-3"
            >
              <h3 className="text-xl font-semibold group-hover:text-blue-700 transition-colors">
                {card.title}
              </h3>
              {card.count && (
                <span className="shrink-0 text-sm text-gray-500 tabular-nums">
                  {card.count}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="other-sections">
        <h2 id="other-sections" className="sr-only">
          そのほか
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secondary.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group bg-white/60 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-white transition-colors duration-300 p-5"
            >
              <h3 className="font-semibold group-hover:text-blue-700 transition-colors">
                {card.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
