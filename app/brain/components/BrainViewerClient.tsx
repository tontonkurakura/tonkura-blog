"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// クライアントサイドでのみレンダリングするためにdynamicインポートを使用
const NiivueViewer = dynamic(
  () => import("@/app/brain/components/NiivueViewer"),
  { ssr: false } // サーバーサイドレンダリングを無効化
);

// 標準脳テンプレートのパス
const MNI152_2009_TEMPLATE_PATH =
  "/data/brain/template/tpl-MNI152NLin2009cAsym_res-01_desc-brain_T1w.nii.gz";
const MNI152_6_TEMPLATE_PATH =
  "/data/brain/template/tpl-MNI152NLin6Asym_res-01_desc-brain_T1w.nii.gz";

// アトラスのパス
const HCP_MMP1_ATLAS_PATH =
  "/data/brain/atlas/HCP-MMP1/HCP-MMP1_on_MNI152_ICBM2009a_nlin.nii.gz";
const AAL3_ATLAS_PATH = "/data/brain/atlas/AAL3/AAL3v1_1mm.nii.gz";

/**
 * BrainViewerClientコンポーネント
 *
 * Client Componentとして、NiivueViewerを表示するためのラッパーコンポーネント
 */
export default function BrainViewerClient({
  initialAtlasType = "hcp", // デフォルトはHCP-MMP1アトラス
  title = "脳アトラスビューワー", // デフォルトのタイトル
}: {
  initialAtlasType?: "hcp" | "aal3";
  title?: string;
}) {
  const [showAtlas, setShowAtlas] = useState(true);
  const [activeTab, setActiveTab] = useState(initialAtlasType);
  const [key, setKey] = useState(0);

  // アトラスの表示/非表示またはタブが切り替わったときにNiivueViewerを再マウントする
  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [showAtlas, activeTab]);

  // 現在のタブに基づいてテンプレートとアトラスのパスを決定
  const getTemplatePath = () => {
    return activeTab === "hcp"
      ? MNI152_2009_TEMPLATE_PATH
      : MNI152_6_TEMPLATE_PATH;
  };

  const getAtlasPath = () => {
    if (!showAtlas) return undefined;
    return activeTab === "hcp" ? HCP_MMP1_ATLAS_PATH : AAL3_ATLAS_PATH;
  };

  // アトラスの説明テキストを取得
  const getAtlasDescription = () => {
    if (activeTab === "hcp") {
      return (
        <div className="mb-3">
          <h3 className="font-bold text-md mb-1">
            HCP-MMP1アトラス（Human Connectome Project Multi-Modal
            Parcellation）
          </h3>
          <p className="text-sm text-gray-700">
            Human Connectome Projectによって開発された脳皮質領域のアトラスです。
            機能的・構造的特性に基づいて脳の皮質領域を180の領域に分類しています。
            アトラスは同じID値を左右半球で使用しており、座標位置に基づいて左右半球を判定します。
          </p>
        </div>
      );
    } else {
      return (
        <div className="mb-3">
          <h3 className="font-bold text-md mb-1">
            AAL3アトラス（Automated Anatomical Labeling 3）
          </h3>
          <p className="text-sm text-gray-700">
            AAL3は、脳の解剖学的構造を自動的にラベル付けするためのアトラスです。
            大脳皮質、皮質下構造、小脳を含む170の領域に分類されています。
            神経科学研究や臨床診断において広く使用されている標準的なアトラスです。
          </p>
        </div>
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>

      {/* タブインターフェース */}
      <div className="mb-4 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "hcp"
                  ? "text-blue-600 border-b-2 border-blue-600 active"
                  : "text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent"
              }`}
              onClick={() => setActiveTab("hcp")}
            >
              HCP-MMP1アトラス
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 rounded-t-lg ${
                activeTab === "aal3"
                  ? "text-blue-600 border-b-2 border-blue-600 active"
                  : "text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent"
              }`}
              onClick={() => setActiveTab("aal3")}
            >
              AAL3アトラス
            </button>
          </li>
        </ul>
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={showAtlas}
            onChange={() => setShowAtlas(!showAtlas)}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-sm font-medium text-gray-900">
            アトラス表示 ON/OFF
          </span>
        </label>
      </div>

      <div className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm mb-5">
        <h2 className="text-xl font-bold mb-3">機能説明</h2>

        <div className="mb-3">
          <h3 className="font-bold text-md mb-1">MNI座標と脳領域表示機能</h3>
          <p className="text-sm text-gray-700">
            マウスを画像上で動かすと、カーソル位置のMNI座標と対応する脳領域が表示されます。
            領域の判定は画像のX座標（左右方向）に基づいて左右半球を判断し、適切な領域名を表示します。
          </p>
        </div>

        {/* 現在選択されているアトラスの説明 */}
        {getAtlasDescription()}

        <div className="mb-1">
          <h3 className="font-bold text-md mb-1">使用方法</h3>
          <ul className="list-disc list-inside text-sm text-gray-700">
            <li>マウスのスクロールホイールでズームイン/アウト</li>
            <li>
              マウスの右ボタンを押しながらドラッグで画像のコントラスト/明るさ調整
            </li>
            <li>マウスの左ボタンを押しながらドラッグで画像の位置調整</li>
            <li>
              キーボードの「1」「2」「3」で表示方向を変更（矢状断、冠状断、水平断）
            </li>
          </ul>
        </div>
      </div>

      <div className="flex justify-center w-full max-w-4xl mx-auto mb-8">
        <NiivueViewer
          key={key}
          volumeUrl={getTemplatePath()}
          overlayUrl={getAtlasPath()}
          atlasType={activeTab}
          showControls={true}
        />
      </div>
    </div>
  );
}
