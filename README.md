# Tonkura Blog

Next.jsで構築された個人ブログサイトです。

## 機能

- Markdownベースのブログ投稿
- 写真ギャラリー
- タグによる記事の分類
- レスポンシブデザイン
- シンタックスハイライト
- SEO対策

## 開発環境のセットアップ

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

## ブログ記事の作成

### 新規記事の作成

```bash
# 新規記事作成コマンド
npm run new-post "記事のタイトル"
```

### 記事のテンプレート

```markdown
---
title: "記事のタイトル"
date: "2024-03-27"
tags: ["タグ1", "タグ2"]
description: "記事の説明文"
---

ここに記事の内容を書きます。
```

## 写真ギャラリーの管理

1. `content/photos`ディレクトリに写真を配置
2. 以下のコマンドを実行して写真情報を更新：

```bash
npm run generate-photo-yaml
```

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- MDX
