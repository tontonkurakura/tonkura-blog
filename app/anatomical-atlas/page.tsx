import { Metadata } from "next";
import AnatomicalAtlasClient from "@/components/brain/AnatomicalAtlasClient";

export const metadata: Metadata = {
  title: "解剖学的アトラス - TonKurA",
  description:
    "MNI152標準脳の3Dモデルと断面像を用いた解剖学的アトラス。43の詳細領域と9大区分を対話的に探索できます。",
};

export default function AnatomicalAtlasPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">解剖学的アトラス</h1>
        <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
          MNI152標準脳から作成した3DモデルとMRI断面像を使って、脳の解剖学的構造を対話的に探索できます。
          領域をクリックすると機能・臨床的意義などのアノテーションが表示されます。
          FreeSurfer の Desikan-Killiany
          アトラス（皮質34領域）と皮質下構造（9領域）を収録しています。
        </p>
      </div>

      <AnatomicalAtlasClient />

      {/* データソース情報 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
        <h2 className="font-semibold text-gray-700 mb-2">データについて</h2>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            3Dモデル: MNI152 NLin2009cAsym テンプレートを FreeSurfer
            で処理し、Blender で最適化
          </li>
          <li>皮質領域: Desikan-Killiany アトラス（aparc）— 34領域 × 2半球</li>
          <li>
            皮質下構造: FreeSurfer aseg — 海馬・扁桃体・基底核・視床・脳幹・小脳
          </li>
          <li>
            MRIスライス: MNI152標準脳 (0.74mm isotropic)
            の軸位断・冠状断・矢状断
          </li>
        </ul>
      </div>
    </div>
  );
}
