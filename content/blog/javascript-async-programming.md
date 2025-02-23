---
title: "JavaScriptの非同期プログラミング：Promise、async/awaitの完全ガイド"
date: "2024-03-05"
tags: ["プログラミング", "JavaScript", "非同期処理", "Promise", "async/await"]
description: "JavaScriptにおける非同期プログラミングの概念と、Promise、async/awaitを使用した実装方法について詳しく解説します。"
---

JavaScript の非同期プログラミングは、モダンな Web 開発において重要な概念です。この記事では、Promise と async/await を中心に、非同期処理の実装方法について解説します。

## 非同期処理とは

非同期処理は、時間のかかる処理（API リクエスト、ファイル操作など）を実行する際に、処理の完了を待たずに次の処理を実行できる仕組みです。

## Promise の基本

Promise は、非同期処理の結果を表すオブジェクトです。

```javascript
const myPromise = new Promise((resolve, reject) => {
  // 非同期処理
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve("処理が成功しました");
    } else {
      reject("エラーが発生しました");
    }
  }, 1000);
});

myPromise
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

## async/await

async/await は、Promise をより直感的に扱うための構文です。

```javascript
async function fetchUserData() {
  try {
    const response = await fetch("https://api.example.com/user");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
}
```

## 実践的な例

複数の非同期処理を組み合わせる例を見てみましょう：

```javascript
async function processUserData() {
  try {
    const userData = await fetchUserData();
    const userPosts = await fetchUserPosts(userData.id);
    const enrichedData = await enrichUserData(userData, userPosts);
    return enrichedData;
  } catch (error) {
    console.error("データ処理中にエラーが発生しました:", error);
  }
}
```

## まとめ

非同期プログラミングは、モダンな JavaScript アプリケーションにおいて必須のスキルです。Promise と async/await を適切に使用することで、複雑な非同期処理も見通しよく実装できます。
