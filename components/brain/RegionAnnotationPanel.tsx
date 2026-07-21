"use client";

import { useMemo } from "react";

interface RegionLabel {
  ja: string;
  en: string;
  centroid_lh?: [number, number, number];
  centroid_rh?: [number, number, number];
}

interface RegionAnnotation {
  function: string;
  clinical: string;
  network: string;
  connections?: string[];
}

interface RegionAnnotationPanelProps {
  regionKey: string | null;
  labelsData: Record<string, RegionLabel>;
  annotations: Record<string, RegionAnnotation>;
  hemisphere?: "both" | "left" | "right";
  onRegionClick?: (region: string) => void;
}

function MNICoordBadge({
  coords,
  label,
}: {
  coords: [number, number, number];
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-400 w-6 flex-shrink-0">{label}</span>
      <code className="bg-gray-800 px-2 py-0.5 rounded font-mono text-gray-300">
        ({coords[0].toFixed(1)}, {coords[1].toFixed(1)}, {coords[2].toFixed(1)})
        mm
      </code>
    </div>
  );
}

export default function RegionAnnotationPanel({
  regionKey,
  labelsData,
  annotations,
  onRegionClick,
}: RegionAnnotationPanelProps) {
  const label = regionKey ? labelsData[regionKey] : null;
  const annotation = regionKey ? annotations[regionKey] : null;

  const connectedRegions = useMemo(() => {
    if (!annotation?.connections) return [];
    return annotation.connections
      .map((key) => ({ key, label: labelsData[key] }))
      .filter((r) => r.label);
  }, [annotation, labelsData]);

  if (!regionKey || !label) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
        <div className="mb-3 opacity-30">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm font-medium">領域を選択してください</p>
        <p className="text-xs mt-1 text-gray-500">
          3Dモデルの脳領域をクリックすると
          <br />
          詳細情報が表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {/* ヘッダー：領域名 */}
      <div className="border-b border-gray-700 pb-3">
        <h2 className="text-xl font-bold text-white leading-tight">
          {label.ja}
        </h2>
        <p className="text-sm text-gray-400 mt-0.5 italic">{label.en}</p>
        <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-indigo-900/60 text-indigo-300 rounded-full border border-indigo-700/50">
          {regionKey}
        </span>
      </div>

      {/* MNI座標 */}
      {(label.centroid_lh || label.centroid_rh) && (
        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            MNI重心座標
          </h3>
          <div className="space-y-1">
            {label.centroid_lh && (
              <MNICoordBadge coords={label.centroid_lh} label="L" />
            )}
            {label.centroid_rh && (
              <MNICoordBadge coords={label.centroid_rh} label="R" />
            )}
          </div>
        </div>
      )}

      {annotation ? (
        <>
          {/* ネットワーク */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              ネットワーク
            </h3>
            <span className="inline-block text-xs px-2 py-1 bg-teal-900/50 text-teal-300 rounded border border-teal-700/50">
              {annotation.network}
            </span>
          </div>

          {/* 機能 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              機能
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {annotation.function}
            </p>
          </div>

          {/* 臨床的意義 */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
              臨床的意義
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed bg-gray-800/50 rounded p-2.5 border-l-2 border-orange-500/50">
              {annotation.clinical}
            </p>
          </div>

          {/* 連絡領域 */}
          {connectedRegions.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                主な連絡領域
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {connectedRegions.map(({ key, label: connLabel }) => (
                  <button
                    key={key}
                    onClick={() => onRegionClick?.(key)}
                    className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors border border-gray-600 hover:border-gray-500"
                    title={connLabel.en}
                  >
                    {connLabel.ja}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-500 italic">
          この領域のアノテーションは準備中です。
        </div>
      )}
    </div>
  );
}
