import { Metadata } from "next";
import BrainViewerClient from "@/components/brain/BrainViewerClient";

export const metadata: Metadata = {
  title: "機能的アトラス - TonKurA",
  description: "脳の機能的領域を詳細に解説するアトラスページ",
};

export default function FunctionalAtlasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-6">機能的アトラス</h1>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          このページでは、Human Connectome
          Project（HCP）によって開発された多様式パーセレーションマップを使用して、脳の機能的領域を詳細に可視化しています。
        </p>
        <p className="text-lg text-gray-700 mb-4">
          HCP-MMP1アトラスは、複数のイメージングモダリティを組み合わせて作成された革新的な脳地図で、脳の皮質領域を180の異なる機能的・構造的領域に分類しています。
        </p>
      </div>

      <BrainViewerClient
        initialAtlasType="hcp"
        title="HCP-MMP1機能的アトラス"
        hideTabInterface={true}
      />

      <div className="mt-8 bg-green-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">
          HCP-MMP1アトラスについて
        </h2>
        <p className="mb-4">
          Human Connectome
          Project（HCP）によって開発された多様式パーセレーション（区分）マップです。
          fMRI、MRI、T1強調画像、T2強調画像など複数のイメージングモダリティを組み合わせて作成されています。
        </p>
        <p className="mb-4">このアトラスの特徴：</p>
        <ul className="list-disc pl-8 mb-4 space-y-2">
          <li>脳の皮質領域を180の異なる領域に分類</li>
          <li>各領域は特定の機能的・構造的特性に関連</li>
          <li>多様なイメージングモダリティを統合</li>
          <li>脳の機能的・構造的研究に革新的なアプローチ</li>
        </ul>
        <p>
          <a
            href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4990127/"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            HCP-MMP1アトラスの原著論文
          </a>
        </p>
      </div>
    </div>
  );
}
