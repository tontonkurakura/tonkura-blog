import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllQuestionMeta,
  getQuestion,
  getQuestionTitles,
  type QuestionMeta,
} from "@/lib/questions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getAllQuestionMeta().map((q) => ({ id: q.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const question = getQuestion(id);
  if (!question) return {};
  return { title: question.title };
}

// type / status / sessions は frontmatter に持つが、読者には見せない。
// 分類のラベルやタイムスタンプが本文より先に目に入ると、読み物としての体裁が崩れる。
// 原発言へ戻る導線（規約4）は frontmatter の sessions が担う。

function QuestionLinks({
  ids,
  titles,
  emptyText,
}: {
  ids: string[];
  titles: Map<string, string>;
  emptyText: string;
}) {
  if (ids.length === 0) {
    return <p className="text-sm text-gray-500">{emptyText}</p>;
  }
  return (
    <ul className="space-y-1">
      {ids.map((id) => (
        <li key={id}>
          <Link
            href={`/wiki/${id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            <span className="font-mono text-sm">{id}</span>
            {titles.get(id) ? ` — ${titles.get(id)}` : ""}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function QuestionPage({ params }: PageProps) {
  const { id } = await params;
  const question = getQuestion(id);

  if (!question) {
    notFound();
  }

  const titles = getQuestionTitles();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link href="/wiki" className="text-sm text-blue-600 hover:text-blue-800">
        ← 高次脳機能部 wiki
      </Link>

      <header className="mt-4 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold leading-snug">{question.title}</h1>

        {question.domain.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {question.domain.map((d) => (
              <span
                key={d}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
              >
                {d}
              </span>
            ))}
          </div>
        )}
      </header>

      <article
        className="prose prose-slate mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: question.content }}
      />

      <footer className="mt-12 space-y-6 border-t border-gray-200 pt-6">
        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-700">
            前提となる問い
          </h2>
          <QuestionLinks
            ids={question.depends_on}
            titles={titles}
            emptyText="なし"
          />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-700">関連する問い</h2>
          <QuestionLinks
            ids={question.related}
            titles={titles}
            emptyText="なし"
          />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-700">
            この問いを参照している問い
          </h2>
          {question.backlinks.length === 0 ? (
            <p className="text-sm text-gray-500">なし</p>
          ) : (
            <QuestionLinks
              ids={question.backlinks.map((b: QuestionMeta) => b.id)}
              titles={titles}
              emptyText="なし"
            />
          )}
        </section>

        {question.refs.length > 0 && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-gray-700">
              関連する症候（事典）
            </h2>
            <ul className="space-y-1">
              {question.refs.map((ref) => (
                <li key={ref}>
                  <Link
                    href={`/database/higher-brain-function/symptoms/${ref}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {ref}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {question.updated && (
          <p className="text-xs text-gray-400">最終更新 {question.updated}</p>
        )}
      </footer>
    </div>
  );
}
