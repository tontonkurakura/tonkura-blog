import { getAllPosts } from "@/utils/markdown";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import TagSidebar from "./TagSidebar";
import SearchBox from "./SearchBox";
import { Suspense } from "react";

interface TagCount {
  [key: string]: number;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { tag?: string; q?: string };
}) {
  const allPosts = await getAllPosts();
  const selectedTag = searchParams.tag;
  const searchQuery = searchParams.q?.toLowerCase();

  // neurologyディレクトリ以外の記事のみをフィルタリング
  const blogPosts = allPosts
    .filter((post) => !post.category.startsWith("neurology"))
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

  // タグの集計
  const tagCounts: TagCount = {};
  blogPosts.forEach((post) => {
    post.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // 検索クエリとタグでフィルタリング
  let filteredPosts = blogPosts;

  if (searchQuery) {
    filteredPosts = filteredPosts.filter((post) => {
      const searchTarget = `${post.title} ${post.description || ""} ${
        post.content || ""
      }`.toLowerCase();
      return searchTarget.includes(searchQuery);
    });
  }

  if (selectedTag) {
    filteredPosts = filteredPosts.filter((post) =>
      post.tags?.includes(selectedTag)
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row gap-8">
        {/* メインコンテンツ */}
        <main className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-8 font-mplus">
            {selectedTag
              ? `${selectedTag}の記事一覧`
              : searchQuery
              ? `「${searchQuery}」の検索結果`
              : "ブログ記事一覧"}
          </h1>

          <div className="grid grid-cols-1 gap-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
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
                            tag === selectedTag
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
                {searchQuery
                  ? "検索条件に一致する記事が見つかりませんでした。"
                  : "記事がありません。"}
              </p>
            )}
          </div>
        </main>

        {/* サイドバー */}
        <aside className="md:w-1/4">
          <Suspense fallback={<div>Loading...</div>}>
            <SearchBox />
            <TagSidebar tagCounts={tagCounts} selectedTag={selectedTag} />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
