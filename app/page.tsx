import React from "react";
import Link from "next/link";
import { getLatestContent } from "@/utils/contentUtils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import Image from "next/image";

export default async function Home() {
  const latestContent = await getLatestContent(3);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* メインセクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">神経内科</h2>
          <p className="text-gray-600 mb-4">
            神経内科に関する知識をまとめています。
          </p>
          <Link
            href="/neurology"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View Notes →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">プログラミング</h2>
          <p className="text-gray-600 mb-4">
            プログラミングに関する記事を書いています。
          </p>
          <Link
            href="/blog/programming"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View Articles →
          </Link>
        </div>
      </div>

      {/* 最新コンテンツセクション */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-6">最新のコンテンツ</h2>
        <div className="grid grid-cols-1 gap-6">
          {latestContent.map((content) => (
            <div
              key={content.path}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="px-2 py-1 text-xs font-semibold rounded-full"
                    style={{
                      backgroundColor:
                        content.type === "blog"
                          ? "#E3F2FD"
                          : content.type === "neurology"
                          ? "#F3E5F5"
                          : "#E8F5E9",
                      color:
                        content.type === "blog"
                          ? "#1565C0"
                          : content.type === "neurology"
                          ? "#6A1B9A"
                          : "#2E7D32",
                    }}
                  >
                    {content.type === "blog"
                      ? "ブログ"
                      : content.type === "neurology"
                      ? "神経内科"
                      : "写真"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {format(new Date(content.date), "yyyy年MM月dd日", {
                      locale: ja,
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
                {content.type === "photo" && (
                  <div className="relative w-full h-40 mb-4">
                    <Image
                      src={content.path}
                      alt={content.title}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
              </div>
              <Link
                href={content.type === "photo" ? "/photographs" : content.path}
                className="mt-2 md:mt-0 text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap"
              >
                View →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
