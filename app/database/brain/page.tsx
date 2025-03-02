"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BrainDatabasePage() {
  const [mounted, setMounted] = useState(false);

  // クライアントサイドレンダリングのための対応
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
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

      <h1 className="text-3xl font-bold mb-2">脳機能データベース</h1>
      <p className="text-gray-600 mb-6">
        MNI152標準脳テンプレートとAAL3パーセレーションに基づく脳領域の機能データベースです。
      </p>

      <Tabs defaultValue="about">
        <TabsList className="mb-6">
          <TabsTrigger value="about">データベースについて</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">MNI152標準脳テンプレート</h2>
            <p className="mb-4">
              MNI152は、モントリオール神経学研究所（Montreal Neurological Institute）で開発された標準脳テンプレートです。
              152人の健常者のMRI画像を平均化して作成されており、脳画像研究における標準的な座標系として広く使用されています。
            </p>
            <p className="mb-2">
              このテンプレートを使用することで、異なる個人間や研究間での脳の位置を標準化して比較することが可能になります。
            </p>
            <p className="text-sm text-gray-500 mt-4">
              データソース: McGill University, Montreal Neurological Institute
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">AAL3パーセレーション</h2>
            <p className="mb-4">
              AAL（Automated Anatomical Labeling）は、脳の解剖学的領域を自動的にラベル付けするためのデジタルアトラスです。
              AAL3は最新バージョンで、脳を166の領域に分割しています。各領域には固有のIDが割り当てられており、
              機能的および構造的な脳画像研究において広く使用されています。
            </p>
            <p className="mb-2">
              このアトラスを使用することで、脳の特定の解剖学的領域と機能を関連付けることができます。
            </p>
            <p className="text-sm text-gray-500 mt-4">
              データソース: Rolls ET, Huang CC, Lin CP, Feng J, Joliot M (2020). &ldquo;Automated anatomical labelling atlas 3&rdquo;. NeuroImage, 206, 116189.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}