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

- `empirical` 型は PubMed を使い、**実在する PMID のみ**を引く
- `map` 型の Web 検索は SEP / PhilPapers / IEP を優先ソースにする。
  素の Web 検索に哲学の問いを投げると質が崩壊する

## ディレクトリの約束

| パス | 用途 |
|---|---|
| `content/questions/` | 問い1つにつき1ファイル |
| `content/questions/_inbox/` | 未採用の問いスタブ（採否ゲートの待機列）|
| `content/sessions/` | 回ごとの索引 |
| `content/database/higher-brain-function/` | 既存の症候事典（51本）|
| `lib/questions.ts` | frontmatter 走査・逆リンク生成 |
| `app/wiki/` | 問いの表示 |

## 開発

```bash
npm ci
npm run dev      # predev で lastmod が自動更新される
npm run build
npm test
```

`scripts/update-lastmod.mjs` が `npm run dev` のたびに content 配下の `lastmod` を
書き換えるため、コンテンツを触っていなくても差分が出る。コミット前に確認すること。
