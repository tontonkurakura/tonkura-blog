"use client";

import Link from "next/link";
import { useState } from "react";
import { categories } from "@/constants/higherBrainFunction";

export default function HigherBrainFunctionPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // 検索フィルター関数
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/database"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          データベース一覧に戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          高次脳機能データベース
        </h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                このデータベースは現在開発段階です。内容は随時更新・修正されます。
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-600">
          高次脳機能障害の症候・疾患、検査について包括的に学ぶことができます。
        </p>
      </div>

      {/* 検索ボックス */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="症候・疾患名、検査名で検索..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* コンテンツセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 症候・疾患セクション */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">症候・疾患</h2>
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border-b pb-4 last:border-b-0">
                <h3 className="text-lg font-semibold mb-1 text-gray-700">
                  {category.title}
                </h3>
                {category.note && (
                  <p className="text-xs text-gray-500 mb-3">{category.note}</p>
                )}
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/database/higher-brain-function/symptoms/${category.id}/${item.id}`}
                      className="block p-2 hover:bg-gray-50 rounded transition-colors text-gray-600 hover:text-gray-900"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 検査セクション
            以前は WAB への Link があったが、content 側に examinations/ が
            存在せず 404 になっていたので外した。項目を作るときは
            constants/higherBrainFunction.ts と同じくファイルと定義を対にすること。
            なお検査は著作物なので、設問文・選択肢文は載せない。 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">検査</h2>
          <p className="text-sm text-gray-500">
            準備中です。各症候のページに、その症候で用いる検査を記載しています。
          </p>
        </div>
      </div>
    </div>
  );
}
