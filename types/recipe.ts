import {
  BaseMetadata,
  ISODateString,
  PaginationInfo,
  SortDirection,
  SearchParams,
  Taggable,
} from "./common";
import { NutritionInfo } from "./nutrition";

/**
 * レシピの材料を表す型
 */
export interface Ingredient {
  /** 材料の名前 */
  name: string;
  /** 材料の量（例: "100g"、"大さじ1"など） */
  amount: string;
  /** グループ化された材料のための配列（例: ソース用の材料など） */
  items?: Ingredient[];
  /** 材料の注意点やメモ */
  note?: string;
  /** 材料の代替品 */
  alternatives?: string[];
  /** 材料の栄養情報 */
  nutrition?: NutritionInfo;
  /** 材料の単価 */
  price?: number;
  /** 材料の季節性 */
  seasonality?: string[];
  /** アレルゲン情報 */
  allergens?: string[];
}

/**
 * レシピの調理ステップを表す型
 */
export interface CookingStep {
  /** ステップ番号 */
  number: number;
  /** ステップの説明 */
  description: string;
  /** ステップの画像パス */
  imagePath?: string;
  /** ステップの調理時間（分） */
  timeRequired?: number;
  /** ステップで使用する調理器具 */
  equipment?: string[];
  /** ステップの注意点 */
  tips?: string[];
}

/**
 * レシピデータを表す型
 */
export interface RecipeData extends BaseMetadata, Taggable {
  /** レシピのID */
  id: string;
  /** レシピのタイトル */
  title: string;
  /** レシピの簡単な説明 */
  description?: string;
  /** 何人前か（例: "2人前"） */
  servings: string;
  /** 準備時間（例: "15分"） */
  prepTime: string;
  /** 調理時間（例: "30分"） */
  cookTime: string;
  /** 材料リスト */
  ingredients: Ingredient[];
  /** レシピの手順（HTML形式） */
  content: string;
  /** 調理ステップのリスト */
  steps?: CookingStep[];
  /** レシピの公開日（ISO 8601形式の文字列 'YYYY-MM-DD'） */
  date?: ISODateString;
  /** レシピのジャンルタグ（例: "和食", "洋食", "中華"など） */
  genreTags: string[];
  /** 主要材料タグ（例: "鶏肉", "豚肉", "野菜"など） */
  ingredientTags: string[];
  /** レシピのカテゴリ（例: "主菜", "副菜", "デザート"など） */
  category?: string;
  /** カロリー情報（例: "300kcal/人"） */
  calories: string;
  /** 調理器具 */
  equipment?: string[];
  /** 調理難易度（1-5の数値） */
  difficulty?: number;
  /** レシピの画像パス */
  imagePath?: string;
  /** 調理のコツや注意点 */
  tips?: string[];
  /** レシピの最終更新日 */
  lastModified?: ISODateString;
  /** 栄養情報 */
  nutritionInfo?: NutritionInfo;
  /** レシピの評価（1-5の数値） */
  rating?: number;
  /** 評価の数 */
  ratingCount?: number;
  /** レシピの合計予算 */
  totalCost?: number;
  /** 料理動画のURL */
  videoUrl?: string;
  /** アレルゲン情報 */
  allergens?: string[];
  /** メインの調理方法（「焼く」,「煮る」,「蒸す」など） */
  cookingMethod?: string;
  /** 季節性（「春」,「夏」,「秋」,「冬」,「通年」） */
  season?: string | string[];
}

/**
 * レシピの一覧を取得するための関数の戻り値の型
 */
export interface RecipeListResponse {
  /** 現在のページのレシピ一覧 */
  recipes: RecipeData[];
  /** 全レシピ数 */
  total: number;
  /** 全ページ数 */
  totalPages: number;
  /** 現在のページ番号 */
  currentPage: number;
  /** ページネーション情報 */
  pagination?: PaginationInfo;
}

/**
 * レシピの検索・フィルタリングオプションを表す型
 */
export interface RecipeFilterOptions extends SearchParams {
  /** カテゴリでのフィルタリング */
  category?: string;
  /** ジャンルでのフィルタリング */
  genre?: string;
  /** 材料でのフィルタリング */
  ingredient?: string;
  /** タグでのフィルタリング */
  tag?: string;
  /** 調理時間の上限（分） */
  maxCookTime?: number;
  /** 難易度でのフィルタリング */
  difficulty?: number;
  /** カロリー範囲でのフィルタリング */
  calorieRange?: {
    min?: number;
    max?: number;
  };
  /** ソート条件 */
  sortBy?: "date" | "title" | "cookTime" | "difficulty" | "calories" | "rating";
  /** ソート順序 */
  sortDirection?: SortDirection;
  /** 予算の範囲 */
  budgetRange?: {
    min?: number;
    max?: number;
  };
  /** アレルゲン除外リスト */
  excludeAllergens?: string[];
  /** 調理方法でのフィルタリング */
  cookingMethod?: string;
  /** 季節でのフィルタリング */
  season?: string;
}

/**
 * レシピコレクション（カテゴリなど）を表す型
 */
export interface RecipeCollection extends BaseMetadata, Taggable {
  /** コレクションID */
  id: string;
  /** コレクション名 */
  name: string;
  /** コレクションの説明 */
  description?: string;
  /** コレクションの画像パス */
  imagePath?: string;
  /** コレクションに含まれるレシピIDのリスト */
  recipeIds: string[];
  /** コレクションのスラッグ（URL用） */
  slug: string;
  /** コレクションの作成日 */
  createdAt: ISODateString;
  /** コレクションの更新日 */
  updatedAt?: ISODateString;
  /** 表示順序 */
  order?: number;
  /** 親コレクションID（階層構造の場合） */
  parentId?: string;
}
