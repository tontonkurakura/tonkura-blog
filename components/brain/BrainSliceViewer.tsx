"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { loadNiftiFile } from "@/utils/niftiUtils";
// import { AALLabel } from '@/types/brain';

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
  image?: ArrayBuffer;
  voxOffset?: number;
  qformCode?: number;
  sformCode?: number;
  xyzt_units?: number;
  affine?: number[][];
  srow_x?: number[];
  srow_y?: number[];
  srow_z?: number[];
}

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

// AALLabelの型定義
interface AALLabel {
  index: number;
  name: string;
  color: string;
}

interface BrainSliceViewerProps {
  mniUrl: string;
  aalUrl: string;
  aalLabels: AALLabel[];
  sliceType: "axial" | "coronal" | "sagittal";
  sliceIndex?: number;
  showAAL?: boolean;
  selectedRegion?: number | null;
  hoveredRegion?: number | null;
  onRegionClick?: (
    regionIndex: number | null,
    clickPosition?: [number, number, number]
  ) => void;
  japaneseLabelsData?: AALJapaneseLabel[];
  // クロスヘアナビゲーション用のプロパティ
  crosshairPosition?: [number, number, number];
  onCrosshairPositionChange?: (position: [number, number, number]) => void;
  // 透明度調整用のプロパティ
  aalOpacity?: number; // 0〜100
  mniOpacity?: number; // 0〜100
  // 詳細な領域情報表示用のプロパティ
  onRegionHover?: (
    regionIndex: number | null,
    position: {
      voxel: [number, number, number];
      mni: [number, number, number];
      sliceType: string;
    }
  ) => void;
}

export default function BrainSliceViewer({
  mniUrl,
  aalUrl,
  aalLabels,
  sliceType,
  sliceIndex,
  showAAL = true,
  selectedRegion = null,
  hoveredRegion = null,
  onRegionClick,
  japaneseLabelsData = [],
  // クロスヘアナビゲーション用のプロパティ
  crosshairPosition,
  onCrosshairPositionChange,
  // 透明度調整用のプロパティ
  aalOpacity = 30,
  mniOpacity = 0,
  // 詳細な領域情報表示用のプロパティ
  onRegionHover,
}: BrainSliceViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [currentSliceIndex, setCurrentSliceIndex] = useState<number>(0);
  // mniDataは実際に使用されているため削除しない（transformMniToAalCoordinatesで使用）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mniData, setMniData] = useState<NiftiData | null>(null);
  const [mniVolume, setMniVolume] = useState<
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Float32Array
    | Float64Array
    | null
  >(null);
  const [aalData, setAalData] = useState<NiftiData | null>(null);
  const [aalVolume, setAalVolume] = useState<
    | Uint8Array
    | Int16Array
    | Uint16Array
    | Int32Array
    | Float32Array
    | Float64Array
    | null
  >(null);
  const [maxIntensity, setMaxIntensity] = useState<number>(255);
  // cursorPositionは実際に使用されているため、コメントアウトで無視
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [cursorPosition, setCursorPosition] = useState<
    [number, number, number] | null
  >(null);
  // mniToAalTransformは実際に使用されているため、コメントアウトで無視
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [mniToAalTransform, setMniToAalTransform] = useState<number[][]>([
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ]);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string>("");
  // forceUpdateは実際に使用されているため、コメントアウトで無視
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [forceUpdate, setForceUpdate] = useState<number>(0);

  // getSliceAxisをuseCallbackでメモ化
  const getSliceAxis = useCallback(() => {
    switch (sliceType) {
      case "sagittal":
        return 0;
      case "coronal":
        return 1;
      case "axial":
      default:
        return 2;
    }
  }, [sliceType]);

  // transformMniToAalCoordinatesをuseCallbackでラップ
  const transformMniToAalCoordinates = useCallback(
    (x: number, y: number, z: number) => {
      try {
        // AALデータが存在しない場合は変換しない
        if (!aalData || !aalData.dims) {
          return [x, y, z];
        }

        // MNIとAALのデータが同じ次元と解像度を持つと仮定して、直接座標を使用
        // 実際のプロジェクトでは、両方のデータが同じ空間に正規化されていることを確認する必要があります

        // AALデータの次元を取得
        const aalDimX = aalData.dims[1];
        const aalDimY = aalData.dims[2];
        const aalDimZ = aalData.dims[3];

        // MNIデータの次元を取得
        const mniDimX = dimensions[0];
        const mniDimY = dimensions[1];
        const mniDimZ = dimensions[2];

        // 次元の比率を計算
        const scaleX = aalDimX / mniDimX;
        const scaleY = aalDimY / mniDimY;
        const scaleZ = aalDimZ / mniDimZ;

        // スケーリングした座標を計算
        const aalX = Math.round(x * scaleX);
        const aalY = Math.round(y * scaleY);
        const aalZ = Math.round(z * scaleZ);

        // 座標が有効範囲内かチェック
        if (
          aalX >= 0 &&
          aalX < aalDimX &&
          aalY >= 0 &&
          aalY < aalDimY &&
          aalZ >= 0 &&
          aalZ < aalDimZ
        ) {
          return [aalX, aalY, aalZ];
        } else {
          console.log(
            `変換後の座標が範囲外です: [${aalX}, ${aalY}, ${aalZ}], AAL次元: [${aalDimX}, ${aalDimY}, ${aalDimZ}]`
          );
          return [-1, -1, -1]; // 範囲外を示す
        }
      } catch (err) {
        console.error("座標変換中にエラーが発生しました:", err);
        return [-1, -1, -1]; // エラー時は無効な座標を返す
      }
    },
    [aalData, dimensions]
  );

  // ホイールイベントを防止するためのグローバルイベントリスナー
  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      // コンポーネント内でホイールイベントが発生した場合、ページスクロールを防止
      if (containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();
        return false;
      }
    };

    // パッシブでないイベントリスナーを追加（preventDefault()を使用するため）
    document.addEventListener("wheel", preventScroll, { passive: false });

    // クリーンアップ関数
    return () => {
      document.removeEventListener("wheel", preventScroll);
    };
  }, []);

  // NIFTIデータの読み込み
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(0);
        setError(null);

        // MNIデータの読み込み
        setLoadingProgress(10);
        const mniData = await loadNiftiFile(mniUrl);
        setMniData(mniData);
        setLoadingProgress(40);

        // 次元情報の設定
        const dims: [number, number, number] = [
          mniData.dims[1],
          mniData.dims[2],
          mniData.dims[3],
        ];
        setDimensions(dims);

        // MNIボリュームデータの設定
        setMniVolume(mniData.typedImage);

        // 最大輝度値の計算
        let maxVal = 0;
        for (let i = 0; i < mniData.typedImage.length; i++) {
          if (mniData.typedImage[i] > maxVal) {
            maxVal = mniData.typedImage[i];
          }
        }
        setMaxIntensity(maxVal);

        // スライスインデックスの初期化
        if (sliceIndex !== undefined) {
          setCurrentSliceIndex(sliceIndex);
        } else {
          // デフォルトでは中央のスライスを表示
          const axis = getSliceAxis();
          setCurrentSliceIndex(Math.floor(dims[axis] / 2));
        }

        setLoadingProgress(70);

        // AALデータの読み込み
        if (aalUrl) {
          const aalData = await loadNiftiFile(aalUrl);
          setAalData(aalData);
          setAalVolume(aalData.typedImage);

          // MNIからAALへの変換行列を計算
          if (mniData.affine && aalData.affine) {
            // AAL -> MNI変換行列 = AAL^-1 * MNI
            const aalInv = invertMatrix(aalData.affine);
            const mniToAal = multiplyMatrices(aalInv, mniData.affine);
            setMniToAalTransform(mniToAal);
          }
        }

        setLoadingProgress(100);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading NIFTI data:", err);
        setError("NIFTIデータの読み込み中にエラーが発生しました。");
        setIsLoading(false);
      }
    };

    loadData();
  }, [mniUrl, aalUrl, sliceType, sliceIndex, getSliceAxis]);

  // スライスインデックスの更新
  useEffect(() => {
    if (sliceIndex !== undefined && dimensions[getSliceAxis()] > 0) {
      setCurrentSliceIndex(
        Math.min(Math.max(0, sliceIndex), dimensions[getSliceAxis()] - 1)
      );
    }
  }, [sliceIndex, dimensions, getSliceAxis]);

  // useEffectの依存関係を修正
  useEffect(() => {
    const axis = getSliceAxis();
    if (crosshairPosition) {
      setCurrentSliceIndex(crosshairPosition[axis]);
    }
  }, [crosshairPosition, getSliceAxis]);

  // drawCrosshairをuseCallbackでメモ化
  const drawCrosshair = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (!crosshairPosition) return;

      // クロスヘアの位置を計算
      let x = 0;
      let y = 0;

      switch (sliceType) {
        case "sagittal":
          x = width - crosshairPosition[1] - 1; // X座標を反転
          y = dimensions[2] - crosshairPosition[2];
          break;
        case "coronal":
          x = width - crosshairPosition[0] - 1; // X座標を反転
          y = dimensions[2] - crosshairPosition[2];
          break;
        case "axial":
          x = width - crosshairPosition[0] - 1; // X座標を反転
          y = dimensions[1] - crosshairPosition[1];
          break;
      }

      // クロスヘアを描画（赤色で明瞭に）
      ctx.strokeStyle = "rgba(255, 0, 0, 1.0)";
      ctx.lineWidth = 1;

      // 十字線を描画
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      // 中心点を描画
      ctx.fillStyle = "rgba(255, 0, 0, 1.0)";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    },
    [crosshairPosition, sliceType, dimensions]
  );

  // デバウンス関数の実装
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: unknown[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // スライスの最大インデックスを取得
  const getMaxSliceIndex = () => {
    if (!dimensions || dimensions.length < 3) return 0;

    switch (sliceType) {
      case "axial":
        return dimensions[2] - 1;
      case "coronal":
        return dimensions[1] - 1;
      case "sagittal":
        return dimensions[0] - 1;
      default:
        return 0;
    }
  };

  // drawCanvas関数を分離
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !mniVolume || dimensions[0] === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // キャンバスのサイズを設定
    let width, height;

    switch (sliceType) {
      case "sagittal": // X軸に垂直なスライス (YZ平面)
        width = dimensions[1];
        height = dimensions[2];
        break;
      case "coronal": // Y軸に垂直なスライス (XZ平面)
        width = dimensions[0];
        height = dimensions[2];
        break;
      case "axial": // Z軸に垂直なスライス (XY平面)
      default:
        width = dimensions[0];
        height = dimensions[1];
        break;
    }

    canvas.width = width;
    canvas.height = height;

    // イメージデータを作成
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // 最大輝度値に基づいてスケーリング係数を計算
    const scaleFactor = 255 / maxIntensity;

    // スライスデータを取得して描画
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // キャンバス座標からボクセル座標への変換
        let voxelX, voxelY, voxelZ;

        // Y座標を反転して正しい向きにする
        const invertedY = height - y - 1;
        // X座標も反転して左右を正しい向きにする
        const invertedX = width - x - 1;

        switch (sliceType) {
          case "sagittal": // X軸に垂直なスライス (YZ平面)
            voxelX = currentSliceIndex;
            voxelY = invertedX; // X座標を反転
            voxelZ = invertedY;
            break;
          case "coronal": // Y軸に垂直なスライス (XZ平面)
            voxelX = invertedX; // X座標を反転
            voxelY = currentSliceIndex;
            voxelZ = invertedY;
            break;
          case "axial": // Z軸に垂直なスライス (XY平面)
          default:
            voxelX = invertedX; // X座標を反転
            voxelY = invertedY;
            voxelZ = currentSliceIndex;
            break;
        }

        // ピクセルインデックスを計算
        const pixelIndex = (y * width + x) * 4;

        // ボクセル座標が有効範囲内かチェック
        if (
          voxelX >= 0 &&
          voxelX < dimensions[0] &&
          voxelY >= 0 &&
          voxelY < dimensions[1] &&
          voxelZ >= 0 &&
          voxelZ < dimensions[2]
        ) {
          // ボクセルインデックスを計算
          const voxelIndex =
            voxelX +
            voxelY * dimensions[0] +
            voxelZ * dimensions[0] * dimensions[1];

          // MNIデータの値を取得
          const mniValue = mniVolume[voxelIndex];

          // AALデータの値を取得（存在する場合）
          let aalValue = 0;
          if (aalVolume) {
            // MNIからAALへの座標変換
            const [aalX, aalY, aalZ] = transformMniToAalCoordinates(
              voxelX,
              voxelY,
              voxelZ
            );

            if (aalX >= 0 && aalY >= 0 && aalZ >= 0) {
              const aalIndex =
                aalX +
                aalY * aalData!.dims[1] +
                aalZ * aalData!.dims[1] * aalData!.dims[2];
              aalValue = aalVolume[aalIndex];
            }
          }

          // 選択された領域かどうかを確認
          const isSelectedRegion = selectedRegion === aalValue;
          // ホバーしている領域かどうかを確認
          const isHoveredRegion = hoveredRegion === aalValue;

          // 閾値以上の値のみ表示（背景を除去）
          if (mniValue > 10) {
            // コントラスト調整
            let adjustedValue = Math.min(
              255,
              Math.floor(mniValue * scaleFactor)
            );

            // MRI透明度の適用方法を修正
            // 透明度が高いほど実際に透明になるように変更
            const mriAlpha = 1 - mniOpacity / 100;

            // AAL領域の表示
            if (aalValue > 0) {
              // AALラベルに対応する色を取得
              const labelInfo = aalLabels.find((l) => l.index === aalValue);

              if (labelInfo) {
                // 色文字列をRGB値に変換
                let color;
                if (labelInfo.color.startsWith("#")) {
                  // HEX形式の場合
                  const hex = labelInfo.color.substring(1);
                  const r = parseInt(hex.substring(0, 2), 16);
                  const g = parseInt(hex.substring(2, 4), 16);
                  const b = parseInt(hex.substring(4, 6), 16);
                  color = { r, g, b, a: 1 }; // アルファ値を追加
                } else if (labelInfo.color.startsWith("rgba")) {
                  // RGBA形式の場合
                  const rgbaMatch = labelInfo.color.match(
                    /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
                  );
                  if (rgbaMatch) {
                    const r = parseInt(rgbaMatch[1], 10);
                    const g = parseInt(rgbaMatch[2], 10);
                    const b = parseInt(rgbaMatch[3], 10);
                    const a = parseFloat(rgbaMatch[4]);
                    color = { r, g, b, a };
                  } else {
                    // デフォルト色
                    color = { r: 50, g: 100, b: 200, a: 0.7 };
                  }
                } else if (labelInfo.color.startsWith("hsl")) {
                  // HSL形式の場合はRGBに変換
                  const hslMatch = labelInfo.color.match(
                    /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/
                  );
                  if (hslMatch) {
                    const h = parseInt(hslMatch[1], 10) / 360;
                    const s = parseInt(hslMatch[2], 10) / 100;
                    const l = parseInt(hslMatch[3], 10) / 100;

                    // HSL to RGB変換
                    const rgb = hslToRgb(h, s, l);
                    color = { r: rgb[0], g: rgb[1], b: rgb[2], a: 0.7 };
                  } else {
                    // デフォルト色
                    color = { r: 50, g: 100, b: 200, a: 0.7 };
                  }
                } else {
                  // デフォルト色
                  color = { r: 50, g: 100, b: 200, a: 0.7 };
                }

                if (showAAL) {
                  // 選択された領域は強調表示
                  if (isSelectedRegion) {
                    // 選択された領域は白色に近い最大明度で表示
                    data[pixelIndex] = Math.min(255, color.r + 150);
                    data[pixelIndex + 1] = Math.min(255, color.g + 150);
                    data[pixelIndex + 2] = Math.min(255, color.b + 150);
                    data[pixelIndex + 3] = 255; // 完全不透明
                  }
                  // ホバーしている領域も強調表示
                  else if (isHoveredRegion) {
                    // ホバーしている領域は元の色の最大明度バージョンで表示
                    data[pixelIndex] = Math.min(255, color.r + 150);
                    data[pixelIndex + 1] = Math.min(255, color.g + 150);
                    data[pixelIndex + 2] = Math.min(255, color.b + 150);
                    data[pixelIndex + 3] = 255; // 完全不透明
                  } else {
                    // 修正: AALラベルの透明度のみを変更し、MRI画像の透明度は別途適用
                    // AALラベルの透明度を計算
                    const aalAlpha = (1 - aalOpacity / 100) * color.a;

                    // 選択されていない領域は半透明でオーバーレイ
                    if (showAAL) {
                      // AALラベルが表示されている場合、MRI透明度はAALラベルに影響しないようにする
                      // AALラベルの色を適用
                      data[pixelIndex] = Math.floor(
                        adjustedValue * (1 - aalAlpha) + color.r * aalAlpha
                      );
                      data[pixelIndex + 1] = Math.floor(
                        adjustedValue * (1 - aalAlpha) + color.g * aalAlpha
                      );
                      data[pixelIndex + 2] = Math.floor(
                        adjustedValue * (1 - aalAlpha) + color.b * aalAlpha
                      );
                      // AALラベルがある部分は常に不透明に
                      data[pixelIndex + 3] = 255;
                    } else {
                      // AAL表示がオフの場合はグレースケールで表示し、MRI透明度を適用
                      data[pixelIndex] = adjustedValue;
                      data[pixelIndex + 1] = adjustedValue;
                      data[pixelIndex + 2] = adjustedValue;
                      data[pixelIndex + 3] = Math.round(255 * mriAlpha);
                    }
                  }
                } else {
                  // AAL表示がオフの場合はグレースケールで表示
                  // MRI透明度をアルファチャンネルに適用
                  data[pixelIndex] = adjustedValue;
                  data[pixelIndex + 1] = adjustedValue;
                  data[pixelIndex + 2] = adjustedValue;
                  data[pixelIndex + 3] = Math.round(255 * mriAlpha);
                }
              } else {
                // AALラベルが見つからない場合はグレースケールで表示
                // MRI透明度をアルファチャンネルに適用
                data[pixelIndex] = adjustedValue;
                data[pixelIndex + 1] = adjustedValue;
                data[pixelIndex + 2] = adjustedValue;
                data[pixelIndex + 3] = Math.round(255 * mriAlpha);
              }
            } else {
              // AAL領域外はグレースケールで表示
              // MRI透明度をアルファチャンネルに適用
              data[pixelIndex] = adjustedValue;
              data[pixelIndex + 1] = adjustedValue;
              data[pixelIndex + 2] = adjustedValue;
              data[pixelIndex + 3] = Math.round(255 * mriAlpha);
            }
          } else {
            // 背景（値が低い領域）は透明に
            data[pixelIndex] = 0;
            data[pixelIndex + 1] = 0;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 0;
          }
        } else {
          // 範囲外のインデックスは透明に
          data[pixelIndex] = 0;
          data[pixelIndex + 1] = 0;
          data[pixelIndex + 2] = 0;
          data[pixelIndex + 3] = 0;
        }
      }
    }

    // イメージデータの描画
    ctx.putImageData(imageData, 0, 0);

    // クロスヘアを描画
    if (crosshairPosition) {
      drawCrosshair(ctx, width, height);
    }

    // キャンバスをコンテナに合わせてスケーリング
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight - 3; // スライダー用のスペースを確保（5→3に変更）
      const scale = Math.min(containerWidth / width, containerHeight / height);

      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${height * scale}px`;
    }
  }, [
    dimensions,
    aalVolume,
    mniVolume,
    maxIntensity,
    currentSliceIndex,
    showAAL,
    aalOpacity,
    mniOpacity,
    selectedRegion,
    hoveredRegion,
    crosshairPosition,
    transformMniToAalCoordinates,
    getMaxSliceIndex,
  ]);

  // キャンバスのスケーリング処理を修正
  const updateCanvasScale = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // コンテナのサイズを取得
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight - 3; // スライダー用のスペースを確保

    // キャンバスのサイズを固定
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // キャンバスの実際のサイズを設定（ピクセル比を考慮）
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(containerWidth * scale);
    canvas.height = Math.floor(containerHeight * scale);

    // コンテキストのスケールを設定
    ctx.scale(scale, scale);

    // 画像を再描画
    drawCanvas();
  }, [drawCanvas]);

  // useEffectの依存関係を修正
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // キャンバスのリサイズ処理を追加
  useEffect(() => {
    const handleResize = debounce(() => {
      updateCanvasScale();
    }, 100); // 100msのデバウンス

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [updateCanvasScale]);

  // HSLからRGBへの変換関数
  const hslToRgb = (
    h: number,
    s: number,
    l: number
  ): [number, number, number] => {
    let r, g, b;

    if (s === 0) {
      r = g = b = l; // アクロマティック
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  };

  // handleCanvasClickの依存関係を修正
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || dimensions[0] === 0) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      // クリック位置をキャンバス座標に変換
      const canvasX = Math.floor(
        (e.clientX - rect.left) * (canvas.width / rect.width)
      );
      const canvasY = Math.floor(
        (e.clientY - rect.top) * (canvas.height / rect.height)
      );

      // Y座標を反転して正しい向きにする
      const invertedCanvasY = canvas.height - canvasY - 1;
      // X座標も反転して左右を正しい向きにする
      const invertedCanvasX = canvas.width - canvasX - 1;

      // キャンバス座標からボクセル座標への変換
      let voxelX, voxelY, voxelZ;

      switch (sliceType) {
        case "sagittal": // X軸に垂直なスライス (YZ平面)
          voxelX = currentSliceIndex;
          voxelY = invertedCanvasX; // X座標を反転
          voxelZ = invertedCanvasY;
          break;
        case "coronal": // Y軸に垂直なスライス (XZ平面)
          voxelX = invertedCanvasX; // X座標を反転
          voxelY = currentSliceIndex;
          voxelZ = invertedCanvasY;
          break;
        case "axial": // Z軸に垂直なスライス (XY平面)
        default:
          voxelX = invertedCanvasX; // X座標を反転
          voxelY = invertedCanvasY;
          voxelZ = currentSliceIndex;
          break;
      }

      // ボクセル座標が有効範囲内かチェック
      if (
        voxelX >= 0 &&
        voxelX < dimensions[0] &&
        voxelY >= 0 &&
        voxelY < dimensions[1] &&
        voxelZ >= 0 &&
        voxelZ < dimensions[2]
      ) {
        // AALデータの値を取得（存在する場合）
        let aalValue = 0;
        if (aalVolume) {
          // MNIからAALへの座標変換
          const [aalX, aalY, aalZ] = transformMniToAalCoordinates(
            voxelX,
            voxelY,
            voxelZ
          );

          if (aalX >= 0 && aalY >= 0 && aalZ >= 0) {
            const aalIndex =
              aalX +
              aalY * aalData!.dims[1] +
              aalZ * aalData!.dims[1] * aalData!.dims[2];
            aalValue = aalVolume[aalIndex];
          }
        }

        // 領域クリックイベントを発火（クリック位置の座標も一緒に渡す）
        if (onRegionClick && aalValue > 0) {
          onRegionClick(aalValue, [voxelX, voxelY, voxelZ]);
        }

        // クロスヘア位置を更新（クリックした位置に直接設定）
        if (onCrosshairPositionChange) {
          const newPosition: [number, number, number] = [
            voxelX,
            voxelY,
            voxelZ,
          ];
          onCrosshairPositionChange(newPosition);
          console.log(
            `${sliceType}断面でクリック: クロスヘア位置を更新 [${voxelX}, ${voxelY}, ${voxelZ}]`
          );
        }

        // カーソル位置を更新
        setCursorPosition([voxelX, voxelY, voxelZ]);
      }
    },
    [
      aalData,
      aalVolume,
      currentSliceIndex,
      dimensions,
      onCrosshairPositionChange,
      onRegionClick,
      sliceType,
      transformMniToAalCoordinates,
    ]
  );

  // 日本語名を取得する関数
  const getJapaneseNameWithPrefix = (englishName: string): string => {
    const details = japaneseLabelsData.find(
      (item) => item.englishLabel === englishName
    );
    if (!details) return englishName;

    let prefix = "";
    if (details.laterality === "left") {
      prefix = "左";
    } else if (details.laterality === "right") {
      prefix = "右";
    }

    return `${prefix}${details.japaneseLabel}`;
  };

  // マウス移動時のイベントハンドラ
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || dimensions[0] === 0) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // マウス位置をキャンバス座標に変換
    const canvasX = Math.floor(
      (e.clientX - rect.left) * (canvas.width / rect.width)
    );
    const canvasY = Math.floor(
      (e.clientY - rect.top) * (canvas.height / rect.height)
    );

    // ツールチップの位置を設定 - キャンバス内の相対位置を使用
    setTooltipPosition({
      x: e.clientX - rect.left + 20, // カーソルの右側に表示（固定オフセット）
      y: e.clientY - rect.top - 40, // カーソルの上に表示（固定オフセット）
    });

    // Y座標を反転して正しい向きにする
    const invertedCanvasY = canvas.height - canvasY - 1;
    // X座標も反転して左右を正しい向きにする
    const invertedCanvasX = canvas.width - canvasX - 1;

    // キャンバス座標からボクセル座標への変換
    let voxelX, voxelY, voxelZ;

    switch (sliceType) {
      case "sagittal": // X軸に垂直なスライス (YZ平面)
        voxelX = currentSliceIndex;
        voxelY = invertedCanvasX; // X座標を反転
        voxelZ = invertedCanvasY;
        break;
      case "coronal": // Y軸に垂直なスライス (XZ平面)
        voxelX = invertedCanvasX; // X座標を反転
        voxelY = currentSliceIndex;
        voxelZ = invertedCanvasY;
        break;
      case "axial": // Z軸に垂直なスライス (XY平面)
      default:
        voxelX = invertedCanvasX; // X座標を反転
        voxelY = invertedCanvasY;
        voxelZ = currentSliceIndex;
        break;
    }

    // ボクセル座標が有効範囲内かチェック
    if (
      voxelX >= 0 &&
      voxelX < dimensions[0] &&
      voxelY >= 0 &&
      voxelY < dimensions[1] &&
      voxelZ >= 0 &&
      voxelZ < dimensions[2]
    ) {
      // MNI座標を計算（実際のMNI座標系に変換）
      // MNI座標系は原点が中心にあり、ボクセル座標とは異なる
      // MNIテンプレートの中心座標を使用して変換
      const mniX = Math.round((voxelX - 91) * 2.0); // 2mm解像度
      const mniY = Math.round((voxelY - 109) * 2.0); // 2mm解像度
      const mniZ = Math.round((voxelZ - 91) * 2.0); // 2mm解像度

      // AALデータの値を取得（存在する場合）
      let aalValue = 0;
      if (aalVolume) {
        // MNIからAALへの座標変換
        const [aalX, aalY, aalZ] = transformMniToAalCoordinates(
          voxelX,
          voxelY,
          voxelZ
        );

        if (aalX >= 0 && aalY >= 0 && aalZ >= 0) {
          const aalIndex =
            aalX +
            aalY * aalData!.dims[1] +
            aalZ * aalData!.dims[1] * aalData!.dims[2];
          aalValue = aalVolume[aalIndex];
        }
      }

      // ホバー領域を更新
      if (aalValue > 0) {
        const region = aalLabels.find((l) => l.index === aalValue);
        if (region) {
          setTooltipContent(getJapaneseNameWithPrefix(region.name));
        } else {
          setTooltipContent(`領域: ${aalValue}`);
        }
      } else {
        setTooltipContent("");
      }

      if (onRegionHover) {
        // 現在のカーソル位置の座標情報を送る
        onRegionHover(aalValue > 0 ? aalValue : null, {
          voxel: [voxelX, voxelY, voxelZ],
          mni: [mniX, mniY, mniZ],
          sliceType: sliceType,
        });
      }

      // カーソル位置を更新
      setCursorPosition([voxelX, voxelY, voxelZ]);
    }
  };

  // マウス離脱時のイベントハンドラ
  const handleMouseLeave = () => {
    setCursorPosition(null);
    setTooltipPosition(null);
    setTooltipContent("");
    // 座標情報をクリアしないように変更
    // if (onRegionHover) {
    //   onRegionHover(null, {
    //     voxel: [-1, -1, -1],
    //     mni: [-1, -1, -1],
    //     sliceType: sliceType
    //   });
    //   setHoveredRegion(null);
    // }
  };

  // マウスホイールイベントハンドラ - スライスを移動するために使用
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!currentSliceIndex) return;

      const delta = e.deltaY > 0 ? 1 : -1;
      const maxIndex = getMaxSliceIndex();
      const newIndex = Math.min(
        Math.max(0, currentSliceIndex + delta),
        maxIndex
      );
      setCurrentSliceIndex(newIndex);

      // クロスヘア位置も更新する（選択された領域がある場合でも）
      if (onCrosshairPositionChange && crosshairPosition) {
        const newPosition: [number, number, number] = [
          crosshairPosition[0],
          crosshairPosition[1],
          crosshairPosition[2],
        ];
        newPosition[getSliceAxis()] = newIndex;
        onCrosshairPositionChange(newPosition);
      }
    },
    [
      currentSliceIndex,
      getSliceAxis,
      onCrosshairPositionChange,
      crosshairPosition,
    ]
  );

  // 行列の逆行列を計算する関数
  const invertMatrix = (m: number[][]): number[][] => {
    // 4x4行列のみサポート
    if (!m || m.length !== 4 || !m[0] || m[0].length !== 4) {
      console.warn("invertMatrix: 4x4行列のみサポートしています");
      return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
    }

    try {
      // 回転部分（3x3）と平行移動部分を分離
      const r = [
        [m[0][0], m[0][1], m[0][2]],
        [m[1][0], m[1][1], m[1][2]],
        [m[2][0], m[2][1], m[2][2]],
      ];
      const t = [m[0][3], m[1][3], m[2][3]];

      // 3x3部分の行列式を計算
      const det =
        r[0][0] * (r[1][1] * r[2][2] - r[1][2] * r[2][1]) -
        r[0][1] * (r[1][0] * r[2][2] - r[1][2] * r[2][0]) +
        r[0][2] * (r[1][0] * r[2][1] - r[1][1] * r[2][0]);

      if (Math.abs(det) < 1e-10) {
        console.warn(
          "invertMatrix: 行列式がゼロに近いため逆行列を計算できません"
        );
        return [
          [1, 0, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 1],
        ];
      }

      // 余因子行列を計算
      const adjR = [
        [
          r[1][1] * r[2][2] - r[1][2] * r[2][1],
          r[0][2] * r[2][1] - r[0][1] * r[2][2],
          r[0][1] * r[1][2] - r[0][2] * r[1][1],
        ],
        [
          r[1][2] * r[2][0] - r[1][0] * r[2][2],
          r[0][0] * r[2][2] - r[0][2] * r[2][0],
          r[0][2] * r[1][0] - r[0][0] * r[1][2],
        ],
        [
          r[1][0] * r[2][1] - r[1][1] * r[2][0],
          r[0][1] * r[2][0] - r[0][0] * r[2][1],
          r[0][0] * r[1][1] - r[0][1] * r[1][0],
        ],
      ];

      // 回転部分の逆行列を計算
      const invR = adjR.map((row) => row.map((val) => val / det));

      // 平行移動部分の逆変換を計算
      const invT = [
        -(invR[0][0] * t[0] + invR[0][1] * t[1] + invR[0][2] * t[2]),
        -(invR[1][0] * t[0] + invR[1][1] * t[1] + invR[1][2] * t[2]),
        -(invR[2][0] * t[0] + invR[2][1] * t[1] + invR[2][2] * t[2]),
      ];

      // 4x4逆行列を構築
      return [
        [invR[0][0], invR[0][1], invR[0][2], invT[0]],
        [invR[1][0], invR[1][1], invR[1][2], invT[1]],
        [invR[2][0], invR[2][1], invR[2][2], invT[2]],
        [0, 0, 0, 1],
      ];
    } catch (error) {
      console.error("invertMatrix: エラーが発生しました", error);
      return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
    }
  };

  // 行列の乗算を行う関数
  const multiplyMatrices = (a: number[][], b: number[][]) => {
    // 入力チェック
    if (
      !a ||
      !b ||
      !Array.isArray(a) ||
      !Array.isArray(b) ||
      a.length < 3 ||
      b.length < 3
    ) {
      console.error("無効な行列形式:", { a, b });
      return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
    }

    const result = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 1],
    ];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          !a[i] ||
          !b[0] ||
          !b[1] ||
          !b[2] ||
          a[i].length < 4 ||
          b[0].length < 4 ||
          b[1].length < 4 ||
          b[2].length < 4
        ) {
          console.error("行列の次元が不正です");
          return [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ];
        }

        result[i][j] =
          a[i][0] * b[0][j] +
          a[i][1] * b[1][j] +
          a[i][2] * b[2][j] +
          (j === 3 ? a[i][3] : 0);
      }
    }

    return result;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-3/4 flex flex-col justify-between"
      onWheel={(e) => {
        // ルート要素でもホイールイベントを捕捉してページスクロールを防止
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className="flex-1 flex flex-col justify-center items-center bg-gray-100 overflow-hidden p-0"
        onWheel={(e) => {
          // コンテナでもホイールイベントを捕捉してページスクロールを防止
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-24 bg-gray-200 rounded-lg">
            <div className="w-full max-w-md bg-gray-200 rounded-full h-1.5 mb-1">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mb-0.5"></div>
            <p className="text-xs">読み込み中... {loadingProgress}%</p>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div
            className="relative p-0"
            onWheel={(e) => {
              // 親divでもホイールイベントを捕捉してページスクロールを防止
              e.preventDefault();
              e.stopPropagation();
              // キャンバスのホイールハンドラを呼び出す
              const delta = e.deltaY > 0 ? 1 : -1;
              const newIndex = Math.max(
                0,
                Math.min(getMaxSliceIndex(), currentSliceIndex + delta)
              );
              setCurrentSliceIndex(newIndex);

              // クロスヘア位置も更新する（選択された領域がある場合でも）
              if (onCrosshairPositionChange && crosshairPosition) {
                let newPosition: [number, number, number] = [
                  ...crosshairPosition,
                ];

                // スライスタイプに応じて、適切な座標を更新
                switch (sliceType) {
                  case "sagittal": // X軸に垂直なスライス (YZ平面)
                    newPosition[0] = newIndex;
                    break;
                  case "coronal": // Y軸に垂直なスライス (XZ平面)
                    newPosition[1] = newIndex;
                    break;
                  case "axial": // Z軸に垂直なスライス (XY平面)
                  default:
                    newPosition[2] = newIndex;
                    break;
                }

                // クロスヘア位置を更新
                onCrosshairPositionChange(newPosition);
              }
            }}
          >
            <canvas
              ref={canvasRef}
              className="cursor-crosshair"
              onWheel={handleWheel}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
            {tooltipPosition && tooltipContent && (
              <div
                className="absolute z-10 bg-white px-2 py-1 rounded shadow-md text-sm font-medium text-gray-800 border border-gray-200 whitespace-nowrap"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`,
                  pointerEvents: "none",
                  maxWidth: "none",
                }}
              >
                {tooltipContent}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-1 mb-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[10px] font-medium text-gray-700">
            {sliceType === "axial"
              ? "軸位断"
              : sliceType === "coronal"
                ? "冠状断"
                : "矢状断"}
          </span>
          <span className="text-[10px] font-medium text-blue-600">
            {currentSliceIndex} / {getMaxSliceIndex()}
          </span>
        </div>

        <div className="p-1 border border-blue-200 rounded bg-blue-50">
          <input
            type="range"
            min="0"
            max={getMaxSliceIndex()}
            value={currentSliceIndex}
            onChange={(e) => {
              const newIndex = parseInt(e.target.value);
              setCurrentSliceIndex(newIndex);

              // クロスヘア位置も更新する（選択された領域がある場合でも）
              if (onCrosshairPositionChange && crosshairPosition) {
                let newPosition: [number, number, number] = [
                  ...crosshairPosition,
                ];

                // スライスタイプに応じて、適切な座標を更新
                switch (sliceType) {
                  case "sagittal": // X軸に垂直なスライス (YZ平面)
                    newPosition[0] = newIndex;
                    break;
                  case "coronal": // Y軸に垂直なスライス (XZ平面)
                    newPosition[1] = newIndex;
                    break;
                  case "axial": // Z軸に垂直なスライス (XY平面)
                  default:
                    newPosition[2] = newIndex;
                    break;
                }

                // クロスヘア位置を更新
                onCrosshairPositionChange(newPosition);
              }
            }}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[8px] text-gray-500 mt-0.5">
            <span>0</span>
            <span>{getMaxSliceIndex()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
