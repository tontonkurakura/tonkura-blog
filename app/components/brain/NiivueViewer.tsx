"use client";

import { useEffect, useRef, useState } from "react";
import { Niivue } from "@niivue/niivue";
import NiivueControlPanel from "./NiivueControlPanel";

/**
 * NiivueViewerコンポーネント
 *
 * Niivueライブラリを使用して脳画像を表示するコンポーネント
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.volumeUrl - 表示する脳画像のURL
 * @param {string|string[]} props.overlayUrl - オーバーレイする画像のURL。複数指定可能。
 * @param {number} props.width - ビューアーの幅
 * @param {number} props.height - ビューアーの高さ
 * @param {boolean} props.showControls - コントロールパネルを表示するかどうか
 * @param {string} props.atlasType - "hcp" または "aal3" または "tract" を指定
 * @param {boolean} props.isTractMode - 白質線維モードかどうか
 */
interface NiivueViewerProps {
  volumeUrl?: string;
  overlayUrl?: string | string[];
  width?: number;
  height?: number;
  showControls?: boolean;
  atlasType?: string; // "hcp" または "aal3" または "tract" を指定
  isTractMode?: boolean; // 白質線維モードかどうか
}

// MNI座標とアトラス情報の型定義
interface LocationData {
  mm?: number[]; // mmでの座標（物理空間）
  vox?: number[]; // ボクセル座標（画像空間）
  values?: number[];
  // 追加のプロパティ
  frac?: number[]; // 正規化座標
}

// アトラスのラベル情報を格納するインターフェース
interface AtlasLabel {
  id: number;
  hemisphere: string;
  label_id: string;
  english_name?: string;
  network?: string;
  // AAL3アトラス用の追加フィールド
  japaneseLabel?: string;
  category?: string;
  functionalRole?: string | string[];
  laterality?: string; // 「左」または「右」
}

interface AtlasLabels {
  [key: string]: AtlasLabel;
}

export default function NiivueViewer({
  volumeUrl = "https://niivue.github.io/niivue/images/mni152.nii.gz",
  overlayUrl,
  width = 800,
  height = 600,
  showControls = true,
  atlasType = "hcp", // デフォルトはHCP-MMP1アトラス
  isTractMode = false, // デフォルトは白質線維モードではない
}: NiivueViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [niivue, setNiivue] = useState<Niivue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [atlasLabels, setAtlasLabels] = useState<AtlasLabels>({});
  const [currentViewMode, setCurrentViewMode] = useState<number>(3); // 初期値は3（マルチプラナー）
  const [highlightedRegion, setHighlightedRegion] = useState<number | null>(
    null
  ); // ハイライトされたリージョンのID

  // カスタムカラーマップを作成する関数
  const createCustomColormap = (niivueInstance: Niivue) => {
    try {
      // AAL3用のカスタムカラーマップを作成 - よりカラフルでランダムなバージョン
      // 隣接する領域の境界がはっきりわかるように
      const aal3CustomColormap = {
        R: Array(256)
          .fill(0)
          .map((_, i) => {
            // 値が0の場合は背景なので透明に
            if (i === 0) return 0;
            // それ以外はランダムな色を生成（シード値としてインデックスを使用）
            // 左右半球で同じ名前の領域が同じ色になるように、領域IDを使用
            // AAL3では奇数が左半球、偶数が右半球で、偶数の場合は-1して対応する奇数を取得
            const regionId = i % 2 === 1 ? i : i - 1;
            // 明るい色を生成するために、ベース値を高くする
            return Math.min(
              150 + Math.floor(Math.sin(regionId * 12.9898) * 105),
              255
            );
          }),
        G: Array(256)
          .fill(0)
          .map((_, i) => {
            // 値が0の場合は背景なので透明に
            if (i === 0) return 0;
            // 左右半球で同じ名前の領域が同じ色になるように、領域IDを使用
            // 奇数の場合はそのまま、偶数の場合は-1して対応する奇数を取得
            const regionId = i % 2 === 1 ? i : i - 1;
            // 明るい色を生成するために、ベース値を高くする
            return Math.min(
              150 + Math.floor(Math.sin(regionId * 78.233) * 105),
              255
            );
          }),
        B: Array(256)
          .fill(0)
          .map((_, i) => {
            // 値が0の場合は背景なので透明に
            if (i === 0) return 0;
            // 左右半球で同じ名前の領域が同じ色になるように、領域IDを使用
            // 奇数の場合はそのまま、偶数の場合は-1して対応する奇数を取得
            const regionId = i % 2 === 1 ? i : i - 1;
            // 明るい色を生成するために、ベース値を高くする
            return Math.min(
              150 + Math.floor(Math.sin(regionId * 37.719) * 105),
              255
            );
          }),
        A: Array(256)
          .fill(0)
          .map((_, i) => {
            // 透明度を調整：値が0の場合のみ透明、それ以外は半透明（150）
            return i === 0 ? 0 : 150;
          }),
        I: Array.from({ length: 256 }, (_, i) => i), // インデックス
      };

      // カラーマップをNiivueに追加
      niivueInstance.addColormap("aal3custom", aal3CustomColormap);
      console.log("カスタムカラーマップ「aal3custom」を追加しました");

      return true;
    } catch (error) {
      console.error("カスタムカラーマップの作成に失敗しました:", error);
      return false;
    }
  };

  // キャンバスのリサイズを処理する関数
  const handleResize = () => {
    if (niivue && canvasRef.current && containerRef.current) {
      // コンテナの幅に基づいてキャンバスをリサイズ
      const containerWidth = containerRef.current.clientWidth;
      // アスペクト比を維持（4:3）
      const aspectRatio = 4 / 3;
      const newHeight = containerWidth / aspectRatio;

      // キャンバスのサイズを設定
      canvasRef.current.width = containerWidth;
      canvasRef.current.height = newHeight;

      // Niivueに新しいサイズを通知
      niivue.drawScene();
    }
  };

  // アトラスオーバーレイの場合、ラベルファイルを読み込む
  useEffect(() => {
    // アトラスオーバーレイが指定されている場合のみ実行
    if (overlayUrl) {
      // アトラスタイプに応じたJSONファイルパスを設定
      const labelFilePath =
        atlasType === "hcp"
          ? "/data/brain/atlas/HCP-MMP1/json/hcp_mmp1_labels.json"
          : "/data/brain/atlas/AAL3/AAL3_Jap.json";

      console.log(
        `${atlasType}アトラスラベルファイルを読み込みます:`,
        labelFilePath
      );

      fetch(labelFilePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `ラベルファイルの読み込みに失敗しました: ${response.status}`
            );
          }
          return response.json();
        })
        .then((data) => {
          console.log(
            `アトラスラベルを読み込みました: ${atlasType === "hcp" ? Object.keys(data).length : data.length}件`
          );

          // デバッグ用に最初の5つのラベルを表示
          if (atlasType === "hcp") {
            // HCP-MMP1アトラスの場合はそのまま使用
            const sampleLabels = Object.entries(data).slice(0, 5);
            console.log("サンプルラベル:", sampleLabels);
            setAtlasLabels(data);
          } else {
            // AAL3アトラスの場合は配列からオブジェクトに変換
            const formattedLabels: AtlasLabels = {};
            data.forEach((item: any, index: number) => {
              // インデックス+1をIDとして使用（AAL3のIDは1から始まる）
              const id = (index + 1).toString();
              formattedLabels[id] = {
                id: index + 1,
                hemisphere:
                  item.laterality === "左"
                    ? "L"
                    : item.laterality === "右"
                      ? "R"
                      : "",
                label_id: item.englishLabel,
                english_name: item.englishName,
                network: Array.isArray(item.network)
                  ? item.network[0]
                  : item.network,
                // AAL3アトラス用の追加フィールド
                japaneseLabel: item.japaneseLabel,
                category: item.category,
                functionalRole: item.functionalRole,
                laterality: item.laterality,
              };
            });

            // デバッグ用に最初の5つのラベルを表示
            const sampleLabels = Object.entries(formattedLabels).slice(0, 5);
            console.log("変換後のサンプルラベル:", sampleLabels);

            setAtlasLabels(formattedLabels);
          }
        })
        .catch((error) => {
          console.error("アトラスラベルファイルの読み込みエラー:", error);
        });
    }
  }, [overlayUrl, atlasType]);

  // アトラス領域名を取得する関数
  const getAtlasRegionName = (value: number | any): string => {
    // 値がnullまたはundefinedの場合
    if (value === null || value === undefined) {
      return "不明な領域";
    }

    // 値がオブジェクトの場合、実際の値を抽出
    let numericValue: number;

    if (typeof value === "object") {
      console.log("オブジェクト型のアトラス値:", value);
      // オブジェクトから値を抽出する試み
      if (value.value !== undefined) {
        numericValue = Number(value.value);
      } else if (value.label !== undefined) {
        numericValue = Number(value.label);
      } else {
        // JSONに変換して値を表示
        return `オブジェクト値: ${JSON.stringify(value)}`;
      }
    } else {
      // 数値またはその他の型の場合、数値に変換
      numericValue = Number(value);
    }

    // NaNチェック
    if (isNaN(numericValue)) {
      return `無効な値: ${value}`;
    }

    // 小数点があれば四捨五入
    const roundedValue = Math.round(numericValue);
    const regionIdStr = String(roundedValue);

    // 左右半球の判定はvoxel座標のx値で行う
    // locationData が存在し、ボクセル座標があれば、x座標で左右を判定
    // 判定を逆にする: 座標値96以上なら右半球と判断（FSLeyesと揃える）
    const isRightHemisphere =
      locationData &&
      locationData.vox &&
      locationData.vox.length > 0 &&
      locationData.vox[0] >= 96; // 座標値96以上なら右半球と判断

    // 半球情報
    const hemisphere = isRightHemisphere ? "R" : "L";

    // JSONから読み込んだラベル情報を使用
    if (atlasLabels && atlasLabels[regionIdStr]) {
      const label = atlasLabels[regionIdStr];

      // アトラスタイプに応じた表示形式
      if (atlasType === "hcp") {
        // HCP-MMP1アトラスの場合
        return `${hemisphere}_${label.label_id}（ID: ${roundedValue}）`;
      } else {
        // AAL3アトラスの場合
        // AAL3は左右の領域が別々のIDを持つため、ラベル自体に左右の情報が含まれている
        return `${label.laterality}${label.japaneseLabel}`;
      }
    } else {
      // 領域名が不明の場合
      return `${hemisphere}_Unknown（ID: ${roundedValue}）`;
    }
  };

  // 表示モードを変更する関数
  const changeViewMode = (mode: number) => {
    if (!niivue) return;

    // 現在の表示モードを更新
    setCurrentViewMode(mode);

    // 3Dモードの場合、クロスヘアの色を明るい赤色に変更して目立たせる
    if (mode === 4) {
      // 3Dレンダリングモード
      niivue.setCrosshairColor([1, 0, 0, 1]); // 完全な赤色（不透明度100%）
    } else {
      // 2Dモードの場合は元の色に戻す
      niivue.setCrosshairColor([1, 0, 0, 0.8]); // 元の赤色（不透明度80%）
    }

    // Niivueの表示モードを変更
    niivue.setSliceType(mode);
  };

  // アトラスの詳細情報を取得する関数
  const getAtlasDetails = (value: number | any): AtlasLabel | null => {
    if (value === null || value === undefined) {
      return null;
    }

    // 値がオブジェクトの場合、実際の値を抽出
    let numericValue: number;

    if (typeof value === "object") {
      // オブジェクトから値を抽出する試み
      if (value.value !== undefined) {
        numericValue = Number(value.value);
      } else if (value.label !== undefined) {
        numericValue = Number(value.label);
      } else {
        return null;
      }
    } else {
      // 数値またはその他の型の場合、数値に変換
      numericValue = Number(value);
    }

    // NaNチェック
    if (isNaN(numericValue)) {
      return null;
    }

    // 小数点があれば四捨五入
    const roundedValue = Math.round(numericValue);
    const regionIdStr = String(roundedValue);

    // JSONから読み込んだラベル情報を使用
    if (atlasLabels && atlasLabels[regionIdStr]) {
      return atlasLabels[regionIdStr];
    }

    return null;
  };

  // ネットワークに基づいて色を取得する関数
  const getNetworkColor = (network: string): string => {
    const networkColors: { [key: string]: string } = {
      visual: "#781286",
      somatosensory: "#4682B4",
      "dorsal attention": "#B22222",
      "ventral attention": "#228B22",
      limbic: "#FFA500",
      frontoparietal: "#00008B",
      "default mode": "#CD5C5C",
    };

    return networkColors[network] || "#808080"; // デフォルトはグレー
  };

  // リージョンをハイライトする関数
  const highlightRegion = (regionId: number | null) => {
    if (!niivue || !niivue.volumes || niivue.volumes.length < 2) return;

    // 以前のハイライトと同じ場合は何もしない
    if (regionId === highlightedRegion) return;

    // 新しいリージョンIDを設定
    setHighlightedRegion(regionId);

    // オーバーレイのカラーマップを更新
    if (regionId !== null) {
      // リージョンがハイライトされている場合、カラーマップを変更
      console.log(`リージョン ${regionId} をハイライトします`);

      // オーバーレイの不透明度を一時的に上げる
      const overlayVolume = niivue.volumes[1]; // オーバーレイは通常2番目のボリューム
      const originalOpacity = overlayVolume.opacity;

      // アトラスタイプに応じて不透明度を設定
      const highlightOpacity = 0.9;

      // 不透明度を上げる
      niivue.setOpacity(1, highlightOpacity); // インデックス1のボリューム（オーバーレイ）の不透明度を設定

      // 描画を更新
      niivue.updateGLVolume();
    } else {
      // ハイライトを解除する場合、元の設定に戻す
      console.log("ハイライトを解除します");

      // アトラスタイプに応じて不透明度を設定
      const defaultOpacity = 0.7;

      // 元の不透明度に戻す
      niivue.setOpacity(1, defaultOpacity); // インデックス1のボリューム（オーバーレイ）の不透明度を設定

      // 描画を更新
      niivue.updateGLVolume();
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Niivueインスタンスの初期化
    const nv = new Niivue({
      // Niivueの初期設定
      backColor: [0, 0, 0, 1],
      crosshairColor: [1, 0, 0, 0.8], // 赤色のクロスヘア
      dragMode: 1, // ドラッグモード: 1=コントラスト調整
      isRadiologicalConvention: false,
      sliceType: 3, // 初期表示をマルチプラナー（MPR）に設定
      show3Dcrosshair: true, // 3Dレンダリングモードでもクロスヘアを表示
      crosshairWidth: 2.0, // クロスヘアの太さを設定
    });

    // キャンバスの設定
    nv.attachToCanvas(canvasRef.current);

    // カスタムカラーマップを作成
    createCustomColormap(nv);

    // onLocationChangeコールバックの設定
    nv.onLocationChange = (data: any) => {
      // デバッグ情報
      if (data) {
        // 座標の型と正確な値を確認
        if (data.mm) {
          console.log("MM座標型：", typeof data.mm, Array.isArray(data.mm));
          console.log("MM座標生値：", data.mm);
          console.log("MM座標の長さ：", data.mm.length);
          // 4つ目の値がある場合はその値を確認（同次座標系のw成分と思われる）
          if (data.mm.length > 3) {
            console.log("MM座標の4つ目の値：", data.mm[3]);
          }
        }

        // locationDataの詳細情報をログに出力
        console.log("locationData詳細:", {
          mm: data.mm ? data.mm.map((v: number) => v.toFixed(2)) : null,
          vox: data.vox ? data.vox.map((v: number) => v.toFixed(2)) : null,
          frac: data.frac ? data.frac.map((v: number) => v.toFixed(2)) : null,
          values: data.values,
          allProperties: Object.keys(data),
        });

        // アトラス値の詳細情報
        if (data.values && data.values.length > 1) {
          const valuesInfo = {
            type: typeof data.values[1],
            value: data.values[1],
            isArray: Array.isArray(data.values[1]),
            keys:
              typeof data.values[1] === "object"
                ? Object.keys(data.values[1])
                : null,
          };
          console.log("アトラス値の詳細情報:", valuesInfo);

          // 現在のX座標を出力（半球判定のため）
          if (data.vox && data.vox.length > 0) {
            console.log("X座標（半球判定用）:", data.vox[0]);
          }

          // 現在のリージョンをハイライト
          if (typeof data.values[1] === "number") {
            // 数値の場合、そのままリージョンIDとして使用
            highlightRegion(Math.round(data.values[1]));
          } else if (
            typeof data.values[1] === "object" &&
            data.values[1] !== null
          ) {
            // オブジェクトの場合、値を抽出
            if (data.values[1].value !== undefined) {
              highlightRegion(Math.round(Number(data.values[1].value)));
            } else if (data.values[1].label !== undefined) {
              highlightRegion(Math.round(Number(data.values[1].label)));
            } else {
              // 値が取得できない場合はハイライトを解除
              highlightRegion(null);
            }
          } else {
            // 値が取得できない場合はハイライトを解除
            highlightRegion(null);
          }
        } else {
          // 値が取得できない場合はハイライトを解除
          highlightRegion(null);
        }
      }

      // 座標データは元の精度のまま保持
      setLocationData(data);
    };

    // ボリュームデータの読み込み
    setIsLoading(true);

    // まず基本画像のみを読み込む
    nv.loadVolumes([{ url: volumeUrl }])
      .then(() => {
        console.log("基本画像の読み込みが完了しました");

        // 基本画像の読み込みが完了したら、オーバーレイを追加（存在する場合）
        if (overlayUrl) {
          // 少し遅延を入れてからオーバーレイを追加
          setTimeout(() => {
            try {
              // アトラスタイプに応じてカラーマップと不透明度を設定
              const colormapName =
                atlasType === "aal3" ? "aal3custom" : "freesurfer";
              const opacityValue = atlasType === "aal3" ? 0.7 : 0.7;

              // overlayUrlが配列かどうかをチェック
              const urls = Array.isArray(overlayUrl)
                ? overlayUrl
                : [overlayUrl];

              // 複数のオーバーレイを順次読み込む
              const loadOverlays = async () => {
                try {
                  for (const url of urls) {
                    await nv.addVolumeFromUrl({
                      url: url,
                      colormap: colormapName,
                      opacity: opacityValue,
                    });
                    console.log(`オーバーレイの読み込みが完了しました: ${url}`);
                  }
                  console.log(
                    `すべてのオーバーレイ(${urls.length}個)の読み込みが完了しました`
                  );
                  setIsLoading(false);
                } catch (err) {
                  console.error("オーバーレイの読み込みに失敗しました:", err);
                  setIsLoading(false);
                }
              };

              loadOverlays();
            } catch (err) {
              console.error("オーバーレイの追加中にエラーが発生しました:", err);
              setIsLoading(false);
            }
          }, 500);
        } else {
          setIsLoading(false);
        }

        setNiivue(nv);

        // 読み込み完了後にリサイズを実行
        handleResize();
      })
      .catch((error) => {
        console.error("基本画像の読み込みに失敗しました:", error);
        setError("画像データの読み込みに失敗しました。");
        setIsLoading(false);
      });

    // ウィンドウリサイズイベントのリスナーを追加
    window.addEventListener("resize", handleResize);

    // クリーンアップ関数
    return () => {
      // リサイズイベントリスナーを削除
      window.removeEventListener("resize", handleResize);
      // 必要に応じてリソースをクリーンアップ
      if (nv) {
        try {
          // キャンバスをクリア
          nv.closeDrawing();
        } catch (e) {
          console.error("クリーンアップ中にエラーが発生しました:", e);
        }
      }
      setNiivue(null);
    };
  }, [volumeUrl, overlayUrl]); // volumeUrlまたはoverlayUrlが変更されたときに再実行

  return (
    <div className="niivue-container" ref={containerRef}>
      {isLoading && (
        <div className="flex justify-center items-center h-20 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <span className="ml-2">画像を読み込み中...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      <div
        className="canvas-container relative"
        style={{ aspectRatio: "4/3", maxWidth: "100%" }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border border-gray-300 rounded-lg w-full h-full object-contain"
        />
      </div>

      {/* MNI座標とアトラス情報の表示部分 - 白質線維モードでない場合のみ表示 */}
      {!isTractMode && locationData && locationData.mm && (
        <div className="bg-blue-100 p-3 rounded-lg mt-3 text-sm border border-blue-300">
          <div className="mb-2">
            <span className="font-bold">MNI座標: </span>
            <span>
              {locationData.mm
                .slice(0, 3)
                .map((v) => Math.round(v))
                .join(", ")}
            </span>
            {currentViewMode === 4 && (
              <span className="ml-2 text-xs bg-red-100 px-2 py-0.5 rounded text-red-700 font-semibold">
                3Dモード - クロスヘア位置
              </span>
            )}
          </div>

          {locationData.values &&
            locationData.values.length > 1 &&
            locationData.vox && (
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex flex-col">
                  <div>
                    <span className="font-bold">脳領域: </span>
                    <span
                      className={`${highlightedRegion !== null ? "text-red-600 font-semibold" : "text-blue-800"}`}
                    >
                      {getAtlasRegionName(locationData.values[1])}
                      {highlightedRegion !== null && (
                        <span className="ml-2 text-xs bg-yellow-100 px-2 py-0.5 rounded text-red-700">
                          ハイライト中
                        </span>
                      )}
                    </span>
                  </div>

                  {/* 追加情報の表示 */}
                  {(() => {
                    const details = getAtlasDetails(locationData.values[1]);
                    if (details) {
                      return (
                        <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                          {atlasType === "hcp" ? (
                            // HCP-MMP1アトラス用の表示
                            <>
                              {details.english_name && (
                                <div>
                                  <span className="font-semibold">
                                    英語名:{" "}
                                  </span>
                                  <span
                                    className={
                                      highlightedRegion !== null
                                        ? "text-red-600"
                                        : ""
                                    }
                                  >
                                    {details.english_name}
                                  </span>
                                </div>
                              )}
                              {details.label_id && (
                                <div>
                                  <span className="font-semibold">
                                    ラベルID:{" "}
                                  </span>
                                  <span
                                    className={
                                      highlightedRegion !== null
                                        ? "text-red-600"
                                        : ""
                                    }
                                  >
                                    {details.label_id}
                                  </span>
                                </div>
                              )}
                              {details.network && (
                                <div>
                                  <span className="font-semibold">
                                    ネットワーク:{" "}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-white ${highlightedRegion !== null ? "ring-2 ring-red-400" : ""}`}
                                    style={{
                                      backgroundColor: getNetworkColor(
                                        details.network
                                      ),
                                    }}
                                  >
                                    {details.network}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : (
                            // AAL3アトラス用の表示
                            <>
                              {details.english_name && (
                                <div>
                                  <span className="font-semibold">
                                    英語名:{" "}
                                  </span>
                                  <span
                                    className={
                                      highlightedRegion !== null
                                        ? "text-red-600"
                                        : ""
                                    }
                                  >
                                    {details.english_name}
                                  </span>
                                </div>
                              )}
                              {details.category && (
                                <div>
                                  <span className="font-semibold">
                                    カテゴリ:{" "}
                                  </span>
                                  <span
                                    className={
                                      highlightedRegion !== null
                                        ? "text-red-600"
                                        : ""
                                    }
                                  >
                                    {details.category}
                                  </span>
                                </div>
                              )}
                              {details.functionalRole && (
                                <div>
                                  <span className="font-semibold">
                                    機能的役割:{" "}
                                  </span>
                                  <span
                                    className={
                                      highlightedRegion !== null
                                        ? "text-red-600"
                                        : ""
                                    }
                                  >
                                    {Array.isArray(details.functionalRole)
                                      ? details.functionalRole[0]
                                      : details.functionalRole}
                                  </span>
                                </div>
                              )}
                              {details.network && (
                                <div>
                                  <span className="font-semibold">
                                    ネットワーク:{" "}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-white ${highlightedRegion !== null ? "ring-2 ring-red-400" : ""}`}
                                    style={{
                                      backgroundColor: getNetworkColor(
                                        details.network
                                      ),
                                    }}
                                  >
                                    {details.network}
                                  </span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            )}

          <div className="text-xs text-gray-600 mt-2">
            <span>
              ※ マウスカーソルを画像上で動かすと座標と脳領域が更新されます
            </span>
            {currentViewMode === 4 && (
              <div className="mt-1 text-red-600 font-semibold">
                ※ 3Dモードでは赤色のクロスヘア位置の情報が表示されています
              </div>
            )}
            {highlightedRegion !== null && (
              <div className="mt-1 text-red-600">
                ※ クロスヘア位置の脳領域がハイライト表示されています
              </div>
            )}
          </div>
        </div>
      )}

      {showControls && niivue && (
        <div className="mt-4">
          <NiivueControlPanel
            niivue={niivue}
            onViewModeChange={(mode: number) => changeViewMode(mode)}
          />
        </div>
      )}
    </div>
  );
}
