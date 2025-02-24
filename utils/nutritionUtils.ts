import type { FoodItem, RecipeNutrition } from "@/types/nutrition";
import foodDatabase from "@/data/food-database.json";

// 単位変換用の係数
const UNIT_CONVERSION = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  ml: 1,
  L: 1000,
  "大さじ": 15,
  "小さじ": 5,
  "カップ": 200,
  "個": null,  // 食材ごとに異なる
};

// 数量を抽出する正規表現
const AMOUNT_REGEX = /(\d+(?:\.\d+)?)\s*([^\d\s]+)/;

/**
 * 文字列から数量と単位を抽出
 */
function parseAmount(amountStr: string): { value: number; unit: string } | null {
  const match = AMOUNT_REGEX.exec(amountStr);
  if (!match) return null;

  return {
    value: parseFloat(match[1]),
    unit: match[2],
  };
}

/**
 * 食材の基本情報を検索
 */
function findFoodItem(name: string): FoodItem | null {
  return (foodDatabase as FoodItem[]).find(item => 
    item.name === name || item.name.includes(name) || name.includes(item.name)
  ) || null;
}

/**
 * 分量を基準量に変換
 */
function convertToBaseAmount(amount: number, fromUnit: string, toUnit: string): number {
  const fromFactor = UNIT_CONVERSION[fromUnit as keyof typeof UNIT_CONVERSION];
  const toFactor = UNIT_CONVERSION[toUnit as keyof typeof UNIT_CONVERSION];

  if (fromFactor === null || toFactor === null) {
    return amount; // 変換できない場合は元の値をそのまま返す
  }

  return (amount * fromFactor) / toFactor;
}

/**
 * レシピの栄養価を計算
 */
export function calculateRecipeNutrition(
  ingredients: { name: string; amount: string; items?: { name: string; amount: string }[] }[],
  servings: string
): RecipeNutrition {
  const servingCount = parseInt(servings.match(/\d+/)?.[0] || "1");
  const result: RecipeNutrition = {
    ingredients: [],
    totalNutrients: {
      energy: 0,
      protein: 0,
      fat: 0,
      carbohydrate: 0,
      sodium: 0,
    },
    perServing: {
      energy: 0,
      protein: 0,
      fat: 0,
      carbohydrate: 0,
      sodium: 0,
    },
  };

  // 各材料の栄養価を計算
  ingredients.forEach(ingredient => {
    if (ingredient.items) {
      // グループ化された材料の処理
      ingredient.items.forEach(item => {
        const itemNutrition = calculateIngredientNutrition(item.name, item.amount);
        if (itemNutrition) {
          result.ingredients.push({
            name: item.name,
            amount: item.amount,
            nutrients: itemNutrition,
          });
          // 合計に加算
          Object.keys(itemNutrition).forEach(key => {
            result.totalNutrients[key as keyof typeof itemNutrition] += 
              itemNutrition[key as keyof typeof itemNutrition];
          });
        }
      });
    } else {
      // 通常の材料の処理
      const nutrition = calculateIngredientNutrition(ingredient.name, ingredient.amount);
      if (nutrition) {
        result.ingredients.push({
          name: ingredient.name,
          amount: ingredient.amount,
          nutrients: nutrition,
        });
        // 合計に加算
        Object.keys(nutrition).forEach(key => {
          result.totalNutrients[key as keyof typeof nutrition] += 
            nutrition[key as keyof typeof nutrition];
        });
      }
    }
  });

  // 1人分の栄養価を計算
  Object.keys(result.totalNutrients).forEach(key => {
    result.perServing[key as keyof typeof result.perServing] = 
      result.totalNutrients[key as keyof typeof result.totalNutrients] / servingCount;
  });

  return result;
}

/**
 * 個々の材料の栄養価を計算
 */
function calculateIngredientNutrition(
  name: string,
  amountStr: string
): { energy: number; protein: number; fat: number; carbohydrate: number; sodium: number } | null {
  const foodItem = findFoodItem(name);
  if (!foodItem) return null;

  const parsedAmount = parseAmount(amountStr);
  if (!parsedAmount) return null;

  const baseAmount = convertToBaseAmount(
    parsedAmount.value,
    parsedAmount.unit,
    foodItem.unit
  );

  const ratio = baseAmount / foodItem.baseAmount;

  return {
    energy: foodItem.nutrients.energy * ratio,
    protein: foodItem.nutrients.protein * ratio,
    fat: foodItem.nutrients.fat * ratio,
    carbohydrate: foodItem.nutrients.carbohydrate * ratio,
    sodium: foodItem.nutrients.sodium * ratio,
  };
} 