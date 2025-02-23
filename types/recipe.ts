export interface Ingredient {
  name: string;
  amount: string;
  items?: Ingredient[]; // グループ化された材料のための配列
}

export interface RecipeData {
  id: string;
  title: string;
  description?: string;
  servings: string;
  prepTime: string;
  cookTime: string;
  ingredients: Ingredient[];
  content: string;
  date?: string;
  tags?: string[];
  genreTags: string[];
  ingredientTags: string[];
  category?: string;
  calories: string;
}
