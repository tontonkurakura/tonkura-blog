// 食品アイテムの型定義
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbohydrate: number;
  fiber?: number;
  sodium?: number;
  vitaminA?: number;
  vitaminC?: number;
  calcium?: number;
  iron?: number;
}

// レシピの栄養情報の型定義
export interface RecipeNutrition {
  servings: number;
  perServing: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrate: number;
    fiber?: number;
    sodium?: number;
    vitaminA?: number;
    vitaminC?: number;
    calcium?: number;
    iron?: number;
  };
  total: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrate: number;
    fiber?: number;
    sodium?: number;
    vitaminA?: number;
    vitaminC?: number;
    calcium?: number;
    iron?: number;
  };
} 