"use server";

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { RecipeData } from "@/types/recipe";

const recipeDirectory = path.join(process.cwd(), "content", "recipes");

// ジャンルタグの定義
const GENRE_TAGS = new Set([
  // 料理の地域性
  "和食",
  "洋食",
  "中華",
  "韓国料理",
  "イタリアン",
  "フレンチ",
  "エスニック",
  "タイ料理",
  "インド料理",
  "スパニッシュ",

  // 料理の種類
  "メイン",
  "副菜",
  "前菜",
  "スープ",
  "サラダ",
  "デザート",
  "おつまみ",

  // 調理方法
  "煮物",
  "焼き物",
  "揚げ物",
  "蒸し物",
  "炒め物",
  "グリル",
  "ロースト",

  // 料理のカテゴリ
  "麺料理",
  "ご飯物",
  "パスタ",
  "野菜料理",
  "肉料理",
  "魚料理",
  "卵料理",
  "豆腐料理",

  // シーン・目的
  "作り置き",
  "お弁当",
  "時短",
  "おもてなし",
  "パーティー",
  "お正月",
  "おせち",
  "クリスマス",

  // 季節性
  "春料理",
  "夏料理",
  "秋料理",
  "冬料理",
]);

// タグを分類する関数
export async function categorizeTag(tag: string): Promise<"genre" | "ingredient"> {
  return GENRE_TAGS.has(tag) ? "genre" : "ingredient";
}

export async function getRecipeData(fullPath: string): Promise<RecipeData> {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);

  const contentHtml = processedContent.toString();

  // タグを分類
  const genreTags =
    data.tags?.filter((tag: string) => categorizeTag(tag) === "genre") || [];
  const ingredientTags =
    data.tags?.filter((tag: string) => categorizeTag(tag) === "ingredient") ||
    [];

  return {
    id: path.relative(recipeDirectory, fullPath).replace(/\.md$/, ""),
    title: data.title,
    description: data.description,
    servings: data.servings,
    prepTime: data.prepTime,
    cookTime: data.cookTime,
    ingredients: data.ingredients,
    content: contentHtml,
    date: data.date,
    tags: data.tags,
    genreTags,
    ingredientTags,
    category: data.category,
    calories: data.calories || "---",
  };
}

export async function getAllRecipes(): Promise<RecipeData[]> {
  const recipes: RecipeData[] = [];

  // レシピディレクトリが存在しない場合は作成
  if (!fs.existsSync(recipeDirectory)) {
    fs.mkdirSync(recipeDirectory, { recursive: true });
  }

  const fileNames = fs.readdirSync(recipeDirectory);

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".md")) continue;
    const fullPath = path.join(recipeDirectory, fileName);
    recipes.push(await getRecipeData(fullPath));
  }

  // 日付でソート（新しい順）
  return recipes.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });
}
