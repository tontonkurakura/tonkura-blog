"use client";

import Link from "next/link";

interface TagSidebarProps {
  tagCounts: { [key: string]: number };
  selectedTag?: string;
}

export default function TagSidebar({
  tagCounts,
  selectedTag,
}: TagSidebarProps) {
  // タグを記事数で降順ソート
  const sortedTags = Object.entries(tagCounts).sort((a, b) => {
    // 記事数が同じ場合はタグ名でソート
    if (b[1] === a[1]) {
      return a[0].localeCompare(b[0]);
    }
    return b[1] - a[1];
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-3 font-mplus">タグ一覧</h2>

      <div className="space-y-1">
        <Link
          href="/blog"
          className={`block px-3 py-1.5 rounded transition-colors text-sm ${
            !selectedTag
              ? "bg-blue-50 text-blue-600"
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          すべての記事
        </Link>

        {sortedTags.map(([tag, count]) => (
          <Link
            key={tag}
            href={`/blog?tag=${encodeURIComponent(tag)}`}
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
  );
}
