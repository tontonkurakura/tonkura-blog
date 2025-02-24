# Tonkura Blog

## 機能概要

- Markdown ベースのブログ投稿
- 写真ギャラリー
- タグによる記事の分類
- レスポンシブデザイン
- シンタックスハイライト
- SEO 対策

## プロジェクト構成

```
tonkura-blog/
├── app/           # Next.jsアプリケーションのメインコード
├── components/    # 再利用可能なReactコンポーネント
├── content/       # ブログ記事とコンテンツ
│   ├── blog/     # ブログ記事（Markdown）
│   └── photos/   # 写真ギャラリー用の画像
├── public/        # 静的ファイル
├── styles/        # グローバルスタイル
└── utils/        # ユーティリティ関数
```

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバーの起動
npm run start
```

**注意**: 必要なパッケージはすべてローカルにインストールされます。グローバルインストールは不要です。

## ブログ記事の作成方法

### 1. コマンドラインから新規記事を作成する場合

```bash
# 新規記事作成コマンド（どのディレクトリからでも実行可能）
npm run new-post "記事のタイトル"

# 例
npm run new-post "Next.jsでブログを作る方法"
# → content/blog/20240327_nextjs_de_burogu_wo_tsukuru_houhou.md が作成されます
```

**注意**: このコマンドはプロジェクト内のどのディレクトリからでも実行でき、常に`content/blog`ディレクトリに記事が作成されます。

### 2. 既存のマークダウンファイルを追加する場合

1. `content/blog`ディレクトリに`.md`ファイルを配置
2. 自動的に規則に従ったファイル名に変換されます

### ファイル名の規則

```
YYYYMMDD_title_slug.md
```

例：

- `20240327_nextjs_blog_guide.md`
- `20240328_photography_tips.md`

### 記事のテンプレート

```markdown
---
title: "記事のタイトル"
date: "2024-03-27" # YYYY-MM-DD形式
tags: ["タグ1", "タグ2"]
description: "記事の説明文"
---

ここに記事の内容を書きます。
```

### 注意点

- ファイル名は自動的に以下の規則で生成されます：
  - 日付：Front Matter の`date`フィールドから取得（ない場合は現在の日付）
  - スラッグ：タイトルを英数字とアンダースコアに変換
- 日本語のタイトルも自動的にスラッグ化されます
- タグは配列形式で指定してください
- `description`は記事の要約として使用されます（SEO 対策）

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 写真ギャラリーの管理

### 写真の追加

1. `content/photos`ディレクトリに写真を配置
2. 以下のコマンドを実行して写真情報を更新：

```bash
npm run generate-photo-yaml
```

### 写真のメタデータ

- EXIF 情報が自動的に読み取られます
- 位置情報や撮影設定が保存されます

## デプロイ方法

1. Vercel へのデプロイ（推奨）

   - GitHub リポジトリと連携
   - main ブランチへのプッシュで自動デプロイ

2. 手動デプロイ

```bash
npm run build
npm run start
```

## 開発ガイドライン

### コーディング規約

- ESLint と Prettier を使用
- コンポーネントは TypeScript で記述
- CSS は Tailwind CSS を使用

### ブランチ戦略

- `main`: 本番環境用
- `develop`: 開発用
- `feature/*`: 機能追加用

### コミットメッセージ

```
feat: 新機能の追加
fix: バグ修正
docs: ドキュメントの更新
style: コードスタイルの修正
refactor: リファクタリング
```

## トラブルシューティング

### よくある問題と解決方法

1. 記事が表示されない

   - Front Matter の形式を確認
   - ファイル名の形式を確認

2. 画像が表示されない

   - 画像パスが正しいか確認
   - 画像形式がサポートされているか確認（jpg, png, webp）

3. ビルドエラー
   - `npm install`を再実行
   - `.next`ディレクトリを削除して再ビルド

## 貢献ガイド

1. Issue を作成
2. ブランチを作成（`feature/xxx`）
3. 変更を実装
4. テストを実行
5. プルリクエストを作成

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 連絡先

- 作者: [あなたの名前]
- ブログ: [ブログ URL]
- Twitter: [@username]
