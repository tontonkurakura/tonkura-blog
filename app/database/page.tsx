"use client";

import Link from "next/link";

export default function DatabasePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Database</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 神経筋支配カード */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-3">神経筋支配</h2>
            <p className="text-gray-600 mb-4">
              神経と筋肉の支配関係についてのデータベースです。神経別、筋節別に検索できます。
            </p>
            <Link
              href="/neuromuscular"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              詳細を見る
            </Link>
          </div>
        </div>

        {/* 高次脳機能データベースカード */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-3">
              高次脳機能データベース
            </h2>
            <p className="text-gray-600 mb-4">
              高次脳機能障害の症候、機能解剖、検査についての包括的なデータベースです。
            </p>
            <Link
              href="/database/higher-brain-function"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              詳細を見る
            </Link>
          </div>
        </div>

        {/* 将来的に他のデータベースコンテンツを追加する場合はここに追加 */}
      </div>
    </div>
  );
}
