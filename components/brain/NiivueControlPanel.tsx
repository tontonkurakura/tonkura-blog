"use client";

import { useState, useEffect } from "react";
import { Niivue } from "@niivue/niivue";

interface NiivueControlPanelProps {
  niivue: Niivue | null;
  onViewModeChange?: (mode: number) => void; // 表示モード変更時のコールバック
  onToggleCrosshair?: () => void; // クロスヘア表示/非表示切り替え時のコールバック
  isCrosshairVisible?: boolean; // クロスヘアの表示状態
}

/**
 * Niivueコントロールパネルコンポーネント
 *
 * Niivueの表示設定を制御するためのUIコンポーネント
 */
export default function NiivueControlPanel({
  niivue,
  onViewModeChange,
  onToggleCrosshair,
  isCrosshairVisible = true,
}: NiivueControlPanelProps) {
  const [opacity, setOpacity] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (niivue) {
      setIsLoading(false);
    }
  }, [niivue]);

  // 不透明度の変更
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newOpacity = parseInt(e.target.value);
    setOpacity(newOpacity);

    if (niivue && niivue.volumes.length > 0) {
      niivue.volumes[0].opacity = newOpacity / 100;
      niivue.updateGLVolume();
    }
  };

  // 表示モードの変更
  const handleViewModeChange = (mode: string) => {
    if (!niivue) return;

    let sliceType: number;

    switch (mode) {
      case "axial":
        sliceType = 2; // 軸位断
        break;
      case "coronal":
        sliceType = 1; // 冠状断
        break;
      case "sagittal":
        sliceType = 0; // 矢状断
        break;
      case "multiplanar":
        sliceType = 3; // マルチプラナー
        break;
      case "render":
        sliceType = 4; // ボリュームレンダリング
        break;
      default:
        sliceType = 3; // デフォルトはマルチプラナー
        break;
    }

    // Niivueの表示モードを変更
    niivue.setSliceType(sliceType);

    // 親コンポーネントに通知
    if (onViewModeChange) {
      onViewModeChange(sliceType);
    }
  };

  // クロスヘアの表示/非表示を切り替える
  const handleToggleCrosshair = () => {
    if (onToggleCrosshair) {
      onToggleCrosshair();
    }
  };

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">表示設定</h3>

      <div className="mb-4">
        {/* 不透明度スライダー */}
        <div>
          <label
            htmlFor="opacity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            不透明度: {opacity}%
          </label>
          <input
            id="opacity"
            type="range"
            min="0"
            max="100"
            value={opacity}
            onChange={handleOpacityChange}
            className="w-full"
          />
        </div>
      </div>

      {/* クロスヘア表示/非表示切り替えボタン */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={handleToggleCrosshair}
          className={`px-3 py-1 ${
            isCrosshairVisible
              ? "bg-blue-600 text-white"
              : "bg-gray-300 text-gray-700"
          } rounded hover:bg-blue-700 hover:text-white text-sm flex items-center`}
          title="クロスヘアの表示/非表示を切り替えます"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          クロスヘア {isCrosshairVisible ? "非表示" : "表示"}
        </button>
      </div>

      {/* 表示モード切り替えボタン */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          表示モード
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleViewModeChange("axial")}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            軸位断
          </button>
          <button
            onClick={() => handleViewModeChange("coronal")}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            冠状断
          </button>
          <button
            onClick={() => handleViewModeChange("sagittal")}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            矢状断
          </button>
          <button
            onClick={() => handleViewModeChange("multiplanar")}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            マルチプラナー
          </button>
          <button
            onClick={() => handleViewModeChange("render")}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            3Dレンダリング
          </button>
        </div>
      </div>
    </div>
  );
}
