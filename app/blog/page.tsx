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
  // searchParamsをawaitする
  const params = await searchParams;

  const page = params?.page || "1";
  const tag = params?.tag;
  const query = params?.q;

  const currentPage = Number(page);
  const { posts, totalPages } = await getPostList(currentPage, 10, {
    tag: tag,
    searchQuery: query,
  });

  const tagCounts = await getTagCounts();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* メインコンテンツ */}
        <main className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-8 font-mplus">
            {tag
              ? `${tag}の記事一覧`
              : query
                ? `「${query}」の検索結果`
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
                      {post.tags.map((postTag) => (
                        <Link
                          key={postTag}
                          href={`/blog?tag=${encodeURIComponent(postTag)}`}
                          className={`px-2 py-1 rounded-full text-xs ${
                            postTag === tag
                              ? "bg-blue-600 text-white"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          {postTag}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              ))
            ) : (
              <p className="text-gray-500">
                {query
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
                  tag ? `?tag=${tag}` : ""
                }${query ? `?q=${query}` : ""}`}
              />
            </div>
          )}
        </main>

        {/* サイドバー */}
        <aside className="md:w-1/4">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchBox />
            <TagSidebar tagCounts={tagCounts} selectedTag={tag} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
