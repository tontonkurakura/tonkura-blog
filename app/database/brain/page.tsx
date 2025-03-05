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

// AALラベルの型定義
interface AALLabel {
  index: number;
  name: string;
  color: string;
}

// 日本語ラベルの型定義
interface AALJapaneseLabel {
  englishLabel: string;
  japaneseLabel: string;
  laterality: string;
  category: string;
  englishName?: string;
  functionalRole?: string;
  connections?: string[];
  relatedDisorders?: string[];
  references?: string[];
}

// NIFTIデータの型定義
interface NiftiData {
  dims: number[];
  pixDims: number[];
  datatypeCode: number;
  typedImage:
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Float32Array
    | Float64Array;
}

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
      // axial用の座標情報
      setCursorInfo({
        voxel: crosshairPosition,
        mni: crosshairPosition,
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
    // カーソル情報を更新
    if (position) {
      setCursorInfo({
        voxel: position.voxel,
        mni: position.mni,
        sliceType: position.sliceType,
        regionIndex: regionIndex,
      });
    } else if (cursorInfo) {
      setCursorInfo({
        ...cursorInfo,
        regionIndex: regionIndex,
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

      <h1 className="text-3xl font-bold mb-6">脳機能データベース</h1>

      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === "viewer" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("viewer")}
          >
            ビューワー
          </button>
          <button
            className={`px-4 py-2 ${activeTab === "about" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("about")}
          >
            データについて
          </button>
        </div>
      </div>

      {activeTab === "viewer" ? (
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
                <h2 className="text-xl font-semibold mb-4">脳断面ビューワー</h2>
                <div className="space-y-4">
                  {/* コントロールパネル */}
                  <div className="flex flex-col space-y-3 mb-4">
                    <div className="flex items-center space-x-4">
                      <button
                        className={`px-3 py-1 rounded ${
                          showAAL ? "bg-blue-500 text-white" : "bg-gray-200"
                        }`}
                        onClick={handleToggleAAL}
                      >
                        ラベル表示 {showAAL ? "ON" : "OFF"}
                      </button>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ラベル透明度
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={aalOpacity}
                          onChange={(e) =>
                            handleAalOpacityChange(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          MRI透明度
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mniOpacity}
                          onChange={(e) =>
                            handleMniOpacityChange(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  {/* 選択された領域の情報表示 - 上部に配置 */}
                  <div className="mb-4 p-4 bg-white border border-blue-300 rounded-md shadow-md h-64 overflow-y-auto">
                    {selectedRegion ? (
                      <>
                        {/* 領域名を日本語で大きく表示し、英語名も併記 */}
                        <h3 className="font-bold text-2xl text-blue-700 mb-1">
                          {(() => {
                            const selectedLabel = aalLabels.find(
                              (l) => l.index === selectedRegion
                            );
                            const name = selectedLabel?.name || "";

                            // CSVから読み込んだ日本語名を使用
                            return getJapaneseNameWithPrefix(name);
                          })()}
                        </h3>
                        {/* 英語名称の表示 */}
                        {(() => {
                          const details = getRegionDetails(selectedRegion);
                          if (!details) return null;
                          return (
                            <p className="text-md text-gray-600 mb-3 italic">
                              {details.englishName || ""}
                            </p>
                          );
                        })()}

                        {/* 詳細情報の表示 */}
                        {(() => {
                          const details = getRegionDetails(selectedRegion);
                          if (!details || !details.functionalRole) return null;

                          return (
                            <div className="mt-4">
                              <div className="mb-3">
                                <h4 className="font-semibold text-gray-800">
                                  機能的役割
                                </h4>
                                <p className="text-gray-700">
                                  {details.functionalRole}
                                </p>
                              </div>

                              {details.connections &&
                                details.connections.length > 0 && (
                                  <div className="mb-3">
                                    <h4 className="font-semibold text-gray-800">
                                      主な神経接続
                                    </h4>
                                    <ul className="list-disc pl-5">
                                      {details.connections.map((conn, i) => (
                                        <li key={i} className="text-gray-700">
                                          {conn}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              {details.relatedDisorders &&
                                details.relatedDisorders.length > 0 && (
                                  <div className="mb-3">
                                    <h4 className="font-semibold text-gray-800">
                                      関連する疾患
                                    </h4>
                                    <ul className="list-disc pl-5">
                                      {details.relatedDisorders.map(
                                        (disorder, i) => (
                                          <li key={i} className="text-gray-700">
                                            {disorder}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}

                              {details.references &&
                                details.references.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      参考文献
                                    </h4>
                                    <ul className="list-disc pl-5">
                                      {details.references.map((ref, i) => (
                                        <li key={i} className="text-gray-700">
                                          {ref}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-lg text-gray-500 font-medium">
                          領域を選択してください
                        </p>
                      </div>
                    )}
                  </div>

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
                        onCrosshairPositionChange={
                          handleCrosshairPositionChange
                        }
                        aalOpacity={aalOpacity}
                        mniOpacity={mniOpacity}
                        hoveredRegion={hoveredRegion}
                        onRegionHover={handleRegionHover}
                      />
                      {/* 座標情報パネル - 軸位断 */}
                      <div className="bg-gray-50 text-sm py-2 px-3 border-t">
                        <div className="flex items-center justify-center">
                          <span className="text-gray-600 font-medium w-16 text-right pr-2">
                            Voxel:
                          </span>
                          <span className="font-mono w-28 text-left">
                            {cursorInfo && cursorInfo.sliceType === "axial"
                              ? `[${cursorInfo.voxel[0]}, ${cursorInfo.voxel[1]}, ${cursorInfo.voxel[2]}]`
                              : "[-, -, -]"}
                          </span>
                        </div>
                        <div className="flex items-center justify-center mt-1">
                          <span className="text-gray-600 font-medium w-16 text-right pr-2">
                            MNI:
                          </span>
                          <span className="font-mono w-28 text-left">
                            {cursorInfo && cursorInfo.sliceType === "axial"
                              ? `[${Math.round(cursorInfo.mni[0])}, ${Math.round(cursorInfo.mni[1])}, ${Math.round(cursorInfo.mni[2])}]`
                              : "[-, -, -]"}
                          </span>
                        </div>
                      </div>
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
                        onCrosshairPositionChange={
                          handleCrosshairPositionChange
                        }
                        aalOpacity={aalOpacity}
                        mniOpacity={mniOpacity}
                        hoveredRegion={hoveredRegion}
                        onRegionHover={handleRegionHover}
                      />
                      {/* 座標情報パネル - 冠状断 */}
                      <div className="bg-gray-50 text-sm py-2 px-3 border-t">
                        <div className="flex items-center justify-center">
                          <span className="text-gray-600 font-medium w-16 text-right pr-2">
                            Voxel:
                          </span>
                          <span className="font-mono w-28 text-left">
                            {cursorInfo && cursorInfo.sliceType === "coronal"
                              ? `[${cursorInfo.voxel[0]}, ${cursorInfo.voxel[1]}, ${cursorInfo.voxel[2]}]`
                              : "[-, -, -]"}
                          </span>
                        </div>
                        <div className="flex items-center justify-center mt-1">
                          <span className="text-gray-600 font-medium w-16 text-right pr-2">
                            MNI:
                          </span>
                          <span className="font-mono w-28 text-left">
                            {cursorInfo && cursorInfo.sliceType === "coronal"
                              ? `[${Math.round(cursorInfo.mni[0])}, ${Math.round(cursorInfo.mni[1])}, ${Math.round(cursorInfo.mni[2])}]`
                              : "[-, -, -]"}
                          </span>
                        </div>
                      </div>
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
                        onCrosshairPositionChange={
                          handleCrosshairPositionChange
                        }
                        aalOpacity={aalOpacity}
                        mniOpacity={mniOpacity}
                        hoveredRegion={hoveredRegion}
                        onRegionHover={handleRegionHover}
                      />
                      {/* 座標情報パネル - 矢状断 */}
                      <div className="bg-gray-50 text-sm py-2 px-3 border-t">
                        <div className="flex items-center justify-center">
                          <span className="text-gray-600 font-medium w-16 text-right pr-2">
                            Voxel:
                          </span>
                          <span className="font-mono w-28 text-left">
                            {cursorInfo && cursorInfo.sliceType === "sagittal"
                              ? `[${cursorInfo.voxel[0]}, ${cursorInfo.voxel[1]}, ${cursorInfo.voxel[2]}]`
                              : "[-, -, -]"}
                          </span>
                        </div>
                        <div className="flex items-center justify-center mt-1">
                          <span className="text-gray-600 font-medium w-16 text-right pr-2">
                            MNI:
                          </span>
                          <span className="font-mono w-28 text-left">
                            {cursorInfo && cursorInfo.sliceType === "sagittal"
                              ? `[${Math.round(cursorInfo.mni[0])}, ${Math.round(cursorInfo.mni[1])}, ${Math.round(cursorInfo.mni[2])}]`
                              : "[-, -, -]"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 脳領域情報を下部に移動 */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-semibold mb-4">脳領域情報</h2>
                <div className="h-[400px]">
                  <BrainRegionList
                    regions={aalLabels}
                    selectedRegion={selectedRegion}
                    onRegionSelect={handleRegionSelect}
                    japaneseLabels={japaneseLabels}
                    japaneseLabelsData={japaneseLabelsData}
                  />
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
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">
            脳機能データベースについて
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">
              MNI152標準脳テンプレート
            </h3>
            <p className="mb-2">
              MNI152は、モントリオール神経学研究所（Montreal Neurological
              Institute）で開発された標準脳テンプレートです。
              152人の健常者の脳MRIを平均化して作成されており、脳画像研究における標準的な座標系として広く使用されています。
            </p>
            <p>
              このテンプレートを使用することで、異なる個人間や研究間での脳領域の位置を統一的に参照することが可能になります。
              1mm等方性の高解像度バージョンを使用しており、詳細な解剖学的構造を確認できます。
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">AAL3パーセレーション</h3>
            <p className="mb-2">
              AAL（Automated Anatomical
              Labeling）は、脳の解剖学的領域を自動的にラベル付けするためのアトラスです。
              AAL3は最新バージョンで、脳の皮質および皮質下構造を170の領域に分割しています。
            </p>
            <p>
              各領域には固有の番号とラベル名が付けられており、脳機能研究や神経科学研究において広く使用されています。
              このデータベースでは、AAL3アトラスを使用して脳領域を視覚化し、各領域の解剖学的位置を確認できます。
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">データソース</h3>
            <p className="mb-2">
              MNI152テンプレートとAAL3アトラスは、研究目的で公開されているデータを使用しています。
              詳細な情報や原著論文については、以下の参考文献を参照してください。
            </p>
            <ul className="list-disc pl-6">
              <li>
                Fonov V, Evans AC, Botteron K, Almli CR, McKinstry RC, Collins
                DL. Unbiased average age-appropriate atlases for pediatric
                studies. NeuroImage, 54(1):313-327, 2011.
              </li>
              <li>
                Rolls ET, Huang CC, Lin CP, Feng J, Joliot M. Automated
                anatomical labelling atlas 3. NeuroImage, 206:116189, 2020.
              </li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500">
            <p className="font-bold">開発状況</p>
            <p>
              現在、3Dビューワー機能は開発中のため一時的に無効化しています。今後のアップデートで実装予定です。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
