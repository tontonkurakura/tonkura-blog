import { Metadata } from "next";
import BrainViewerClient from "@/components/brain/BrainViewerClient";

export const metadata: Metadata = {
  title: "解剖学的アトラス - TonKurA",
  description: "脳の解剖学的構造を詳細に解説するアトラスページ",
};

export default function AnatomicalAtlasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-4xl font-bold mb-6">解剖学的アトラス</h1>

      <div className="mb-8">
        <p className="text-lg text-gray-700 mb-4">
          このページでは、Automated Anatomical
          Labeling（AAL）の第3版を使用して、脳の解剖学的構造を詳細に可視化しています。
        </p>
        <p className="text-lg text-gray-700 mb-4">
          AAL3アトラスは、脳の解剖学的構造を自動的にラベル付けするための標準的なアトラスです。
          大脳皮質、皮質下構造、小脳を含む170の領域に分類されており、神経科学研究や臨床診断において広く使用されています。
        </p>
      </div>

      <BrainViewerClient
        initialAtlasType="aal3"
        title="AAL3解剖学的アトラス"
        hideTabInterface={true}
      />

      <div className="mt-8 bg-green-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">AAL3アトラスについて</h2>
        <p className="mb-4">
          Automated Anatomical
          Labeling（AAL）の第3版は、脳の解剖学的構造を自動的にラベル付けするためのアトラスです。
          以前のバージョンから改良され、より詳細な皮質下構造と小脳領域の分類が含まれています。
        </p>
        <p className="mb-4">このアトラスの特徴：</p>
        <ul className="list-disc pl-8 mb-4 space-y-2">
          <li>170の異なる解剖学的領域に分類</li>
          <li>大脳皮質、皮質下構造、小脳を網羅</li>
          <li>神経科学研究と臨床診断に広く使用</li>
        </ul>
        <p>
          <a
            href="https://www.gin.cnrs.fr/en/tools/aal/"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            AALアトラスの公式サイト
          </a>
        </p>
      </div>
    </div>
  );
}
