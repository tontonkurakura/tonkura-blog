"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BrainSliceViewer from "@/components/brain/BrainSliceViewer";
import BrainRegionList from "@/components/brain/BrainRegionList";
import {
  loadAALLabels,
  loadAALJapaneseLabelsJson,
  preloadNiftiFiles,
  loadNiftiFile,
} from "@/utils/niftiUtils";
import { AALLabel, AALJapaneseLabel, NiftiData } from "@/types/brain";

export default function BrainDatabasePage() {
  const [activeTab, setActiveTab] = useState<"viewer" | "about">("viewer");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aalLabels, setAalLabels] = useState<AALLabel[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
  const [showAAL, setShowAAL] = useState(true);
  const [japaneseLabels, setJapaneseLabels] = useState<Record<string, string>>(
    {}
  );
  const [japaneseLabelsData, setJapaneseLabelsData] = useState<
    AALJapaneseLabel[]
  >([]);
  const [mniData, setMniData] = useState<NiftiData | null>(null);
  const [aalVolume, setAalVolume] = useState<
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Float32Array
    | Float64Array
    | null
  >(null);
  const [crosshairPosition, setCrosshairPosition] = useState<
    [number, number, number]
  >([91, 109, 91]);
  const [aalOpacity, setAalOpacity] = useState<number>(30);
  const [mniOpacity, setMniOpacity] = useState<number>(0);
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const [cursorInfo, setCursorInfo] = useState<{
    voxel: [number, number, number];
    mni: [number, number, number];
    sliceType: string;
    regionIndex: number | null;
  } | null>({
    voxel: [91, 109, 91],
    mni: [0, 0, 0],
    sliceType: "axial",
    regionIndex: null,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<AALLabel[]>([]);

  // AALラベルの読み込み
  useEffect(() => {
    const loadLabels = async () => {
      try {
        const labels = await loadAALLabels("/data/brain/AAL3v1.nii.txt");
        setAalLabels(labels);

        // 日本語ラベルの読み込み（JSONファイルから）
        const japLabelsData = await loadAALJapaneseLabelsJson(
          "/data/brain/AAL3_Jap.json"
        );
        setJapaneseLabelsData(japLabelsData);

        // 後方互換性のために従来の形式のマッピングも作成
        const japLabelsMap: Record<string, string> = {};
        japLabelsData.forEach((item) => {
          const fullLabel = item.laterality
            ? `${item.japaneseLabel} ${item.laterality}`
            : item.japaneseLabel;
          japLabelsMap[item.englishLabel] = fullLabel;
        });
        setJapaneseLabels(japLabelsMap);

        // NIFTIデータの読み込み
        try {
          // MNIデータの読み込み
          const mni = await loadNiftiFile(
            "/data/brain/MNI152NLin6Asym_T1w_1mm.nii.gz"
          );
          setMniData(mni);

          // AALデータの読み込み
          const aal = await loadNiftiFile("/data/brain/AAL3v1_1mm.nii.gz");
          setAalVolume(aal.typedImage);

          console.log("NIFTIデータの読み込みが完了しました");
        } catch (niftiError) {
          console.error(
            "NIFTIデータの読み込み中にエラーが発生しました:",
            niftiError
          );
        }

        setIsLoading(false);

        // NIFTIファイルの先読み
        try {
          console.log("NIFTIファイルの先読みを開始します...");
          preloadNiftiFiles([
            "/data/brain/MNI152NLin6Asym_T1w_1mm.nii.gz",
            "/data/brain/AAL3v1_1mm.nii.gz",
          ]);
        } catch (preloadError) {
          console.error("先読み処理中にエラーが発生しました:", preloadError);
          // 先読みエラーはユーザー体験に影響しないので、エラー表示はしない
        }
      } catch (err) {
        console.error("Error loading AAL labels:", err);
        setError("AALラベルの読み込み中にエラーが発生しました。");
        setIsLoading(false);
      }
    };

    loadLabels();
  }, []);

  // 各スライスタイプの初期座標情報を設定
  useEffect(() => {
    // クロスヘア位置が設定されたら、各スライスタイプの座標情報も初期化
    if (crosshairPosition) {
      // MNI座標に変換（1mm等方ボクセル、原点は[91, 109, 91]を想定）
      const mniCoords: [number, number, number] = [
        (crosshairPosition[0] - 91) * 1,
        (crosshairPosition[1] - 109) * 1,
        (crosshairPosition[2] - 91) * 1,
      ];

      setCursorInfo({
        voxel: crosshairPosition,
        mni: mniCoords,
        sliceType: "axial",
        regionIndex: null,
      });
    }
  }, [crosshairPosition]);

  // 領域選択ハンドラ
  const handleRegionSelect = (
    regionIndex: number | null,
    clickPosition?: [number, number, number]
  ) => {
    // 同じ領域が選択された場合は選択解除（クロスヘア位置は変更しない）
    if (selectedRegion === regionIndex) {
      setSelectedRegion(null);
      return; // クロスヘア位置を変更せずに終了
    } else {
      setSelectedRegion(regionIndex);

      // クリック位置が指定されている場合は、その位置を使用
      if (clickPosition) {
        setCrosshairPosition(clickPosition);
        console.log(
          `クリック位置にクロスヘアを設定: [${clickPosition[0]}, ${clickPosition[1]}, ${clickPosition[2]}]`
        );
        return;
      }

      // 選択された領域の中心座標を取得して、クロスヘア位置を更新
      if (regionIndex && aalVolume && mniData) {
        // 選択された領域のすべてのボクセルを見つける
        const voxels: [number, number, number][] = [];

        // ボリュームデータをスキャンして、選択された領域のボクセルを収集
        for (let z = 0; z < mniData.dims[3]; z++) {
          for (let y = 0; y < mniData.dims[2]; y++) {
            for (let x = 0; x < mniData.dims[1]; x++) {
              const index =
                x + y * mniData.dims[1] + z * mniData.dims[1] * mniData.dims[2];
              if (aalVolume[index] === regionIndex) {
                voxels.push([x, y, z]);
              }
            }
          }
        }

        // 領域の中心座標を計算
        if (voxels.length > 0) {
          let sumX = 0,
            sumY = 0,
            sumZ = 0;
          voxels.forEach((voxel) => {
            sumX += voxel[0];
            sumY += voxel[1];
            sumZ += voxel[2];
          });

          const centerX = Math.round(sumX / voxels.length);
          const centerY = Math.round(sumY / voxels.length);
          const centerZ = Math.round(sumZ / voxels.length);

          // クロスヘア位置を更新して、すべての断面ビューワーを中心に移動
          const newPosition: [number, number, number] = [
            centerX,
            centerY,
            centerZ,
          ];
          setCrosshairPosition(newPosition);
          console.log(
            `領域 ${regionIndex} の中心に移動: [${centerX}, ${centerY}, ${centerZ}]`
          );
        }
      }
    }
  };

  // AAL表示切り替えハンドラ
  const handleToggleAAL = () => {
    setShowAAL(!showAAL);
  };

  // クロスヘア位置更新ハンドラ
  const handleCrosshairPositionChange = (
    position: [number, number, number]
  ) => {
    // 前の位置と同じ場合は更新しない
    if (
      crosshairPosition &&
      position[0] === crosshairPosition[0] &&
      position[1] === crosshairPosition[1] &&
      position[2] === crosshairPosition[2]
    ) {
      return;
    }

    // クロスヘア位置を更新
    setCrosshairPosition(position);
    console.log("クロスヘア位置が更新されました:", position);

    // 他の断面のビューアーに対して、クロスヘア位置を中心に表示するように指示
    // これは各ビューアーコンポーネントで処理される
    // クロスヘア位置の状態を更新するだけで、各ビューアーは自動的に更新される
  };

  // AAL透明度調整ハンドラ
  const handleAalOpacityChange = (value: number) => {
    setAalOpacity(value);
  };

  // MNI透明度調整ハンドラ
  const handleMniOpacityChange = (value: number) => {
    setMniOpacity(value);
  };

  // 領域ホバーハンドラ
  const handleRegionHover = (
    regionIndex: number | null,
    position?: {
      voxel: [number, number, number];
      mni: [number, number, number];
      sliceType: string;
    }
  ) => {
    setHoveredRegion(regionIndex);

    // クロスヘア位置のMNI座標を計算
    const crosshairMNI: [number, number, number] = [
      (crosshairPosition[0] - 91) * 1,
      (crosshairPosition[1] - 109) * 1,
      (crosshairPosition[2] - 91) * 1,
    ];

    if (position?.voxel) {
      // カーソルがビューワー内にある場合はその位置の座標を表示
      setCursorInfo({
        voxel: position.voxel,
        mni: position.mni,
        sliceType: position.sliceType,
        regionIndex: regionIndex,
      });
    } else {
      // カーソルがビューワーから外れた場合は、クロスヘア位置の座標を表示
      setCursorInfo({
        voxel: crosshairPosition,
        mni: crosshairMNI,
        sliceType: cursorInfo?.sliceType || "axial",
        regionIndex: null,
      });
    }
  };

  // 領域の詳細情報を取得する関数
  const getRegionDetails = (
    regionIndex: number | null
  ): AALJapaneseLabel | null => {
    if (!regionIndex) return null;

    const region = aalLabels.find((l) => l.index === regionIndex);
    if (!region) return null;

    const details = japaneseLabelsData.find(
      (item) => item.englishLabel === region.name
    );
    return details || null;
  };

  // 英語名から左右の接頭辞付き日本語名を取得する関数
  const getJapaneseNameWithPrefix = (englishName: string): string => {
    // JSONデータから検索
    const labelData = japaneseLabelsData.find(
      (item) => item.englishLabel === englishName
    );

    if (labelData) {
      // lateralityが存在する場合は接頭辞として追加
      if (labelData.laterality) {
        return labelData.laterality + labelData.japaneseLabel;
      }
      return labelData.japaneseLabel;
    }

    // 見つからない場合はカテゴリ名を返す
    const lowerName = englishName.toLowerCase();
    if (lowerName.includes("frontal")) return "前頭葉領域";
    if (lowerName.includes("temporal")) return "側頭葉領域";
    if (lowerName.includes("parietal")) return "頭頂葉領域";
    if (lowerName.includes("occipital")) return "後頭葉領域";
    if (lowerName.includes("cerebellum")) return "小脳領域";
    if (lowerName.includes("cingulate")) return "帯状回領域";
    if (lowerName.includes("insula")) return "島皮質領域";
    if (lowerName.includes("thalamus")) return "視床領域";

    return "脳領域";
  };

  // 座標表示用のフォーマット関数
  const formatCoordinates = (coords: [number, number, number]): string => {
    return `[${coords[0]}, ${coords[1]}, ${coords[2]}]`;
  };

  // MNI座標のフォーマット関数（小数点以下を丸める）
  const formatMNICoordinates = (coords: [number, number, number]): string => {
    return `[${coords.map((c) => Math.round(c)).join(", ")}]`;
  };

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

      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            脳機能データベース
          </h1>
          <p className="text-gray-600 mt-2">
            脳の解剖学的構造と機能的役割を探索するためのインタラクティブツール
          </p>
        </div>

        {/* コントロールパネル、座標表示、検索窓を横一列に配置 */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 h-[72px]">
          {/* コントロールパネル - 幅を広げ、ボタンと透過性バーを中央配置 */}
          <div className="md:col-span-5 bg-gray-50 rounded-md border border-gray-200 shadow-sm flex items-center px-4">
            <div className="flex items-center pr-6">
              <button
                className={`px-3 py-1.5 text-sm rounded ${
                  showAAL ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={handleToggleAAL}
              >
                ラベル {showAAL ? "ON" : "OFF"}
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-2">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 w-24">
                  ラベル透過性:
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aalOpacity}
                  onChange={(e) =>
                    handleAalOpacityChange(Number(e.target.value))
                  }
                  className="flex-1 mx-2"
                  title={`透過性: ${aalOpacity}%`}
                />
                <span className="text-sm text-gray-500 w-8 text-right">
                  {aalOpacity}%
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-600 w-24">MRI透過性:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={mniOpacity}
                  onChange={(e) =>
                    handleMniOpacityChange(Number(e.target.value))
                  }
                  className="flex-1 mx-2"
                  title={`透過性: ${mniOpacity}%`}
                />
                <span className="text-sm text-gray-500 w-8 text-right">
                  {mniOpacity}%
                </span>
              </div>
            </div>
          </div>

          {/* 座標表示パネル - 高さを合わせて中央配置 */}
          <div className="md:col-span-3 bg-gray-50 rounded-md border border-gray-200 shadow-sm flex flex-col justify-center px-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-gray-600 font-medium w-12">Voxel:</span>
              <span className="font-mono">
                {cursorInfo ? formatCoordinates(cursorInfo.voxel) : "[-, -, -]"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 font-medium w-12">MNI:</span>
              <span className="font-mono">
                {cursorInfo
                  ? formatMNICoordinates(cursorInfo.mni)
                  : "[-, -, -]"}
              </span>
            </div>
          </div>

          {/* 検索窓 - 高さを合わせる */}
          <div className="md:col-span-4 relative h-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="脳領域を検索..."
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);

                if (query.trim() === "") {
                  setSearchResults([]);
                  return;
                }

                // インクリメンタルサーチの実装
                const results = aalLabels
                  .filter((label) => {
                    const japaneseName = getJapaneseNameWithPrefix(label.name);
                    return (
                      japaneseName
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                      label.name.toLowerCase().includes(query.toLowerCase())
                    );
                  })
                  .slice(0, 10); // 最大10件まで表示

                setSearchResults(results);
              }}
              className="w-full h-full pl-10 pr-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            />
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <ul>
                  {searchResults.map((result) => (
                    <li
                      key={result.index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        handleRegionSelect(result.index);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <span className="font-medium">
                        {getJapaneseNameWithPrefix(result.name)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({result.name})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
              <p>データを読み込み中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p className="font-bold">エラー</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-md shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="bg-gray-50 py-1 px-2 border-b text-center">
                      <span className="text-sm font-medium text-gray-700">
                        軸位断 (Axial)
                      </span>
                    </div>
                    <BrainSliceViewer
                      mniUrl="/data/brain/MNI152NLin6Asym_T1w_1mm.nii.gz"
                      aalUrl="/data/brain/AAL3v1_1mm.nii.gz"
                      aalLabels={aalLabels}
                      selectedRegion={selectedRegion}
                      sliceType="axial"
                      onRegionClick={handleRegionSelect}
                      showAAL={showAAL}
                      japaneseLabelsData={japaneseLabelsData}
                      crosshairPosition={crosshairPosition}
                      onCrosshairPositionChange={handleCrosshairPositionChange}
                      aalOpacity={aalOpacity}
                      mniOpacity={mniOpacity}
                      hoveredRegion={hoveredRegion}
                      onRegionHover={handleRegionHover}
                    />
                  </div>
                  <div className="border rounded-md shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="bg-gray-50 py-1 px-2 border-b text-center">
                      <span className="text-sm font-medium text-gray-700">
                        冠状断 (Coronal)
                      </span>
                    </div>
                    <BrainSliceViewer
                      mniUrl="/data/brain/MNI152NLin6Asym_T1w_1mm.nii.gz"
                      aalUrl="/data/brain/AAL3v1_1mm.nii.gz"
                      aalLabels={aalLabels}
                      selectedRegion={selectedRegion}
                      sliceType="coronal"
                      onRegionClick={handleRegionSelect}
                      showAAL={showAAL}
                      japaneseLabelsData={japaneseLabelsData}
                      crosshairPosition={crosshairPosition}
                      onCrosshairPositionChange={handleCrosshairPositionChange}
                      aalOpacity={aalOpacity}
                      mniOpacity={mniOpacity}
                      hoveredRegion={hoveredRegion}
                      onRegionHover={handleRegionHover}
                    />
                  </div>
                  <div className="border rounded-md shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="bg-gray-50 py-1 px-2 border-b text-center">
                      <span className="text-sm font-medium text-gray-700">
                        矢状断 (Sagittal)
                      </span>
                    </div>
                    <BrainSliceViewer
                      mniUrl="/data/brain/MNI152NLin6Asym_T1w_1mm.nii.gz"
                      aalUrl="/data/brain/AAL3v1_1mm.nii.gz"
                      aalLabels={aalLabels}
                      selectedRegion={selectedRegion}
                      sliceType="sagittal"
                      onRegionClick={handleRegionSelect}
                      showAAL={showAAL}
                      japaneseLabelsData={japaneseLabelsData}
                      crosshairPosition={crosshairPosition}
                      onCrosshairPositionChange={handleCrosshairPositionChange}
                      aalOpacity={aalOpacity}
                      mniOpacity={mniOpacity}
                      hoveredRegion={hoveredRegion}
                      onRegionHover={handleRegionHover}
                    />
                  </div>
                </div>

                {/* 選択された領域の情報表示と脳領域リストを横並びに配置 */}
                <div className="grid grid-cols-1 gap-4">
                  {/* 選択された領域の情報表示 */}
                  <div className="p-4 bg-white border border-blue-300 rounded-md shadow-md min-h-[400px] max-h-[800px] overflow-y-auto">
                    {selectedRegion ? (
                      <div className="space-y-4">
                        {/* 領域名を日本語で大きく表示し、英語名も併記 */}
                        <div>
                          <h3 className="font-bold text-2xl text-blue-700 mb-3 flex flex-col md:flex-row md:items-baseline md:gap-3">
                            <span>
                              {(() => {
                                const selectedLabel = aalLabels.find(
                                  (l) => l.index === selectedRegion
                                );
                                const name = selectedLabel?.name || "";
                                return getJapaneseNameWithPrefix(name);
                              })()}
                            </span>
                            {(() => {
                              const details = getRegionDetails(selectedRegion);
                              if (!details) return null;
                              return (
                                <span className="ml-6 text-xl text-gray-600">
                                  {details.englishName || ""}
                                </span>
                              );
                            })()}
                          </h3>
                        </div>

                        {/* 詳細情報の表示 */}
                        {(() => {
                          const details = getRegionDetails(selectedRegion);
                          if (!details) return null;

                          return (
                            <div className="grid grid-cols-2 gap-6">
                              {/* 左列：機能 */}
                              <div>
                                {details.functionalRole && (
                                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                    <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                      機能
                                    </h4>
                                    <ul className="space-y-2 ml-3">
                                      {Array.isArray(details.functionalRole) ? (
                                        details.functionalRole.map(
                                          (role, i) => (
                                            <li
                                              key={i}
                                              className="text-gray-600 text-[0.95rem] leading-relaxed flex items-start"
                                            >
                                              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-[0.45rem]"></span>
                                              <div>
                                                <span className="font-bold">
                                                  {role}
                                                </span>
                                              </div>
                                            </li>
                                          )
                                        )
                                      ) : (
                                        <li className="text-gray-600 text-[0.95rem] leading-relaxed flex items-start">
                                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-[0.45rem]"></span>
                                          <div>
                                            <span className="font-bold">
                                              {details.functionalRole}
                                            </span>
                                          </div>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {details.connections &&
                                  details.connections.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mt-4">
                                      <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                        主な神経接続
                                      </h4>
                                      <ul className="space-y-2 ml-3">
                                        {details.connections.map((conn, i) => (
                                          <li
                                            key={i}
                                            className="text-gray-600 text-[0.95rem] leading-relaxed flex items-start"
                                          >
                                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-[0.45rem]"></span>
                                            {conn}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                              </div>

                              {/* 右列：症状と疾患 */}
                              <div>
                                {details.symptoms &&
                                  (Array.isArray(details.symptoms)
                                    ? details.symptoms.length > 0
                                    : Object.keys(details.symptoms).length >
                                      0) && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                      <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                        障害時の症状
                                      </h4>
                                      {Array.isArray(details.symptoms) ? (
                                        <ul className="space-y-2 ml-3">
                                          {details.symptoms.map(
                                            (symptom, i) => (
                                              <li
                                                key={i}
                                                className="text-gray-600 text-[0.95rem] leading-relaxed flex items-start"
                                              >
                                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-[0.45rem]"></span>
                                                <div>
                                                  <span className="font-bold">
                                                    {symptom}
                                                  </span>
                                                </div>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      ) : typeof details.symptoms ===
                                        "object" ? (
                                        <div className="space-y-4">
                                          {Object.entries(details.symptoms).map(
                                            (
                                              [part, symptoms],
                                              index,
                                              array
                                            ) => (
                                              <div
                                                key={part}
                                                className={`${index < array.length - 1 ? "border-b border-gray-100 pb-3" : ""}`}
                                              >
                                                <div className="flex items-start gap-4">
                                                  <h5 className="text-gray-700 font-medium text-sm px-2 py-1 bg-sky-100 rounded w-20 shrink-0 text-center">
                                                    {part}
                                                  </h5>
                                                  <div className="flex-1">
                                                    <ul className="space-y-2">
                                                      {Array.isArray(
                                                        symptoms
                                                      ) ? (
                                                        symptoms.map(
                                                          (symptom, i) => (
                                                            <li
                                                              key={i}
                                                              className="text-gray-600 text-[0.95rem] leading-relaxed flex items-start"
                                                            >
                                                              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-[0.45rem]"></span>
                                                              <div>
                                                                <span className="font-bold">
                                                                  {symptom}
                                                                </span>
                                                              </div>
                                                            </li>
                                                          )
                                                        )
                                                      ) : (
                                                        <li className="text-gray-600 text-[0.95rem] leading-relaxed flex items-start">
                                                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-[0.45rem]"></span>
                                                          <div>
                                                            <span className="font-bold">
                                                              {symptoms}
                                                            </span>
                                                          </div>
                                                        </li>
                                                      )}
                                                    </ul>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      ) : (
                                        <div className="text-gray-600 text-[0.95rem] leading-relaxed">
                                          {details.symptoms}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                {details.relatedDisorders &&
                                  details.relatedDisorders.length > 0 && (
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mt-4">
                                      <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                        関連する疾患
                                      </h4>
                                      <ul className="space-y-2 ml-3">
                                        {details.relatedDisorders.map(
                                          (disorder, i) => (
                                            <li
                                              key={i}
                                              className="text-gray-600 text-[0.95rem] leading-relaxed flex items-start"
                                            >
                                              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-[0.45rem]"></span>
                                              {disorder}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </div>
                                  )}
                              </div>

                              {details.references &&
                                details.references.length > 0 && (
                                  <div className="col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-100 mt-4">
                                    <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-200">
                                      参考文献
                                    </h4>
                                    <ul className="space-y-2 ml-3">
                                      {details.references.map((ref, i) => (
                                        <li
                                          key={i}
                                          className="text-gray-600 text-sm leading-relaxed flex items-start"
                                        >
                                          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mr-2 mt-[0.45rem]"></span>
                                          {ref}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-lg text-gray-500 font-medium">
                          領域を選択してください
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
          <p className="font-bold">更新情報</p>
          <p>
            クロスヘアナビゲーション、透明度調整機能、詳細な領域情報表示機能が追加されました。断面ビューワーで脳領域をクリックすると、他の断面でも同じ位置が表示されるようになりました。
          </p>
        </div>
      </div>
    </div>
  );
}
