# Tonkura Blog

Next.jsで構築された個人ブログサイトです。

## 機能

- Markdownベースのブログ投稿
- 神経学データベース（解剖学、疾患、検査、症候、治療）
- 脳画像ビジュアライゼーション（3D脳アトラス、白質路）
- 写真ギャラリー
- 臨床計算ツール（NIHSS、MMSE、HDSRなど）
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

1. `public/images/`ディレクトリに写真を配置
2. 以下のコマンドを実行して写真情報を更新：

```bash
npm run generate-photo-yaml
```

## 神経学データベースの更新

`content/neurology/`ディレクトリ内のMarkdownファイルを編集：

- `Neuroanatomy/` - 解剖学
- `Diseases/` - 疾患
- `Examination/` - 検査
- `Symptoms/` - 症候
- `Treatment/` - 治療

## その他のコマンド

```bash
# 最終更新日の手動更新
npm run update-lastmod

# コードフォーマット
npm run format

# セキュリティチェック
npm run security-check
```

## 技術スタック

- Next.js
- TypeScript
- Tailwind CSS
- MDX
