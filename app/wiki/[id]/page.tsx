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
  return { title: question.title, description: `${id} / ${question.type}` };
}

const TYPE_LABEL: Record<string, string> = {
  map: "地図型",
  empirical: "実証型",
  hybrid: "複合型",
};

/** status は「未解決＝欠陥」に見えない配色にする。open は第一級の状態。 */
const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  open: { label: "未解決", className: "bg-amber-100 text-amber-900" },
  mapped: { label: "論点整理済み", className: "bg-sky-100 text-sky-900" },
  evidenced: { label: "証拠あり（前提付き）", className: "bg-emerald-100 text-emerald-900" },
};

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
          <Link href={`/wiki/${id}`} className="text-blue-600 hover:text-blue-800">
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
  const status = STATUS_STYLE[question.status] ?? STATUS_STYLE.open;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link href="/wiki" className="text-sm text-blue-600 hover:text-blue-800">
        ← 高次脳機能部 wiki
      </Link>

      <header className="mt-4 border-b border-gray-200 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono text-gray-500">{question.id}</span>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
            {TYPE_LABEL[question.type] ?? question.type}
          </span>
          <span className={`rounded px-2 py-0.5 ${status.className}`}>{status.label}</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold leading-snug">{question.title}</h1>

        {question.domain.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {question.domain.map((d) => (
              <span key={d} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                {d}
              </span>
            ))}
          </div>
        )}

        {/* 原発言へ戻る導線。規約4により必須。 */}
        {question.sessions.length > 0 && (
          <dl className="mt-4 text-sm text-gray-600">
            <dt className="font-medium">議論された回</dt>
            <dd className="mt-1 space-y-0.5">
              {question.sessions.map((s) => (
                <div key={`${s.n}-${s.at}`}>
                  第{s.n}回 <span className="font-mono">{s.at}</span>
                </div>
              ))}
            </dd>
          </dl>
        )}
      </header>

      <article
        className="prose prose-slate mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: question.content }}
      />

      <footer className="mt-12 space-y-6 border-t border-gray-200 pt-6">
        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-700">前提となる問い</h2>
          <QuestionLinks
            ids={question.depends_on}
            titles={titles}
            emptyText="なし"
          />
        </section>

        <section>
          <h2 className="mb-2 text-sm font-bold text-gray-700">関連する問い</h2>
          <QuestionLinks ids={question.related} titles={titles} emptyText="なし" />
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
            <h2 className="mb-2 text-sm font-bold text-gray-700">関連する症候（事典）</h2>
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
