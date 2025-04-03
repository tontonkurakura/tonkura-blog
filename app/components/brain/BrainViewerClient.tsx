"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import useTractData from "./useTractData";

// クライアントサイドでのみレンダリングするためにdynamicインポートを使用
const NiivueViewer = dynamic(
  () => import("./NiivueViewer"),
  { ssr: false } // サーバーサイドレンダリングを無効化
);

// トラクト情報の型定義
interface TractInfo {
  path: string;
  name: string;
  description: string;
  fullName?: string; // 英語の正式名称
  category: string; // カテゴリ名（"Association", "Projection", "Commissural", "Cerebellum", "Cranial Nerves"）
}

// トラクトデータ全体の型定義
interface TractData {
  [key: string]: TractInfo; // キーはトラクトのID（例: "AF_L"）
}

// カテゴリごとのトラクトの型定義
interface TractsByCategory {
  [category: string]: string[]; // カテゴリごとにトラクトIDのリストを持つ
}

// トラクトカテゴリの型定義
interface TractCategory {
  [key: string]: TractInfo;
}

// トラクトパスの型定義
interface TractPaths {
  projection: TractCategory;
  association: TractCategory;
  commissural: TractCategory;
  cranial_nerve: TractCategory;
  cerebellum: TractCategory;
  [key: string]: TractCategory;
}

// JSONファイルのトラクト名と説明の型定義
interface TractNamesData {
  [category: string]: {
    [tractBaseId: string]: {
      name: string;
      description: string;
    };
  };
}

// JSONファイルのトラクトパスの型定義
interface TractPathsData {
  [category: string]: {
    [tractId: string]: string;
  };
}

// JSONファイルのカテゴリ名の型定義
interface CategoryNamesData {
  [category: string]: string;
}

// 標準脳テンプレートのパス
const MNI152_2009_TEMPLATE_PATH =
  "/data/brain/template/tpl-MNI152NLin2009cAsym_res-01_desc-brain_T1w.nii.gz";
const MNI152_6_TEMPLATE_PATH =
  "/data/brain/template/tpl-MNI152NLin6Asym_res-01_desc-brain_T1w.nii.gz";

// アトラスのパス
const HCP_MMP1_ATLAS_PATH =
  "/data/brain/atlas/HCP-MMP1/HCP-MMP1_on_MNI152_ICBM2009a_nlin.nii.gz";
const AAL3_ATLAS_PATH = "/data/brain/atlas/AAL3/AAL3v1_1mm.nii.gz";
const TRACT_TEMPLATE_PATH =
  "/data/brain/template/tpl-MNI152NLin2009cAsym_res-01_desc-brain_T1w.nii.gz";

/**
 * BrainViewerClientコンポーネント
 *
 * Client Componentとして、NiivueViewerを表示するためのラッパーコンポーネント
 */
export default function BrainViewerClient({
  initialAtlasType = "hcp", // デフォルトはHCP-MMP1アトラス
  title = "脳アトラスビューワー", // デフォルトのタイトル
  hideTabInterface = false, // タブインターフェースを非表示にするオプション
}: {
  initialAtlasType?: "hcp" | "aal3" | "tract";
  title?: string;
  hideTabInterface?: boolean;
}) {
  const [showAtlas, setShowAtlas] = useState(true);
  const [activeTab, setActiveTab] = useState(initialAtlasType);
  const [key, setKey] = useState(0);
  const [selectedTracts, setSelectedTracts] = useState<string[]>([
    "CST_L",
    "CST_R",
  ]);

  // トラクトデータを取得するためのカスタムフックを使用
  const { tractData, tractsByCategory, categoryDisplayNames, isLoading } =
    useTractData();

  // 初期化処理: 初期表示時にactiveTabがtractの場合、適切なトラクトを選択
  useEffect(() => {
    if (initialAtlasType === "tract") {
      setSelectedTracts(["CST_L", "CST_R"]);
    }
  }, [initialAtlasType]);

  // アトラスの表示/非表示またはタブが切り替わったときにNiivueViewerを再マウントする
  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [showAtlas, activeTab, selectedTracts]);

  // 現在のタブに基づいてテンプレートとアトラスのパスを決定
  const getTemplatePath = () => {
    if (activeTab === "tract") return TRACT_TEMPLATE_PATH;
    return activeTab === "hcp"
      ? MNI152_2009_TEMPLATE_PATH
      : MNI152_6_TEMPLATE_PATH;
  };

  const getAtlasPath = () => {
    if (!showAtlas) return undefined;
    if (activeTab === "tract") {
      // 選択されたトラクトがない場合はデフォルトを表示
      if (selectedTracts.length === 0 || Object.keys(tractData).length === 0)
        return "/data/brain/atlas/hcp1065_avg_tracts_nifti/nifti/projection/CST_L.nii.gz";

      // 複数のトラクトパスを配列で返す
      return selectedTracts
        .map((tract) => tractData[tract]?.path)
        .filter(Boolean);
    }
    return activeTab === "hcp" ? HCP_MMP1_ATLAS_PATH : AAL3_ATLAS_PATH;
  };

  // 現在選択されているトラクトの情報を取得
  const getCurrentTractInfo = () => {
    // 表示上は主要なトラクト（最初に選択されたもの）の情報を返す
    if (selectedTracts.length > 0 && tractData[selectedTracts[0]]) {
      return tractData[selectedTracts[0]];
    }

    // データがまだロードされていない場合やトラクトが選択されていない場合のデフォルト値
    return {
      path: "/data/brain/atlas/hcp1065_avg_tracts_nifti/nifti/projection/CST_L.nii.gz",
      name: "錐体路（左）",
      description: "一次運動野から脊髄への主要な運動情報伝達経路です。",
      category: "Projection",
    };
  };

  // アトラスの説明テキストを取得
  const getAtlasDescription = () => {
    if (activeTab === "tract") {
      const tractInfo = getCurrentTractInfo();
      return (
        <div className="mb-3">
          <h3 className="font-bold text-md mb-1">HCP白質線維アトラス</h3>
          <p className="text-sm text-gray-700">
            Human Connectome
            Projectの1065人の平均トラクトグラフィーデータに基づく白質線維アトラスです。
            現在表示中のトラクト:{" "}
            <span className="font-semibold">
              {tractInfo.name.replace(/（左）|（右）/g, "")}
            </span>
          </p>
          <p className="text-sm text-gray-700 mt-2">{tractInfo.description}</p>
        </div>
      );
    }

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

  // トラクト選択セクションのレンダリング
  const renderTractSelection = () => {
    if (activeTab !== "tract") return null;

    // データロード中の表示
    if (isLoading) {
      return (
        <div className="mb-6">
          <h3 className="font-semibold mb-3">トラクト選択</h3>
          <div className="flex justify-center py-10">
            <p>トラクトデータを読み込んでいます...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <h3 className="font-semibold mb-3">トラクト選択</h3>

        <div className="flex flex-col md:flex-row gap-4">
          {/* 脳表示部分 */}
          <div className="flex-1">
            <div className="flex justify-center w-full mx-auto mb-8">
              <NiivueViewer
                key={key}
                volumeUrl={getTemplatePath()}
                overlayUrl={getAtlasPath()}
                atlasType={activeTab}
                showControls={true}
                isTractMode={true}
              />
            </div>
          </div>

          {/* トラクト一覧 */}
          <div className="w-full md:w-80 bg-gray-50 p-4 rounded-md">
            <h3 className="font-bold text-lg mb-3">トラクト一覧</h3>

            {/* 現在表示中のトラクト情報 */}
            {selectedTracts.length > 0 && tractData[selectedTracts[0]] && (
              <div className="bg-white p-3 mb-4 rounded border border-blue-200">
                <h4 className="font-medium text-blue-700">現在表示中:</h4>
                <div className="flex items-center mt-1">
                  <p className="font-bold">
                    {tractData[selectedTracts[0]]?.name.replace(
                      /（左）|（右）/g,
                      ""
                    )}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {tractData[selectedTracts[0]]?.description}
                </p>
                <p className="text-xs text-gray-500 mt-1 italic">
                  {tractData[selectedTracts[0]]?.fullName?.replace(
                    /_L$|_R$/,
                    ""
                  )}
                </p>
              </div>
            )}

            {/* カテゴリごとのトラクトリスト */}
            {Object.keys(tractsByCategory).map((category) => (
              <div key={category} className="mb-5">
                <h4 className="font-medium text-gray-700 bg-gray-100 p-2 rounded">
                  {categoryDisplayNames[category]}
                </h4>
                <div className="mt-2">
                  <ul className="space-y-1">
                    {tractsByCategory[category].map((tractPair) => {
                      // 両方のトラクトが存在するかチェック
                      const hasLeft = !!tractPair.left;
                      const hasRight = !!tractPair.right;

                      // このペアのトラクトが選択されているか
                      const isSelected =
                        (hasLeft && selectedTracts.includes(tractPair.left!)) ||
                        (hasRight && selectedTracts.includes(tractPair.right!));

                      // 少なくとも片方のトラクトが利用可能か
                      const isAvailable = hasLeft || hasRight;

                      return (
                        <li key={tractPair.id}>
                          <button
                            className={`w-full text-left px-2 py-1 rounded text-sm 
                              ${!isAvailable ? "text-gray-400 cursor-not-allowed" : "hover:bg-gray-100"} 
                              ${isSelected ? "bg-blue-100 font-medium text-blue-700" : ""}`}
                            onClick={() => {
                              if (isAvailable) {
                                // 選択時は利用可能なトラクトのみを配列に含める
                                const newSelectedTracts = [];
                                if (hasLeft)
                                  newSelectedTracts.push(tractPair.left!);
                                if (hasRight)
                                  newSelectedTracts.push(tractPair.right!);
                                setSelectedTracts(newSelectedTracts);
                              }
                            }}
                            disabled={!isAvailable}
                          >
                            {tractPair.name}
                            {!isAvailable && " (なし)"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>

      {/* タブインターフェース（条件付き） */}
      {!hideTabInterface && (
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
            <li className="mr-2">
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === "tract"
                    ? "text-blue-600 border-b-2 border-blue-600 active"
                    : "text-gray-500 hover:text-gray-600 hover:border-gray-300 border-b-2 border-transparent"
                }`}
                onClick={() => setActiveTab("tract")}
              >
                白質線維
              </button>
            </li>
          </ul>
        </div>
      )}

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

      {/* 説明セクション - トラクトの場合は表示しない */}
      {activeTab !== "tract" && (
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
      )}

      {/* トラクト選択UI */}
      {renderTractSelection()}

      {/* 非トラクトアトラスの表示 */}
      {activeTab !== "tract" && (
        <div className="flex justify-center w-full max-w-4xl mx-auto mb-8">
          <NiivueViewer
            key={key}
            volumeUrl={getTemplatePath()}
            overlayUrl={getAtlasPath()}
            atlasType={activeTab}
            showControls={true}
            isTractMode={false}
          />
        </div>
      )}
    </div>
  );
}
