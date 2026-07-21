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

type Card = {
  href: string;
  title: string;
  description: string;
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
      description:
        "失語・失行・失認から社会的認知まで、症候ごとの事典。病巣と検査、分類上の論点も添えている。",
      count: `${symptoms} 症候`,
    },
    {
      href: "/wiki",
      title: "高次脳機能部 wiki",
      description:
        "月1回の勉強会で立った問いの保管庫。答えの出ないものも、出ないまま残している。",
      count: `${questions} の問い`,
    },
    {
      href: "/database",
      title: "データベース",
      description:
        "神経筋支配とブロードマン脳地図。神経別・筋節別、あるいは領野から引ける。",
    },
    {
      href: "/anatomical-atlas",
      title: "脳アトラス",
      description:
        "解剖・機能局在・白質線維の3種。3Dビューアとスライス表示で確認できる。",
    },
    {
      href: "/blog",
      title: "ブログ",
      description: "論文の読み書き、画像解析、考えごと。",
      count: `${posts} 本`,
    },
  ];

  const secondary: Card[] = [
    {
      href: "/tools",
      title: "Tools",
      description: "臨床と研究のための小さな道具。",
    },
    {
      href: "/gallery",
      title: "Gallery",
      description: "写真。",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">TonKurA</h1>
        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
          神経内科医の個人サイトです。臨床で調べたことの覚書、勉強会で立った問い、
          脳画像まわりの道具、それから写真を置いています。
        </p>
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
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col"
            >
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h3 className="text-xl font-semibold group-hover:text-blue-700 transition-colors">
                  {card.title}
                </h3>
                {card.count && (
                  <span className="shrink-0 text-sm text-gray-500 tabular-nums">
                    {card.count}
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">
                {card.description}
              </p>
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
              <h3 className="font-semibold group-hover:text-blue-700 transition-colors mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-gray-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
