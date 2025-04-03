import {
  BaseMetadata,
  ISODateString,
  PaginationInfo,
  SearchParams,
  Taggable,
} from "./common";

/**
 * 栄養素の単位を表す型
 */
export type NutrientUnit = "g" | "mg" | "μg" | "kcal" | "IU" | "ml" | "%";

/**
 * 栄養素の詳細情報を表す型
 */
export interface NutrientDetail {
  /** 栄養素名 */
  name: string;
  /** 栄養素値 */
  value: number;
  /** 単位 */
  unit: NutrientUnit;
  /** 1日あたりの推奨摂取量に対する割合 (%) */
  percentDailyValue?: number;
}

/**
 * 栄養計算のための栄養素情報を共通化した型
 */
export interface NutritionInfo {
  /** カロリー (kcal) */
  calories: number;
  /** タンパク質 (g) */
  protein: number;
  /** 脂質 (g) */
  fat: number;
  /** 炭水化物 (g) */
  carbohydrate: number;
  /** 食物繊維 (g) */
  fiber?: number;
  /** ナトリウム (mg) */
  sodium?: number;
  /** ビタミンA (μg) */
  vitaminA?: number;
  /** ビタミンC (mg) */
  vitaminC?: number;
  /** カルシウム (mg) */
  calcium?: number;
  /** 鉄分 (mg) */
  iron?: number;
  /** コレステロール (mg) */
  cholesterol?: number;
  /** 飽和脂肪酸 (g) */
  saturatedFat?: number;
  /** 糖質 (g) */
  sugars?: number;
  /** カリウム (mg) */
  potassium?: number;
  /** 詳細な栄養素情報 */
  details?: NutrientDetail[];
  /** PFCバランス（タンパク質:脂質:炭水化物の比率） */
  pfcRatio?: {
    protein: number;
    fat: number;
    carbohydrate: number;
  };
}

/**
 * 食品アイテムの型定義
 */
export interface FoodItem extends NutritionInfo, BaseMetadata, Taggable {
  /** 食品ID */
  id: string;
  /** 食品名 */
  name: string;
  /** 食品カテゴリ */
  category: string;
  /** 計量単位（例: "g", "個", "カップ"など） */
  unit: string;
  /** 1単位あたりの重量 (g) */
  weightPerUnit?: number;
  /** エネルギー源割合（タンパク質:脂質:炭水化物） */
  macroRatio?: string;
  /** 代替食品ID（類似食品のリスト） */
  alternatives?: string[];
  /** 食品の季節性（例: "夏", "冬"など） */
  seasonality?: string[];
  /** 画像パス */
  imagePath?: string;
  /** 参考価格（単位あたり） */
  price?: number;
  /** アレルゲン情報 */
  allergens?: string[];
  /** 産地 */
  origin?: string;
  /** 食品分類（生鮮、加工品など） */
  classification?: string;
  /** 食品メーカー */
  manufacturer?: string;
  /** 食品コード */
  foodCode?: string;
}

/**
 * レシピの栄養情報の型定義
 */
export interface RecipeNutrition {
  /** 何人前か */
  servings: number;
  /** 一人前あたりの栄養素情報 */
  perServing: NutritionInfo;
  /** レシピ全体の栄養素情報 */
  total: NutritionInfo;
}

/**
 * 日々の食事記録のエントリを表す型
 */
export interface MealEntry extends BaseMetadata {
  /** エントリID */
  id: string;
  /** 食事の日付 (ISO形式) */
  date: ISODateString;
  /** 食事の種類 ("breakfast", "lunch", "dinner", "snack") */
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  /** 食べた食品のリスト */
  items: Array<{
    /** 食品ID */
    foodId: string;
    /** 食品名 */
    name: string;
    /** 量 */
    amount: number;
    /** 単位 */
    unit: string;
    /** 栄養情報 */
    nutrition?: NutritionInfo;
  }>;
  /** 摂取した栄養素の合計 */
  totalNutrition: NutritionInfo;
  /** メモ */
  notes?: string;
  /** 料理写真パス */
  imagePath?: string;
  /** 満足度 (1-5) */
  satisfaction?: number;
  /** 場所（自宅、外食など） */
  location?: string;
  /** ユーザーID */
  userId: string;
}

/**
 * 栄養計算用の日次集計データを表す型
 */
export interface DailyNutritionSummary {
  /** 日付 (ISO形式) */
  date: ISODateString;
  /** 食事ごとの栄養素情報 */
  meals: {
    /** 朝食の栄養素情報 */
    breakfast?: NutritionInfo;
    /** 昼食の栄養素情報 */
    lunch?: NutritionInfo;
    /** 夕食の栄養素情報 */
    dinner?: NutritionInfo;
    /** 間食の栄養素情報 */
    snack?: NutritionInfo;
  };
  /** 1日の合計栄養素情報 */
  total: NutritionInfo;
  /** 目標値に対する達成率 (%) */
  achievements: {
    /** カロリー達成率 */
    calories: number;
    /** タンパク質達成率 */
    protein: number;
    /** その他の栄養素達成率 */
    [key: string]: number;
  };
  /** ユーザーID */
  userId: string;
  /** 水分摂取量 (ml) */
  waterIntake?: number;
}

/**
 * 栄養推奨値を表す型
 */
export interface NutritionRecommendation {
  /** 年齢カテゴリ */
  ageCategory: string;
  /** 性別 */
  gender: "male" | "female";
  /** アクティビティレベル */
  activityLevel: "low" | "moderate" | "high";
  /** カロリー推奨値 (kcal) */
  calories: number;
  /** 各栄養素の推奨値 */
  nutrients: {
    /** タンパク質推奨値 (g) */
    protein: { min: number; max: number };
    /** 脂質推奨値 (g) */
    fat: { min: number; max: number };
    /** 炭水化物推奨値 (g) */
    carbohydrate: { min: number; max: number };
    /** その他の栄養素 */
    [key: string]: { min: number; max: number };
  };
  /** 推奨PFCバランス */
  recommendedPfcRatio: {
    protein: number;
    fat: number;
    carbohydrate: number;
  };
}

/**
 * 栄養検索フィルターを表す型
 */
export interface NutritionSearchFilter extends SearchParams {
  /** カテゴリでフィルタリング */
  category?: string;
  /** 栄養素範囲でフィルタリング */
  nutrientRanges?: {
    /** フィルタリングする栄養素名 */
    [nutrient: string]: {
      min?: number;
      max?: number;
    };
  };
  /** アレルゲン除外リスト */
  excludeAllergens?: string[];
  /** 製造元でフィルタリング */
  manufacturer?: string;
  /** 産地でフィルタリング */
  origin?: string;
}
