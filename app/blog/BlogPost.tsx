"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface BlogPostProps {
  post: {
    id: string;
    title: string;
    description?: string;
    date?: string;
    tags?: string[];
  };
  selectedTag?: string;
}

export default function BlogPost({ post, selectedTag }: BlogPostProps) {
  return (
    <article className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
      <Link
        href={`/blog/${post.id}`}
        className="absolute inset-0 z-0"
        aria-label={post.title}
      />
      <div className="relative z-10">
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
          {post.title}
        </h2>

        {post.description && (
          <p className="text-gray-600 mb-4">{post.description}</p>
        )}

        {post.date && (
          <div className="text-sm text-gray-600 mb-3">
            {format(new Date(post.date), "yyyy年MM月dd日", { locale: ja })}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className={`px-2 py-1 rounded-full text-xs relative z-20 ${
                  tag === selectedTag
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
} 