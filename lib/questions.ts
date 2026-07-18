import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const questionsDirectory = path.join(process.cwd(), "content", "questions");

/** 答えの構造。本文テンプレもこれで分岐する。 */
export type QuestionType = "map" | "empirical" | "hybrid";

/**
 * 問いの状態。resolved は意図的に存在しない。
 * 地図型の問いは閉じないため、未解決 (open) は第一級の状態として扱う。
 */
export type QuestionStatus = "open" | "mapped" | "evidenced";

/** その問いが立った回と、原発言に戻るためのタイムスタンプ。 */
export interface QuestionSession {
  n: number;
  at: string;
}

export interface QuestionMeta {
  id: string;
  title: string;
  type: QuestionType;
  status: QuestionStatus;
  domain: string[];
  sessions: QuestionSession[];
  /** この問いが前提とする問い */
  depends_on: string[];
  /** 関連する問い */
  related: string[];
  /** 既存の高次脳機能データベースへの参照 */
  refs: string[];
  updated: string | null;
}

export interface QuestionData extends QuestionMeta {
  /** marked で変換済みの本文 */
  content: string;
  /** この問いを depends_on / related から指している問い（逆リンク） */
  backlinks: QuestionMeta[];
}

const QUESTION_TYPES: QuestionType[] = ["map", "empirical", "hybrid"];
const QUESTION_STATUSES: QuestionStatus[] = ["open", "mapped", "evidenced"];

/** frontmatter は手書きされるので、値を信用せず既定値に寄せる。 */
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
}

function toSessions(value: unknown): QuestionSession[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
    .map((s) => ({ n: Number(s.n), at: String(s.at ?? "") }))
    .filter((s) => Number.isFinite(s.n));
}

function parseMeta(data: Record<string, unknown>, fallbackId: string): QuestionMeta {
  const type = data.type as QuestionType;
  const status = data.status as QuestionStatus;

  return {
    id: String(data.id ?? fallbackId),
    title: String(data.title ?? fallbackId),
    type: QUESTION_TYPES.includes(type) ? type : "map",
    status: QUESTION_STATUSES.includes(status) ? status : "open",
    domain: toStringArray(data.domain),
    sessions: toSessions(data.sessions),
    depends_on: toStringArray(data.depends_on),
    related: toStringArray(data.related),
    refs: toStringArray(data.refs),
    updated: data.updated ? String(data.updated) : null,
  };
}

/**
 * content/questions/*.mdx を全走査する。
 * _inbox/ は未採用スタブの待機列なので、公開対象からは除く。
 */
function readAllFiles(): { meta: QuestionMeta; body: string }[] {
  if (!fs.existsSync(questionsDirectory)) return [];

  return fs
    .readdirSync(questionsDirectory, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.mdx?$/.test(e.name))
    .map((e) => {
      const raw = fs.readFileSync(path.join(questionsDirectory, e.name), "utf8");
      const { data, content } = matter(raw);
      return {
        meta: parseMeta(data, e.name.replace(/\.mdx?$/, "")),
        body: content,
      };
    });
}

export function getAllQuestionMeta(): QuestionMeta[] {
  return readAllFiles()
    .map((f) => f.meta)
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * q-000 は frontmatter と本文テンプレの描画を確かめるための見本であって、
 * 実際の問いではない。件数と議題キューからは除く。
 */
export const TEMPLATE_ID = "q-000";

export function isTemplate(q: QuestionMeta): boolean {
  return q.id === TEMPLATE_ID;
}

/** 見本を除いた実際の問い。一覧の件数はこれを使う。 */
export function getRealQuestions(): QuestionMeta[] {
  return getAllQuestionMeta().filter((q) => !isTemplate(q));
}

/** status:open の一覧＝次回の議題キュー。見本は混ぜない。 */
export function getOpenQuestions(): QuestionMeta[] {
  return getRealQuestions().filter((q) => q.status === "open");
}

/**
 * 1本の問いを、逆リンク付きで返す。
 *
 * depends_on / related は「自分から他へ」の片方向しか書かれない。
 * 参照される側にも導線を出すため、全ファイルを走査して逆引きする。
 */
export function getQuestion(id: string): QuestionData | null {
  const files = readAllFiles();
  const target = files.find((f) => f.meta.id === id);
  if (!target) return null;

  const backlinks = files
    .filter((f) => f.meta.id !== id)
    .filter((f) => f.meta.depends_on.includes(id) || f.meta.related.includes(id))
    .map((f) => f.meta)
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    ...target.meta,
    content: marked(target.body, { breaks: true, gfm: true }) as string,
    backlinks,
  };
}

/** id → title の対応。リンクにタイトルを出すために使う。 */
export function getQuestionTitles(): Map<string, string> {
  return new Map(getAllQuestionMeta().map((q) => [q.id, q.title]));
}
