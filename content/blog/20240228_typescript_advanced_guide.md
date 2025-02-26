---
title: TypeScriptの高度な型システム：ジェネリクス、ユーティリティ型、型推論
date: '2024-02-28'
tags:
  - プログラミング
  - TypeScript
  - 型システム
  - JavaScript
description: TypeScriptの高度な型システムについて、実践的な例を交えて解説します。
lastmod: '2025-02-26'
---

TypeScript の型システムは非常に強力で、多くの高度な機能を提供しています。この記事では、よく使用される高度な型機能について解説します。

## ジェネリクス

ジェネリクスを使用することで、型を引数として受け取る汎用的なコードを書くことができます。

### 基本的な使い方

```typescript
function identity<T>(arg: T): T {
  return arg;
}

// 使用例
const num = identity<number>(123); // number型
const str = identity<string>("hello"); // string型
```

### 制約付きジェネリクス

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(arg: T): number {
  return arg.length;
}

// 使用例
logLength("hello"); // OK
logLength([1, 2, 3]); // OK
logLength({ length: 10 }); // OK
logLength(123); // エラー
```

## ユーティリティ型

TypeScript には、型を変換するための便利なユーティリティ型が用意されています。

### Partial

オブジェクトの全てのプロパティをオプショナルにします。

```typescript
interface User {
  name: string;
  age: number;
  email: string;
}

type PartialUser = Partial<User>;
// { name?: string; age?: number; email?: string; }
```

### Pick

指定したプロパティのみを選択します。

```typescript
type UserBasicInfo = Pick<User, "name" | "age">;
// { name: string; age: number; }
```

### Omit

指定したプロパティを除外します。

```typescript
type UserWithoutEmail = Omit<User, "email">;
// { name: string; age: number; }
```

## 高度な型機能

### 条件付き型（Conditional Types）

```typescript
type IsString<T> = T extends string ? true : false;

// 使用例
type A = IsString<string>; // true
type B = IsString<number>; // false
```

### マップ型（Mapped Types）

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 使用例
type ReadonlyUser = Readonly<User>;
```

### テンプレートリテラル型

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;

// 使用例
type MouseEvents = EventName<"click" | "mousedown">;
// "onClick" | "onMousedown"
```

## 型推論の活用

TypeScript の型推論を活用することで、より簡潔なコードを書くことができます。

### 関数の戻り値の型推論

```typescript
function createUser(name: string, age: number) {
  return { name, age, createdAt: new Date() };
}

// 戻り値の型は自動的に推論される
const user = createUser("John", 30);
```

### Promise 型の推論

```typescript
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// レスポンスの型を明示的に指定
type UserResponse = {
  id: string;
  name: string;
  age: number;
};

const user = (await fetchUser("123")) as UserResponse;
```

## ベストプラクティス

1. **型の再利用**

   - 共通の型は別ファイルで定義
   - 型の合成を活用

2. **型安全性の確保**

   - `any`の使用を最小限に
   - 厳格な型チェックを有効に

3. **型推論の活用**
   - 過度な型注釈を避ける
   - コンパイラの支援を活用

## まとめ

TypeScript の高度な型システムを理解し活用することで、より安全で保守性の高いコードを書くことができます。ただし、複雑すぎる型定義は避け、必要に応じて適切なレベルの型安全性を選択することが重要です。
