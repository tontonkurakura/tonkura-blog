import Link from "next/link";
import {
  getAllQuestionMeta,
  getOpenQuestions,
  getRealQuestions,
  isTemplate,
  TEMPLATE_ID,
} from "@/lib/questions";

export const metadata = {
  title: "高次脳機能部 wiki",
  description: "月1回の高次脳機能勉強会で立った問いの保管庫",
};

const TYPE_LABEL: Record<string, string> = {
  map: "地図型",
  empirical: "実証型",
  hybrid: "複合型",
};

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  open: { label: "未解決", className: "bg-amber-100 text-amber-900" },
  mapped: { label: "論点整理済み", className: "bg-sky-100 text-sky-900" },
  evidenced: { label: "証拠あり（前提付き）", className: "bg-emerald-100 text-emerald-900" },
};

export default function WikiIndexPage() {
  const questions = getRealQuestions();
  const openCount = getOpenQuestions().length;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">高次脳機能部 wiki</h1>
      <p className="mt-2 text-sm text-gray-600">
        月1回の勉強会で立った問いを、問い単位で蓄積しています。
        地図型の問いは閉じません。<strong>未解決は欠陥ではなく第一級の状態</strong>として
        扱います。
      </p>
      <p className="mt-1 text-sm text-gray-500">
        全 {questions.length} 問 / 未解決 {openCount} 問
      </p>

      {questions.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">まだ問いがありません。</p>
      ) : (
        <ul className="mt-8 divide-y divide-gray-200">
          {questions.map((q) => {
            const status = STATUS_STYLE[q.status] ?? STATUS_STYLE.open;
            return (
              <li key={q.id} className="py-4">
                <Link href={`/wiki/${q.id}`} className="group block">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-gray-500">{q.id}</span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-700">
                      {TYPE_LABEL[q.type] ?? q.type}
                    </span>
                    <span className={`rounded px-2 py-0.5 ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <h2 className="mt-1 font-medium text-blue-700 group-hover:text-blue-900">
                    {q.title}
                  </h2>
                  {q.domain.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">{q.domain.join(" / ")}</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* 見本は一覧と件数から外しているが、辿れなくなると型崩れに気づけない */}
      {getAllQuestionMeta().some(isTemplate) && (
        <p className="mt-12 border-t border-gray-200 pt-4 text-xs text-gray-400">
          <Link href={`/wiki/${TEMPLATE_ID}`} className="hover:text-gray-600">
            テンプレート見本（{TEMPLATE_ID}）
          </Link>
        </p>
      )}
    </div>
  );
}
