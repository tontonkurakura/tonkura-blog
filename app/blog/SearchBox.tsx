"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchBoxProps {
  baseUrl?: string;
}

export default function SearchBox({ baseUrl = "/blog" }: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // debounce処理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // URLの更新
  useEffect(() => {
    if (debouncedQuery !== searchParams.get("q")) {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedQuery) {
        params.set("q", debouncedQuery);
      } else {
        params.delete("q");
      }
      router.push(`${baseUrl}?${params.toString()}`);
    }
  }, [debouncedQuery, router, searchParams, baseUrl]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-3 font-mplus">
        {baseUrl === "/recipes" ? "レシピを検索" : "記事を検索"}
      </h2>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="キーワードを入力..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
