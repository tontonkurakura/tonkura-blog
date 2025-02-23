---
title: "React Hooks完全ガイド：基本から実践的な使い方まで"
date: "2024-03-10"
tags: ["プログラミング", "React", "Hooks", "フロントエンド"]
description: "React Hooksの基本的な使い方から、カスタムHooksの作成まで、実践的な例を交えて解説します。"
---

React Hooks は、関数コンポーネントで状態管理やライフサイクルの制御を可能にする機能です。この記事では、主要な Hooks の使い方と実践的なパターンについて解説します。

## useState

最も基本的な Hook で、コンポーネントに状態を追加します。

```javascript
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>増やす</button>
    </div>
  );
}
```

## useEffect

副作用（データフェッチ、購読、DOM の直接操作など）を扱うための Hook です。

```javascript
import { useEffect, useState } from "react";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    }
    fetchUser();
  }, [userId]);

  if (!user) return <div>Loading...</div>;
  return <div>{user.name}</div>;
}
```

## useContext

コンテキストを購読するための Hook です。

```javascript
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return (
    <button style={{ background: theme.background, color: theme.foreground }}>
      テーマ付きボタン
    </button>
  );
}
```

## カスタム Hooks

独自の Hooks を作成して、ロジックを再利用できます。

```javascript
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
```

## Hooks の規則

Hooks を使用する際は、以下の規則に従う必要があります：

1. トップレベルでのみ呼び出す
2. React の関数内でのみ呼び出す

## まとめ

React Hooks を使用することで、より簡潔で再利用可能なコードを書くことができます。基本的な Hooks を理解し、必要に応じてカスタム Hooks を作成することで、効率的な React アプリケーションの開発が可能になります。
