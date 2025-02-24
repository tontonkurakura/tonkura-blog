import { getPostList, getTagCounts } from "@/utils/markdown";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import TagSidebar from "./TagSidebar";
import SearchBox from "./SearchBox";
import { Suspense } from "react";
import Pagination from "./Pagination";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { tag?: string; q?: string; page?: string };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const { posts, totalPages } = await getPostList(currentPage, 10, {
    tag: searchParams.tag,
    searchQuery: searchParams.q,
  });

  const tagCounts = await getTagCounts();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* メインコンテンツ */}
        <main className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-8 font-mplus">
            {searchParams.tag
              ? `${searchParams.tag}の記事一覧`
              : searchParams.q
              ? `「${searchParams.q}」の検索結果`
              : "ブログ記事一覧"}
          </h1>

          <div className="grid grid-cols-1 gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <Link href={`/blog/${post.id}`}>
                    <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  {post.description && (
                    <p className="text-gray-600 mb-4">{post.description}</p>
                  )}

                  {post.date && (
                    <div className="text-sm text-gray-600 mb-3">
                      {format(new Date(post.date), "yyyy年MM月dd日", {
                        locale: ja,
                      })}
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/blog?tag=${encodeURIComponent(tag)}`}
                          className={`px-2 py-1 rounded-full text-xs ${
                            tag === searchParams.tag
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
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
                {searchParams.q
                  ? "検索条件に一致する記事が見つかりませんでした。"
                  : "記事がありません。"}
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/blog${
                  searchParams.tag ? `?tag=${searchParams.tag}` : ""
                }${searchParams.q ? `?q=${searchParams.q}` : ""}`}
              />
            </div>
          )}
        </main>

        {/* サイドバー */}
        <aside className="md:w-1/4">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchBox />
            <TagSidebar tagCounts={tagCounts} selectedTag={searchParams.tag} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
