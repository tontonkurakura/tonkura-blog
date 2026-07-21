"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";

interface SliceEntry {
  index: number;
  world_coord: number;
  file: string;
  center_world: [number, number, number];
  image_shape: [number, number];
}

interface SliceAxis {
  axis: string;
  slices: SliceEntry[];
}

interface SliceMetadata {
  version: number;
  shape: [number, number, number];
  affine: number[][];
  voxel_size: number;
  axes: {
    axial: SliceAxis;
    coronal: SliceAxis;
    sagittal: SliceAxis;
  };
}

export interface BrainSliceViewerProps {
  mniCoords: [number, number, number] | null;
  onCoordsChange?: (coords: [number, number, number]) => void;
  onSliceFilesChange?: (files: {
    axialFile: string;
    coronalFile: string;
    sagittalFile: string;
  }) => void;
  layout?: "horizontal" | "vertical";
}

const SLICE_BASE = "/data/3d-brain/slices";
const METADATA_PATH = "/data/3d-brain/slice_metadata.json";

const SLICE_STYLES = {
  axial: {
    border: "border-l-cyan-500",
    text: "text-cyan-400",
    accent: "#22d3ee",
  },
  coronal: {
    border: "border-l-green-500",
    text: "text-green-400",
    accent: "#4ade80",
  },
  sagittal: {
    border: "border-l-orange-500",
    text: "text-orange-400",
    accent: "#fb923c",
  },
} as const;

function findNearestEntry(
  slices: SliceEntry[],
  worldCoord: number
): { entry: SliceEntry; index: number } {
  let bestIdx = 0;
  let minDist = Infinity;
  for (let i = 0; i < slices.length; i++) {
    const d = Math.abs(slices[i].world_coord - worldCoord);
    if (d < minDist) {
      minDist = d;
      bestIdx = i;
    }
  }
  return { entry: slices[bestIdx], index: bestIdx };
}

// ────────────────────────────────────────────────
// 個別スライスパネル
// ────────────────────────────────────────────────
function SlicePanel({
  title,
  slices,
  worldCoord,
  sliceType,
  basePath,
  onChange,
  layout,
}: {
  title: string;
  slices: SliceEntry[];
  worldCoord: number;
  sliceType: "axial" | "coronal" | "sagittal";
  basePath: string;
  onChange: (coord: number) => void;
  layout: "horizontal" | "vertical";
}) {
  const { entry: nearest, index: currentIndex } = useMemo(
    () => findNearestEntry(slices, worldCoord),
    [slices, worldCoord]
  );
  const style = SLICE_STYLES[sliceType];

  const containerRef = useRef<HTMLDivElement>(null);

  // スクロールでスライス送り（非パッシブ）
  const handleWheelRef = useRef<(e: WheelEvent) => void>(() => {});
  useEffect(() => {
    handleWheelRef.current = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 1 : -1;
      const newIdx = Math.max(
        0,
        Math.min(slices.length - 1, currentIndex + delta)
      );
      onChange(slices[newIdx].world_coord);
    };
  }, [slices, currentIndex, onChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => handleWheelRef.current(e);
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  const imgSrc = `${basePath}/${sliceType}/${nearest.file}`;
  const min = slices[0].world_coord;
  const max = slices[slices.length - 1].world_coord;

  if (layout === "vertical") {
    return (
      <div
        ref={containerRef}
        className={`flex flex-col min-h-0 flex-1 border-l-2 ${style.border} pl-2`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between flex-shrink-0 mb-0.5">
          <span className={`text-[11px] font-semibold ${style.text}`}>
            {title}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            {nearest.world_coord.toFixed(1)} mm
          </span>
        </div>
        {/* 画像（flex-1で残り高さを占有） */}
        <div
          className="flex-1 min-h-0 relative bg-black overflow-hidden rounded cursor-ns-resize"
          title="スクロールでスライス送り"
        >
          <img
            src={imgSrc}
            alt={`${title} ${nearest.world_coord.toFixed(1)}mm`}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ imageRendering: "pixelated" }}
            draggable={false}
          />
          <span className="absolute bottom-0.5 right-1 text-[9px] text-white/25 pointer-events-none select-none">
            ↕ scroll
          </span>
        </div>
        {/* スライダー */}
        <input
          type="range"
          min={min}
          max={max}
          step={0.74}
          value={worldCoord}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-1 mt-0.5 flex-shrink-0 cursor-pointer"
          style={{ accentColor: style.accent }}
        />
      </div>
    );
  }

  // horizontal layout
  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className={`text-xs font-semibold ${style.text}`}>{title}</span>
        <span className="text-xs text-gray-400">
          {nearest.world_coord.toFixed(1)} mm
        </span>
      </div>
      <div
        className="relative bg-black rounded overflow-hidden cursor-ns-resize"
        style={{ aspectRatio: "4/3" }}
        title="スクロールでスライス送り"
      >
        <img
          src={imgSrc}
          alt={`${title} ${nearest.world_coord.toFixed(1)}mm`}
          className="w-full h-full object-contain"
          style={{ imageRendering: "pixelated" }}
          draggable={false}
        />
        <span className="absolute bottom-1 right-1 text-[9px] text-white/30 pointer-events-none">
          ↕ scroll
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.74}
        value={worldCoord}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 cursor-pointer"
        style={{ accentColor: style.accent }}
      />
    </div>
  );
}

// ────────────────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────────────────
export default function BrainSliceViewer({
  mniCoords,
  onCoordsChange,
  onSliceFilesChange,
  layout = "horizontal",
}: BrainSliceViewerProps) {
  const [metadata, setMetadata] = useState<SliceMetadata | null>(null);
  const [axialZ, setAxialZ] = useState(0);
  const [coronalY, setCoronalY] = useState(0);
  const [sagittalX, setSagittalX] = useState(0);

  useEffect(() => {
    fetch(METADATA_PATH)
      .then((r) => r.json())
      .then((data: SliceMetadata) => {
        setMetadata(data);
        const ax = data.axes.axial.slices;
        const co = data.axes.coronal.slices;
        const sa = data.axes.sagittal.slices;
        setAxialZ(ax[Math.floor(ax.length / 2)].world_coord);
        setCoronalY(co[Math.floor(co.length / 2)].world_coord);
        setSagittalX(sa[Math.floor(sa.length / 2)].world_coord);
      })
      .catch(console.error);
  }, []);

  // 外部座標 → スライス移動
  useEffect(() => {
    if (!mniCoords || !metadata) return;
    setSagittalX(mniCoords[0]);
    setCoronalY(mniCoords[1]);
    setAxialZ(mniCoords[2]);
  }, [mniCoords, metadata]);

  // 現在のスライスファイル名を親に通知
  useEffect(() => {
    if (!metadata || !onSliceFilesChange) return;
    const axialFile = findNearestEntry(metadata.axes.axial.slices, axialZ).entry
      .file;
    const coronalFile = findNearestEntry(metadata.axes.coronal.slices, coronalY)
      .entry.file;
    const sagittalFile = findNearestEntry(
      metadata.axes.sagittal.slices,
      sagittalX
    ).entry.file;
    onSliceFilesChange({ axialFile, coronalFile, sagittalFile });
  }, [metadata, axialZ, coronalY, sagittalX, onSliceFilesChange]);

  const handleAxialChange = useCallback(
    (z: number) => {
      setAxialZ(z);
      onCoordsChange?.([sagittalX, coronalY, z]);
    },
    [sagittalX, coronalY, onCoordsChange]
  );
  const handleCoronalChange = useCallback(
    (y: number) => {
      setCoronalY(y);
      onCoordsChange?.([sagittalX, y, axialZ]);
    },
    [sagittalX, axialZ, onCoordsChange]
  );
  const handleSagittalChange = useCallback(
    (x: number) => {
      setSagittalX(x);
      onCoordsChange?.([x, coronalY, axialZ]);
    },
    [coronalY, axialZ, onCoordsChange]
  );

  if (!metadata) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        <div className="animate-spin w-4 h-4 border border-gray-500 border-t-transparent rounded-full mr-2" />
        読み込み中...
      </div>
    );
  }

  const panels = (
    <>
      <SlicePanel
        title="軸位断 (Axial)"
        slices={metadata.axes.axial.slices}
        worldCoord={axialZ}
        sliceType="axial"
        basePath={SLICE_BASE}
        onChange={handleAxialChange}
        layout={layout}
      />
      <SlicePanel
        title="冠状断 (Coronal)"
        slices={metadata.axes.coronal.slices}
        worldCoord={coronalY}
        sliceType="coronal"
        basePath={SLICE_BASE}
        onChange={handleCoronalChange}
        layout={layout}
      />
      <SlicePanel
        title="矢状断 (Sagittal)"
        slices={metadata.axes.sagittal.slices}
        worldCoord={sagittalX}
        sliceType="sagittal"
        basePath={SLICE_BASE}
        onChange={handleSagittalChange}
        layout={layout}
      />
    </>
  );

  if (layout === "vertical") {
    return (
      <div className="flex flex-col h-full gap-2 min-h-0">
        <div className="text-[10px] text-gray-500 font-mono flex-shrink-0">
          MNI ({sagittalX.toFixed(1)}, {coronalY.toFixed(1)},{" "}
          {axialZ.toFixed(1)}) mm
        </div>
        {panels}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">
          MRIスライスビュー
        </h3>
        <span className="text-xs text-gray-400 font-mono">
          MNI: ({sagittalX.toFixed(1)}, {coronalY.toFixed(1)},{" "}
          {axialZ.toFixed(1)}) mm
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">{panels}</div>
    </div>
  );
}
