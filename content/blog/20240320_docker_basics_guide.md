---
title: Docker入門：コンテナ技術の基礎から実践まで
date: '2024-03-20'
tags:
  - プログラミング
  - Docker
  - コンテナ
  - インフラ
  - DevOps
description: Dockerの基本概念から実践的な使い方まで、初心者にもわかりやすく解説します。
lastmod: '2025-02-26'
---

Docker は、アプリケーションを開発・配布・実行するためのプラットフォームです。この記事では、Docker の基本的な概念と使い方について解説します。

## Docker とは

Docker は、アプリケーションとその依存関係を「コンテナ」と呼ばれる軽量な実行環境にパッケージ化するツールです。

### 主な特徴

- 環境の一貫性
- 軽量な実行環境
- 迅速なデプロイ
- スケーラビリティ

## 基本的なコマンド

### イメージの操作

```bash
# イメージの取得
docker pull nginx

# イメージの一覧表示
docker images

# イメージの削除
docker rmi nginx
```

### コンテナの操作

```bash
# コンテナの起動
docker run -d -p 80:80 nginx

# コンテナの一覧表示
docker ps

# コンテナの停止
docker stop [CONTAINER_ID]
```

## Dockerfile の作成

アプリケーションのコンテナ化には、Dockerfile を作成します。

```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## Docker Compose

複数のコンテナを管理するためのツールです。

```yaml
version: "3"
services:
  web:
    build: .
    ports:
      - "3000:3000"
  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: example
```

## ベストプラクティス

1. **軽量なベースイメージの使用**

   - 公式イメージを優先
   - マルチステージビルドの活用

2. **レイヤーの最適化**

   - キャッシュの効果的な利用
   - 不要なファイルの削除

3. **セキュリティ対策**
   - 最小権限の原則
   - 脆弱性スキャンの実施

## まとめ

Docker を使用することで、開発環境の構築や本番環境へのデプロイが容易になります。基本的な概念を理解し、実践を重ねることで、効率的なアプリケーション開発が可能になります。
