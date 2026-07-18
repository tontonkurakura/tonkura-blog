# tonkura-blog

Next.js 16（App Router）/ TypeScript / Tailwind のファイルベースのサイト。
外部 CMS には依存せず、`content/` 配下の Markdown が唯一のデータ源。

## 高次脳機能部 wiki（問い中心の保管庫）

月1回の高次脳機能勉強会（失語・失行・失認・記憶・注意・遂行機能など）で立った
**問い**を、問い単位で蓄積して wiki 化する仕組み。`/wiki` 配下。

事典的な記述は既存の `content/database/higher-brain-function/`（症候51本）が担い、
こちらは**未解決の問いそのもの**を扱う。両者は frontmatter の `refs` で相互に繋ぐ。

### 規約

以下は設計上の確定事項。**変更しないこと。**

1. **レポートは「1回1本」ではなく「問い1つにつき1本」。** 一つ一つがしっかりした問い。

2. **問いを2軸で分類する。**

   | 軸 | 値 |
   |---|---|
   | 種別 | 臨床・実証 / 神経科学 / 概念・哲学 / 歴史・人文 / 用語確認 |
   | 答えの構造 | `empirical` / `map` / `hybrid` |

   - `empirical` — 前提を置けばエビデンスで詰められる
   - `map` — 原理的に解がなく、論点の地図しか描けない
   - `hybrid` — まず概念整理が要る中間帯

3. **`status` に `resolved` を置かない。** 地図型の問いは閉じない。
   終点は `mapped`（論点が整理された）と `evidenced`（前提付きで証拠がある）。
   **未解決は欠陥ではなく第一級の状態**として扱う。wiki の価値はそこにある。

4. **原発言へ戻る導線を必ず持つ。** Zoom のタイムスタンプを frontmatter に記録する。

5. **`empirical` 型には反証パスを標準装備。** 結論の下書き後に「それを否定する文献を
   探す」工程を必ず1回通す。エビデンスの格付け（n数・再現の有無・研究デザイン）も
   明記する。弱い証拠が整った文体で権威に化けるのを防ぐため。臨床判断に還流しうるので重要。

6. **同じ問いの再訪は新規ファイルを作らない。** 既存ファイルの `sessions` に1行足し、
   本文を更新する。**git log がその問いを巡る思考の軌跡になる。**

### frontmatter 仕様（＝この wiki の DB）

外部 DB は持たない。ビルド時に `content/questions/*.mdx` を全走査し、
`depends_on` / `related` を逆引きしてバックリンクと依存グラフを生成する。

```yaml
---
id: q-042                 # q-NNN の連番。領域プレフィックスは付けない
title: 意味記憶の障害と「意味の理解」の喪失は同一か
type: map                 # map | empirical | hybrid
status: open              # open | mapped | evidenced
domain: [semantic-memory, aphasia]
sessions:
  - n: 12
    at: "1:23:45"         # 原発言に戻るためのタイムスタンプ
  - n: 15
    at: "0:41:02"         # 再訪
depends_on: [q-017]       # この問いが前提とする問い
related: [q-023]          # 関連する問い
refs:                     # 既存の高次脳機能データベースへの参照
  - higher-brain-function/language/wernicke-aphasia
updated: 2026-07-17
---
```

`id` は `q-001` からの連番。問いは領域をまたぐことが多いので、id に意味を持たせず
分類は `domain` が担う。

### `q-000` は見本

`q-000` は frontmatter の項目と本文テンプレの描画を確かめるための見本であり、
実際の問いではない。**一覧・件数・議題キューからは除外**し、末尾のリンクからのみ
辿れるようにしている（`lib/questions.ts` の `TEMPLATE_ID`）。

スキーマを変えたときに型崩れへ気づくための装置なので、削除しないこと。

### 本文テンプレは type で分ける

- **`empirical`** — 問いの精密化 → 前提条件の明示 → 現在のエビデンスと質 →
  反証の探索結果 → 未解決点 → 出典（**実在の PMID のみ**）
- **`map`** — 何を問うているか → 主要な立場と論者 → 争点 →
  当日の議論との接続 → 読書案内
- **`hybrid`** — 冒頭に「問いの分解」節を置き、概念整理のあと `empirical` 部を続ける

### 調査時の注意

**まず `DECISIONS.md` を読むこと。** なぜこの方法にしたかと、何が未決かが書いてある。

#### PubMed に自然言語クエリを投げない

PubMed は入力を AND 分解する。実測で、目的の論文が1件も返らず無関係な論文が並んだ。
**必ずフィールドタグを使う。**

```
✗  language is primarily a tool for communication rather than thought
✓  Fedorenko E[Author] AND Nature[Journal]
✓  "inner speech"[Title] AND aphasia
✓  "inner speech"[Title] AND (Review[Publication Type])
```

検索は **PMID しか返さない**（タイトルすら含まれない）。関連性の判断には
`get_article_metadata` の呼び出しが別途要る。

#### PubMed を既定の情報源にしない

**生物医学限定で、哲学・社会科学・非医学系心理学を含まない。**
概念・哲学寄りの問いは SEP (plato.stanford.edu) / IEP を主情報源にする。
素の Web 検索に哲学の問いを投げると質が崩壊する。
（PhilPapers は 403 で到達できなかった実績がある）

#### 引用の完全性 — 信頼ではなく機械で担保

1. **`get_article_metadata` がそのセッションで返さなかった PMID は書かない。** 例外なし
2. 各文献の **タイトル・雑誌・年・n数・`article_type`** を記録し本文に反映する
3. **`article_type` を必ず本文に出す。** Review と原著と症例報告を同じ顔で並べない
4. 最終稿の全 PMID を**再取得してタイトル一致を確認する検証パス**を最後に置く

#### 硬い証拠と弱い証拠を区別する

n数・研究デザイン・`article_type` を明記し、弱いものは「弱い」と書く。
小さい n の高い相関値は、そのまま臨床判断に使えない旨を書く。
**分かっていないことは「分かっていない」と書く。** 調べられなかったソースも
「未確認」と明記し、推測で埋めない。

#### 反証パスは別の目で

`empirical` 型は規約5により必須。結論を書いたのと同じ視点で探すと形骸化するので、
**「この主張を否定せよ」という立場で改めて探す。** 実績として、この工程で
会の最有力仮説が否定されていたこと、文献間の直接対立、自分の当初の想定の誤りが見つかっている。

## ディレクトリの約束

| パス | 用途 |
|---|---|
| `DECISIONS.md` | **なぜそうしたか・何が未決か。作業再開時に必ず読む** |
| `content/questions/` | 問い1つにつき1ファイル |
| `content/questions/_inbox/` | 未採用の問いスタブ（採否ゲートの待機列）|
| `content/sessions/` | 回ごとの索引（Phase 1 以降。未作成）|
| `content/database/higher-brain-function/` | 既存の症候事典（51本）|
| `lib/questions.ts` | frontmatter 走査・逆リンク生成 |
| `app/wiki/` | 問いの表示 |
| `.claude/skills/study-group/` | 文字起こしから問いを抽出するスキル |

**文字起こしはコミットしない**（`transcripts/` と `*.vtt` は `.gitignore` 済み）。
参加者の発言そのものであり、このリポジトリは public。

## 開発

```bash
npm ci
npm run dev      # predev で lastmod が自動更新される
npm run build
npm test
```

`scripts/update-lastmod.mjs` が `npm run dev` のたびに content 配下の `lastmod` を
書き換えるため、コンテンツを触っていなくても差分が出る。コミット前に確認すること。
