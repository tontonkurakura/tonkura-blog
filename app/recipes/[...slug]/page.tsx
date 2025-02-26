import { Metadata } from "next";
import path from "path";
import { getRecipeData } from "@/utils/recipeUtils";
import Link from "next/link";

interface Props {
  params: { slug: string[] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const routeParams = await params;
  const fullPath =
    path.join(process.cwd(), "content", "recipes", ...routeParams.slug) + ".md";
  const recipe = await getRecipeData(fullPath);

  return {
    title: recipe.title,
    description: recipe.description || "",
  };
}

export default async function RecipePage({ params }: Props) {
  const routeParams = await params;
  const fullPath =
    path.join(process.cwd(), "content", "recipes", ...routeParams.slug) + ".md";
  const recipe = await getRecipeData(fullPath);

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* 戻るリンク */}
      <div className="mb-6">
        <Link
          href="/recipes"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          レシピ一覧に戻る
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* メインコンテンツ */}
        <article className="prose prose-lg md:w-3/4">
          <h1 className="text-3xl font-bold mb-4 font-mplus">{recipe.title}</h1>

          {recipe.description && (
            <p className="text-gray-600 text-lg mb-4">{recipe.description}</p>
          )}

          {(recipe.genreTags.length > 0 ||
            recipe.ingredientTags.length > 0) && (
            <div className="mb-8 not-prose">
              <div className="flex flex-wrap gap-2">
                {recipe.genreTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/recipes?tag=${encodeURIComponent(tag)}`}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
                {recipe.ingredientTags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/recipes?tag=${encodeURIComponent(tag)}`}
                    className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs hover:bg-green-100 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div
            className="font-mplus"
            dangerouslySetInnerHTML={{ __html: recipe.content }}
          />
        </article>

        {/* 右サイドバー */}
        <aside className="md:w-1/4">
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">分量</span>
                  <span className="font-medium">{recipe.servings}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">準備時間</span>
                  <span className="font-medium">{recipe.prepTime}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">調理時間</span>
                  <span className="font-medium">{recipe.cookTime}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">カロリー</span>
                  <span className="font-medium">
                    {recipe.calories || "---"}
                  </span>
                </div>
              </div>
            </div>

            {/* 材料 */}
            <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
              <h2 className="text-lg font-semibold mb-3">材料</h2>
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => {
                  if (ingredient.items) {
                    // グループ化された材料の表示
                    return (
                      <div key={index}>
                        <div className="font-medium border-b border-gray-300 pb-1 mb-2 text-sm">
                          {ingredient.name}
                        </div>
                        <ul className="space-y-2">
                          {ingredient.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="flex justify-between items-center text-sm"
                            >
                              <span>{item.name}</span>
                              <span className="text-gray-600">
                                {item.amount}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }
                  // 通常の材料の表示
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center border-b border-gray-200 py-1 text-sm"
                    >
                      <span>{ingredient.name}</span>
                      <span className="text-gray-600">{ingredient.amount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
