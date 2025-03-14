import { getAllRecipes, categorizeTag } from "@/utils/recipeUtils";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import SearchBox from "../blog/SearchBox";
import { Suspense } from "react";
import Pagination from "@/components/Pagination";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface TagCount {
  [key: string]: number;
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: { tag?: string; q?: string; page?: string };
}) {
  // 常にホームページにリダイレクト
  redirect("/");

  // 以下のコードは到達不能
  const selectedTag = searchParams?.tag;
  const searchQuery = searchParams?.q?.toLowerCase();
  const currentPage = Number(searchParams?.page || "1");
  const recipesPerPage = 10;

  // データの取得
  const allRecipes = await getAllRecipes();

  // タグの集計
  const genreTagCounts: TagCount = {};
  const ingredientTagCounts: TagCount = {};

  for (const recipe of allRecipes) {
    if (recipe.tags) {
      for (const tag of recipe.tags) {
        const category = await categorizeTag(tag);
        if (category === "genre") {
          genreTagCounts[tag] = (genreTagCounts[tag] || 0) + 1;
        } else {
          ingredientTagCounts[tag] = (ingredientTagCounts[tag] || 0) + 1;
        }
      }
    }
  }

  // 検索とタグでフィルタリング
  let filteredRecipes = allRecipes;

  if (searchQuery) {
    filteredRecipes = filteredRecipes.filter((recipe) => {
      // 材料名を全て取得
      const ingredientNames = (recipe.ingredients || [])
        .map((ingredient) => {
          if (ingredient.items) {
            return [
              ingredient.name,
              ...(ingredient.items || []).map((item) => item.name),
            ];
          }
          return ingredient.name;
        })
        .flat()
        .join(" ");

      // タグを結合
      const tags = recipe.tags?.join(" ") || "";

      // 検索対象を結合
      const searchTarget = `${recipe.title} ${recipe.description || ""} ${
        recipe.content || ""
      } ${ingredientNames} ${tags}`.toLowerCase();

      return searchTarget.includes(searchQuery);
    });
  }

  if (selectedTag) {
    filteredRecipes = filteredRecipes.filter((recipe) =>
      recipe.tags?.includes(selectedTag)
    );
  }

  // ページネーション用のレシピの抽出
  const startIndex = (currentPage - 1) * recipesPerPage;
  const paginatedRecipes = filteredRecipes.slice(
    startIndex,
    startIndex + recipesPerPage
  );
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

  // タグを記事数で降順ソート
  const sortTags = (tagCounts: TagCount) =>
    Object.entries(tagCounts).sort((a, b) => {
      if (b[1] === a[1]) {
        return a[0].localeCompare(b[0]);
      }
      return b[1] - a[1];
    });

  const sortedGenreTags = sortTags(genreTagCounts);
  const sortedIngredientTags = sortTags(ingredientTagCounts);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* メインコンテンツ */}
        <main className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-8 font-mplus">
            {selectedTag
              ? `${selectedTag}のレシピ`
              : searchQuery
                ? `「${searchQuery}」の検索結果`
                : "Recipes"}
          </h1>

          {!selectedTag && !searchQuery && (
            <p className="text-gray-600 mb-8">
              普段よく作るレシピをまとめています。
            </p>
          )}

          <div className="grid grid-cols-1 gap-6">
            {paginatedRecipes.length > 0 ? (
              paginatedRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <Link href={`/recipes/${recipe.id}`}>
                    <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                      {recipe.title}
                    </h2>
                  </Link>

                  {recipe.description && (
                    <p className="text-gray-600 mb-4">{recipe.description}</p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">分量：</span>
                      {recipe.servings}
                    </div>
                    <div>
                      <span className="font-medium">準備時間：</span>
                      {recipe.prepTime}
                    </div>
                    <div>
                      <span className="font-medium">調理時間：</span>
                      {recipe.cookTime}
                    </div>
                  </div>

                  {recipe.date && (
                    <div className="text-sm text-gray-600 mb-3">
                      {format(new Date(recipe.date), "yyyy年MM月dd日", {
                        locale: ja,
                      })}
                    </div>
                  )}

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(recipe.genreTags || []).map((tag) => (
                        <Link
                          key={tag}
                          href={`/recipes?tag=${encodeURIComponent(tag)}`}
                          className={`px-2 py-1 rounded-full text-xs ${
                            tag === selectedTag
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          } transition-colors`}
                        >
                          {tag}
                        </Link>
                      ))}
                      {(recipe.ingredientTags || []).map((tag) => (
                        <Link
                          key={tag}
                          href={`/recipes?tag=${encodeURIComponent(tag)}`}
                          className={`px-2 py-1 rounded-full text-xs ${
                            tag === selectedTag
                              ? "bg-green-600 text-white"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          } transition-colors`}
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="text-gray-500">
                {selectedTag
                  ? "選択したタグのレシピが見つかりませんでした。"
                  : "まだレシピがありません。"}
              </p>
            )}
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/recipes${selectedTag ? `?tag=${selectedTag}` : ""}${
                  searchQuery ? `?q=${searchQuery}` : ""
                }`}
              />
            </div>
          )}
        </main>

        {/* サイドバー */}
        <aside className="md:w-1/4 space-y-6">
          {/* 検索ボックス */}
          <Suspense fallback={<div>Loading...</div>}>
            <SearchBox baseUrl="/recipes" />
          </Suspense>

          {/* ジャンルタグ */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 font-mplus">ジャンル</h2>

            <div className="space-y-1">
              {sortedGenreTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/recipes?tag=${encodeURIComponent(tag)}`}
                  className={`block px-3 py-1.5 rounded transition-colors text-sm ${
                    tag === selectedTag
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{tag}</span>
                    <span className="text-xs text-gray-500">({count})</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* 食材タグ */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-3 font-mplus">食材</h2>

            <div className="space-y-1">
              {sortedIngredientTags.map(([tag, count]) => (
                <Link
                  key={tag}
                  href={`/recipes?tag=${encodeURIComponent(tag)}`}
                  className={`block px-3 py-1.5 rounded transition-colors text-sm ${
                    tag === selectedTag
                      ? "bg-green-50 text-green-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{tag}</span>
                    <span className="text-xs text-gray-500">({count})</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* すべてのレシピリンク */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <Link
              href="/recipes"
              className={`block px-3 py-1.5 rounded transition-colors text-sm ${
                !selectedTag
                  ? "bg-gray-100 text-gray-800"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              すべてのレシピ
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
