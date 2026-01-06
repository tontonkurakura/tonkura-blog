"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import useTractData from "./useTractData";
import {
  useHighConnectivityRegions,
  getHighConnectivityRegions,
  useConnectomeData,
  ConnectomeRegion,
} from "@/app/utils/tractConnectivity";
import { useGlasserAtlasData } from "@/app/utils/glasserAtlas";

// クライアントサイドでのみレンダリングするためにdynamicインポートを使用
const NiivueViewer = dynamic(
  () => import("./NiivueViewer"),
  { ssr: false } // サーバーサイドレンダリングを無効化
);

// トラクト情報の型定義
// interface TractInfo {
//   path: string;
//   name: string;
//   description: string;
//   fullName?: string; // 英語の正式名称
//   category: string; // カテゴリ名（"Association", "Projection", "Commissural", "Cerebellum", "Cranial Nerves"）
// }

// トラクトデータ全体の型定義
// interface TractData {
//   [key: string]: TractInfo; // キーはトラクトのID（例: "AF_L"）
// }

// カテゴリごとのトラクトの型定義
// interface TractsByCategory {
//   [category: string]: string[]; // カテゴリごとにトラクトIDのリストを持つ
// }

// トラクトカテゴリの型定義
// interface TractCategory {
//   [key: string]: TractInfo;
// }

// トラクトパスの型定義
// interface TractPaths {
//   projection: TractCategory;
//   association: TractCategory;
//   commissural: TractCategory;
//   cranial_nerve: TractCategory;
//   cerebellum: TractCategory;
//   [key: string]: TractCategory;
// }

// JSONファイルのトラクト名と説明の型定義
// interface TractNamesData {
//   [category: string]: {
//     [tractBaseId: string]: {
//       name: string;
//       description: string;
//     };
//   };
// }

// JSONファイルのトラクトパスの型定義
// interface TractPathsData {
//   [category: string]: {
//     [tractId: string]: string;
//   };
// }

// JSONファイルのカテゴリ名の型定義
// interface CategoryNamesData {
//   [category: string]: string;
// }

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
  // 皮質アトラスの表示設定をデフォルトでtrueにしつつ、切り替え可能に変更
  const [showCorticalAtlas, setShowCorticalAtlas] = useState(true);
  // 選択された皮質領域を格納する状態変数（接続性表示用に内部的に使用）
  // const [selectedCorticalRegions, setSelectedCorticalRegions] = useState<
  //   string[]
  // >([]);
  // クロスヘアの表示/非表示設定
  const [showCrosshair] = useState(true);

  // 接続性ベースの皮質表示は常に有効
  // const [showConnectivityBasedRegions, setShowConnectivityBasedRegions] =
  //   useState(true);

  // 接続性情報を取得するカスタムフックを使用
  const { tractToRegionsMap } = useHighConnectivityRegions();

  // 新しいJSONベースの接続性データを取得
  const {
    connectomeData,
    tractToRegionsMapNew,
    isLoading: isConnectomeLoading,
  } = useConnectomeData();

  // 新しいGlasser Atlas領域データを取得
  const { regionsMap: glasserRegionsMap } = useGlasserAtlasData();

  // HCP-MMP1領域のリスト（代表的なものだけを含む）
  const corticalRegions = [
    { id: "1", name: "V1（一次視覚野）", network: "visual" },
    { id: "2", name: "V2（二次視覚野）", network: "visual" },
    { id: "3", name: "V3（第三視覚野）", network: "visual" },
    { id: "4", name: "MT（中側頭領域）", network: "visual" },
    { id: "22", name: "A1（一次聴覚野）", network: "auditory" },
    { id: "23", name: "A4（聴覚連合野）", network: "auditory" },
    { id: "24", name: "STSdp（上側頭溝）", network: "auditory" },
    { id: "48", name: "M1（一次運動野）", network: "somatomotor" },
    { id: "52", name: "S1（一次体性感覚野）", network: "somatomotor" },
    { id: "76", name: "SMA（補足運動野）", network: "somatomotor" },
    { id: "85", name: "IPS1（頭頂間溝）", network: "dorsal attention" },
    { id: "96", name: "FEF（前頭眼野）", network: "dorsal attention" },
    { id: "110", name: "BA44（ブローカ野）", network: "language" },
    { id: "111", name: "BA45（ブローカ野）", network: "language" },
    { id: "114", name: "55b（前運動野）", network: "language" },
    { id: "123", name: "PGi（角回）", network: "language" },
    { id: "146", name: "DLPFC（背外側前頭前野）", network: "frontoparietal" },
    { id: "148", name: "A10p（前頭極）", network: "frontoparietal" },
    { id: "160", name: "PCC（後部帯状皮質）", network: "default mode" },
    { id: "161", name: "ACC（前部帯状皮質）", network: "default mode" },
    { id: "162", name: "PFC（前頭前皮質）", network: "default mode" },
    { id: "163", name: "TPJ（側頭頭頂接合部）", network: "default mode" },
  ];

  // トラクトデータを取得するためのカスタムフックを使用
  const { tractData, tractsByCategory, categoryDisplayNames, isLoading } =
    useTractData();

  // Niivueインスタンスへの参照
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const niivueRef = useRef<any>(null);

  // 初期化処理: 初期表示時にactiveTabがtractの場合、適切なトラクトを選択
  useEffect(() => {
    if (initialAtlasType === "tract") {
      setSelectedTracts(["CST_L", "CST_R"]);
    }
  }, [initialAtlasType]);

  // アトラスの表示/非表示またはタブが切り替わったときにNiivueViewerを再マウントする
  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [showAtlas, activeTab, selectedTracts, showCorticalAtlas, showCrosshair]);

  // 現在のタブに基づいてテンプレートとアトラスのパスを決定
  const getTemplatePath = () => {
    if (activeTab === "tract") return TRACT_TEMPLATE_PATH;
    return activeTab === "hcp"
      ? MNI152_2009_TEMPLATE_PATH
      : MNI152_6_TEMPLATE_PATH;
  };

  // カスタム皮質アトラスパスを生成する関数
  const getCorticalAtlasPath = () => {
    // トラクトと接続性の高い皮質領域を表示
    if (selectedTracts.length > 0) {
      // 選択されたトラクトに基づいて高接続性領域を取得
      const highConnectivityRegions = getHighConnectivityRegions(
        selectedTracts,
        tractToRegionsMap,
        tractToRegionsMapNew
      );

      // デバッグ情報
      console.log(
        `getCorticalAtlasPath - 高接続領域IDs: ${highConnectivityRegions.join(", ")}`
      );

      // 高接続性領域が見つかった場合はそれを表示
      if (highConnectivityRegions.length > 0) {
        return `${HCP_MMP1_ATLAS_PATH}?regions=${highConnectivityRegions.join(",")}`;
      }
    }

    // 高接続性領域が見つからない場合は通常のアトラスパスを返す
    return HCP_MMP1_ATLAS_PATH;
  };

  const getAtlasPath = () => {
    if (!showAtlas) return undefined;

    if (activeTab === "tract") {
      // 選択されたトラクトがない場合はデフォルトを表示
      if (selectedTracts.length === 0 || Object.keys(tractData).length === 0) {
        // 皮質アトラスの表示有無をユーザー設定に基づいて決定
        if (showCorticalAtlas) {
          const corticalAtlasPath = getCorticalAtlasPath();
          return [
            "/data/brain/atlas/hcp1065_avg_tracts_nifti/nifti/projection/CST_L.nii.gz",
            corticalAtlasPath,
          ];
        } else {
          // 皮質アトラスを表示しない場合はトラクトのみ
          return [
            "/data/brain/atlas/hcp1065_avg_tracts_nifti/nifti/projection/CST_L.nii.gz",
          ];
        }
      }

      // 複数のトラクトパスを配列で返す
      const tractPaths = selectedTracts
        .map((tract) => tractData[tract]?.path)
        .filter(Boolean);

      // 皮質アトラスの表示有無をユーザー設定に基づいて決定
      if (showCorticalAtlas) {
        const corticalAtlasPath = getCorticalAtlasPath();
        return [...tractPaths, corticalAtlasPath];
      } else {
        // 皮質アトラスを表示しない場合はトラクトのみ
        return tractPaths;
      }
    }

    return activeTab === "hcp" ? HCP_MMP1_ATLAS_PATH : AAL3_ATLAS_PATH;
  };

  // 現在選択されているトラクトと関連する皮質領域情報を取得
  const getConnectedRegionsInfo = () => {
    if (selectedTracts.length === 0) {
      return [];
    }

    // 選択されたトラクトに関連する皮質領域のIDを取得
    // JSONデータを優先して使用（利用可能な場合）
    const highConnectivityRegionIds = getHighConnectivityRegions(
      selectedTracts,
      tractToRegionsMap,
      tractToRegionsMapNew
    );

    console.log(
      `選択したトラクト ${selectedTracts.join(
        ", "
      )} と接続性の高い皮質領域: ${highConnectivityRegionIds.join(", ")}`
    );

    // JSONデータから直接情報を取得する方法を優先（より正確）
    const connectedRegionsInfo = highConnectivityRegionIds.map((regionId) => {
      // 領域ID（文字列）を数値に変換
      const numericId = parseInt(regionId);

      // 左右半球の判定（201以上は右半球）
      const hemisphere = numericId >= 200 ? "右" : "左";

      // 右半球の場合、元のID値（1-180）に戻す
      const originalId = numericId >= 200 ? numericId - 200 : numericId;

      // JSONからの領域情報取得を試みる
      if (selectedTracts.length > 0 && connectomeData) {
        const currentTract = selectedTracts[0];
        const baseTractName = currentTract.replace(/_[LR]$/, "");
        const isLeftTract = currentTract.endsWith("_L");

        if (connectomeData[baseTractName]) {
          // 現在の半球に対応する接続情報を取得
          const connections = isLeftTract
            ? connectomeData[baseTractName].connections.left
            : connectomeData[baseTractName].connections.right;

          // 対応する領域情報を探す
          const regionInfo = connections.find((region: ConnectomeRegion) => {
            const regionNum = isLeftTract
              ? region.region_number
              : region.region_number + 200;
            return regionNum.toString() === regionId;
          });

          if (regionInfo) {
            return {
              id: regionId,
              numericId: numericId,
              hemisphere: hemisphere,
              name: regionInfo.region_name,
              description: regionInfo.description,
              probability: regionInfo.probability,
              network: undefined, // JSONにはネットワーク情報がない
            };
          }
        }
      }

      // JSONから情報が取得できない場合はGlasserの情報を使用
      if (glasserRegionsMap && glasserRegionsMap[originalId.toString()]) {
        const glasserInfo = glasserRegionsMap[originalId.toString()];
        return {
          id: regionId,
          numericId: numericId,
          hemisphere: hemisphere,
          name: glasserInfo.name,
          network: glasserInfo.network,
        };
      }

      // それでも見つからない場合はcorticalRegionsからの情報をフォールバックとして使用
      const regionInfo = corticalRegions.find(
        (region) => parseInt(region.id) === originalId
      );

      return {
        id: regionId,
        numericId: numericId,
        hemisphere: hemisphere,
        name: regionInfo ? regionInfo.name : `Region ${originalId}`,
        network: regionInfo ? regionInfo.network : undefined,
      };
    });

    return connectedRegionsInfo;
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
          <p className="text-sm text-gray-700 mt-2">
            <span className="font-semibold">※</span>{" "}
            選択したトラクトと接続性の高いHCP-MMP1皮質領域も同時表示されています。
          </p>
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

        {/* 皮質アトラス同時表示の設定（トグルボタンに変更） */}
        <div className="mb-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              HCP-MMP1皮質アトラス表示設定
              <span className="ml-2 text-xs bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-semibold">
                機能
              </span>
            </span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showCorticalAtlas}
                onChange={() => setShowCorticalAtlas(!showCorticalAtlas)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ms-2 text-sm font-medium text-gray-700">
                {showCorticalAtlas ? "ON" : "OFF"}
              </span>
            </label>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-600 mb-2">
              {showCorticalAtlas
                ? "HCP-MMP1皮質アトラスを白質線維と同時に表示しています。選択したトラクトと接続性の高い皮質領域のみを表示します。"
                : "白質線維トラクトのみを表示しています。皮質アトラスは表示されません。"}
            </p>

            {/* 接続性ベースの皮質表示情報（皮質アトラス表示時のみ） */}
            {selectedTracts.length > 0 && showCorticalAtlas && (
              <div className="bg-blue-50 p-2 rounded text-sm mb-3">
                <p>
                  選択したトラクトと接続確率が高い皮質領域のみを表示しています。
                  {isConnectomeLoading ? (
                    <span className="block mt-1 text-xs italic">
                      接続データを読み込み中...
                    </span>
                  ) : (
                    <span className="block mt-1 text-xs">
                      関連皮質領域数:{" "}
                      {
                        getHighConnectivityRegions(
                          selectedTracts,
                          tractToRegionsMap,
                          tractToRegionsMapNew
                        ).length
                      }
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          {/* 脳表示部分 */}
          <div className="flex-1">
            <div className="flex justify-center w-full mx-auto mb-8">
              <NiivueViewer
                key={key}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ref={(ref: any) => (niivueRef.current = ref)}
                volumeUrl={getTemplatePath()}
                overlayUrl={getAtlasPath()}
                atlasType={activeTab}
                showControls={true}
                isTractMode={true}
                connectedRegions={
                  showCorticalAtlas ? getConnectedRegionsInfo() : []
                }
                showCrosshair={showCrosshair}
              />
            </div>
          </div>

          {/* トラクト一覧 */}
          <div className="w-full md:w-80 bg-gray-50 p-4 rounded-md">
            <h3 className="font-bold text-lg mb-3">トラクト一覧</h3>

            {/* 現在表示中のトラクト情報 */}
            {selectedTracts.length > 0 && tractData[selectedTracts[0]] && (
              <div className="bg-white p-3 mb-4 rounded border border-blue-200">
                <h4 className="font-bold text-blue-700">現在表示中:</h4>
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
                {/* 接続皮質領域数の表示（デバッグ情報、皮質アトラス表示時のみ） */}
                {tractToRegionsMapNew &&
                  tractToRegionsMapNew[selectedTracts[0]] &&
                  showCorticalAtlas && (
                    <div className="mt-2 text-xs bg-gray-100 p-1 rounded">
                      <p>
                        接続皮質領域数:{" "}
                        {tractToRegionsMapNew[selectedTracts[0]].length}
                      </p>
                      {/* 接続の高い領域のリスト */}
                      <div className="mt-1 max-h-40 overflow-y-auto">
                        <p className="font-semibold text-xs">
                          接続性の高い領域:
                        </p>
                        <ul className="text-xs">
                          {getConnectedRegionsInfo().map((region) => (
                            <li
                              key={region.id}
                              className="mb-1 border-b border-gray-100 pb-1"
                            >
                              <div className="font-medium">
                                {region.name} ({region.hemisphere})
                              </div>
                              <div className="text-gray-500">
                                ID: {region.id} / NIFTI値:{" "}
                                {region.numericId >= 200
                                  ? region.numericId - 200
                                  : region.numericId}
                              </div>
                              {region.probability && (
                                <div className="text-blue-600">
                                  確率: {region.probability}%
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ref={(ref: any) => (niivueRef.current = ref)}
            volumeUrl={getTemplatePath()}
            overlayUrl={getAtlasPath()}
            atlasType={activeTab}
            showControls={true}
            isTractMode={false}
            showCrosshair={showCrosshair}
          />
        </div>
      )}
    </div>
  );
}

// ネットワークの色を取得する関数
// function getNetworkColor(network: string): string {
//   const networkColors: { [key: string]: string } = {
//     visual: "bg-purple-600",
//     somatosensory: "bg-blue-600",
//     "dorsal attention": "bg-green-600",
//     "ventral attention": "bg-teal-600",
//     limbic: "bg-yellow-600",
//     frontoparietal: "bg-orange-600",
//     "default mode": "bg-red-600",
//     language: "bg-pink-600",
//   };

//   return networkColors[network.toLowerCase()] || "bg-gray-600";
// }
