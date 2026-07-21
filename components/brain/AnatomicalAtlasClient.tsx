"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import RegionAnnotationPanel from "./RegionAnnotationPanel";
import BrainSliceViewer from "./BrainSliceViewer";

const BrainGLBViewer = dynamic(() => import("./BrainGLBViewer"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-gray-900 rounded-lg text-gray-400"
      style={{ aspectRatio: "4/3" }}
    >
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">3Dモデルを読み込んでいます...</p>
      </div>
    </div>
  ),
});

// ────────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────────
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

type ViewMode = "macro" | "detailed" | "slice";
type SliceAxis = "axial" | "coronal" | "sagittal";

// ────────────────────────────────────────────────
// 領域ツリー定義
// ────────────────────────────────────────────────
interface TreeCategory {
  label: string;
  regions?: string[];
  children?: Record<string, TreeCategory>;
}

const DETAILED_TREE: Record<string, TreeCategory> = {
  cortical: {
    label: "大脳皮質",
    children: {
      frontal: {
        label: "前頭葉",
        regions: [
          "precentral",
          "paracentral",
          "superiorfrontal",
          "caudalmiddlefrontal",
          "rostralmiddlefrontal",
          "parsopercularis",
          "parstriangularis",
          "parsorbitalis",
          "lateralorbitofrontal",
          "medialorbitofrontal",
          "frontalpole",
        ],
      },
      parietal: {
        label: "頭頂葉",
        regions: [
          "postcentral",
          "superiorparietal",
          "inferiorparietal",
          "supramarginal",
          "precuneus",
        ],
      },
      temporal: {
        label: "側頭葉",
        regions: [
          "transversetemporal",
          "superiortemporal",
          "bankssts",
          "middletemporal",
          "inferiortemporal",
          "fusiform",
          "parahippocampal",
          "entorhinal",
          "temporalpole",
        ],
      },
      occipital: {
        label: "後頭葉",
        regions: ["pericalcarine", "cuneus", "lingual", "lateraloccipital"],
      },
      cingulate: {
        label: "帯状皮質",
        regions: [
          "caudalanteriorcingulate",
          "rostralanteriorcingulate",
          "posteriorcingulate",
          "isthmuscingulate",
        ],
      },
      insula: { label: "島皮質", regions: ["insula"] },
    },
  },
  subcortical: {
    label: "皮質下構造",
    children: {
      basalganglia: {
        label: "大脳基底核",
        regions: ["Caudate", "Putamen", "Pallidum"],
      },
      limbic: { label: "辺縁系", regions: ["Hippocampus", "Amygdala"] },
      thalamus: { label: "視床", regions: ["Thalamus-Proper"] },
      brainstem: { label: "脳幹", regions: ["Brain-Stem"] },
      cerebellum: {
        label: "小脳",
        regions: ["Cerebellum-Cortex", "Cerebellum-White-Matter"],
      },
    },
  },
};

const MACRO_TREE: Record<string, TreeCategory> = {
  cortex: {
    label: "大脳皮質",
    regions: [
      "Frontal_Lobe",
      "Parietal_Lobe",
      "Temporal_Lobe",
      "Occipital_Lobe",
    ],
  },
  subcortical: {
    label: "皮質下・脳幹・小脳",
    regions: [
      "Limbic_System",
      "Basal_Ganglia",
      "Thalamus",
      "Brain_Stem",
      "Cerebellum",
    ],
  },
};

const MACRO_CORTEX_REGIONS = new Set([
  "Frontal_Lobe",
  "Parietal_Lobe",
  "Temporal_Lobe",
  "Occipital_Lobe",
]);

// ────────────────────────────────────────────────
// ツリーノード
// ────────────────────────────────────────────────
function collectRegions(node: TreeCategory): string[] {
  const r: string[] = node.regions ? [...node.regions] : [];
  if (node.children)
    for (const c of Object.values(node.children)) r.push(...collectRegions(c));
  return r;
}

function TreeNode({
  label,
  node,
  labelsData,
  selectedRegion,
  onSelect,
  depth,
}: {
  label: string;
  node: TreeCategory;
  labelsData: Record<string, RegionLabel>;
  selectedRegion: string | null;
  onSelect: (k: string | null) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(depth < 1);
  useEffect(() => {
    if (selectedRegion && collectRegions(node).includes(selectedRegion))
      setOpen(true);
  }, [selectedRegion, node]);

  const pl = depth * 10 + 6;

  return (
    <div>
      {(node.children || depth > 0) && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 w-full text-left py-0.5 rounded hover:bg-gray-800/80 transition-colors"
          style={{ paddingLeft: `${pl}px` }}
        >
          <span
            className={`text-[10px] text-gray-500 transition-transform ${open ? "rotate-90" : ""}`}
          >
            ▶
          </span>
          <span
            className={`text-xs font-semibold ${depth === 0 ? "text-gray-200" : "text-gray-400"}`}
          >
            {label}
          </span>
        </button>
      )}
      {depth === 0 && !node.children && node.regions && (
        <div
          className="text-xs font-semibold text-gray-300 py-0.5"
          style={{ paddingLeft: `${pl}px` }}
        >
          {label}
        </div>
      )}

      {open && (
        <div>
          {node.children &&
            Object.entries(node.children).map(([k, c]) => (
              <TreeNode
                key={k}
                label={c.label}
                node={c}
                labelsData={labelsData}
                selectedRegion={selectedRegion}
                onSelect={onSelect}
                depth={depth + 1}
              />
            ))}
          {node.regions?.map((rk) => {
            const rl = labelsData[rk];
            if (!rl) return null;
            const isSel = rk === selectedRegion;
            return (
              <button
                key={rk}
                onClick={() => onSelect(isSel ? null : rk)}
                className={`flex items-center gap-1.5 w-full text-left py-0.5 rounded text-xs transition-colors ${isSel ? "bg-indigo-700/70 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"}`}
                style={{ paddingLeft: `${pl + 14}px` }}
                title={rl.en}
              >
                {isSel && (
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                )}
                <span className="truncate">{rl.ja}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// スライス軸ラジオボタン
// ────────────────────────────────────────────────
const AXIS_OPTIONS: {
  value: SliceAxis;
  label: string;
  color: string;
  activeClass: string;
}[] = [
  {
    value: "axial",
    label: "軸位断 (Axial)",
    color: "cyan",
    activeClass: "bg-cyan-900/50 text-cyan-300 border-cyan-600",
  },
  {
    value: "coronal",
    label: "冠状断 (Coronal)",
    color: "green",
    activeClass: "bg-green-900/50 text-green-300 border-green-600",
  },
  {
    value: "sagittal",
    label: "矢状断 (Sagittal)",
    color: "orange",
    activeClass: "bg-orange-900/50 text-orange-300 border-orange-600",
  },
];

function SliceAxisRadio({
  value,
  onChange,
}: {
  value: SliceAxis;
  onChange: (v: SliceAxis) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-gray-500 mr-1">表示断面:</span>
      {AXIS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-[11px] px-2.5 py-1.5 rounded border transition-colors font-medium ${
            value === opt.value
              ? opt.activeClass
              : "bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────
// 定数
// ────────────────────────────────────────────────
const GLB_PATHS = {
  detailed: "/data/3d-brain/brain_regions.glb",
  macro: "/data/3d-brain/brain_macro_regions.glb",
  slice: "/data/3d-brain/brain_macro_regions.glb",
};
const LABELS_PATHS = {
  detailed: "/data/3d-brain/brain_regions_labels.json",
  macro: "/data/3d-brain/brain_macro_regions_labels.json",
  slice: "/data/3d-brain/brain_macro_regions_labels.json",
};
const ANNOTATIONS_PATH = "/data/3d-brain/brain_annotations.json";
const SLICE_BASE = "/data/3d-brain/slices";

// ────────────────────────────────────────────────
// メインコンポーネント
// ────────────────────────────────────────────────
export default function AnatomicalAtlasClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("macro");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [labelsData, setLabelsData] = useState<Record<string, RegionLabel>>({});
  const [annotations, setAnnotations] = useState<
    Record<string, RegionAnnotation>
  >({});
  const [cortexHidden, setCortexHidden] = useState(false);
  const [mniCoords, setMniCoords] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [sliceAxis, setSliceAxis] = useState<SliceAxis>("axial");

  // 現在表示中のスライスファイル名（BrainSliceViewerから通知）
  const [sliceFiles, setSliceFiles] = useState({
    axialFile: "",
    coronalFile: "",
    sagittalFile: "",
  });

  useEffect(() => {
    fetch(LABELS_PATHS[viewMode])
      .then((r) => r.json())
      .then(setLabelsData)
      .catch(console.error);
  }, [viewMode]);
  useEffect(() => {
    fetch(ANNOTATIONS_PATH)
      .then((r) => r.json())
      .then(setAnnotations)
      .catch(console.error);
  }, []);

  // 領域選択 → スライスをその重心座標へ
  const handleRegionSelect = useCallback(
    (region: string | null) => {
      setSelectedRegion(region);
      if (!region || !labelsData[region]) return;
      const label = labelsData[region];
      const c =
        label.centroid_lh && label.centroid_rh
          ? [
              (label.centroid_lh[0] + label.centroid_rh[0]) / 2,
              (label.centroid_lh[1] + label.centroid_rh[1]) / 2,
              (label.centroid_lh[2] + label.centroid_rh[2]) / 2,
            ]
          : (label.centroid_lh ?? label.centroid_rh ?? [0, 0, 0]);
      setMniCoords([c[0], -c[2], c[1]] as [number, number, number]);
    },
    [labelsData]
  );

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setSelectedRegion(null);
    setCortexHidden(false);
  }, []);

  const hiddenRegions = useMemo<Set<string>>(
    () =>
      viewMode === "macro" && cortexHidden
        ? MACRO_CORTEX_REGIONS
        : new Set<string>(),
    [viewMode, cortexHidden]
  );

  // スライス面（スライスタブのみ有効、選択軸のみ ON）
  const showAxialPlane = viewMode === "slice" && sliceAxis === "axial";
  const showCoronalPlane = viewMode === "slice" && sliceAxis === "coronal";
  const showSagittalPlane = viewMode === "slice" && sliceAxis === "sagittal";

  // スライス URL（3D面インジケーター用）
  const sliceMni = useMemo(
    () => ({
      axialZ: mniCoords[2],
      coronalY: mniCoords[1],
      sagittalX: mniCoords[0],
      axialUrl: sliceFiles.axialFile
        ? `${SLICE_BASE}/axial/${sliceFiles.axialFile}`
        : "",
      coronalUrl: sliceFiles.coronalFile
        ? `${SLICE_BASE}/coronal/${sliceFiles.coronalFile}`
        : "",
      sagittalUrl: sliceFiles.sagittalFile
        ? `${SLICE_BASE}/sagittal/${sliceFiles.sagittalFile}`
        : "",
    }),
    [mniCoords, sliceFiles]
  );

  const tree = viewMode === "detailed" ? DETAILED_TREE : MACRO_TREE;

  // ────────────────────────────────────────────────
  // 3Dモデルパネル（共通）
  // ────────────────────────────────────────────────
  const glbPanel = (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      <BrainGLBViewer
        glbPath={GLB_PATHS[viewMode]}
        labelsData={labelsData}
        selectedRegion={selectedRegion}
        onRegionSelect={handleRegionSelect}
        viewMode={viewMode === "detailed" ? "detailed" : "macro"}
        sliceMni={sliceMni}
        showAxialPlane={showAxialPlane}
        showCoronalPlane={showCoronalPlane}
        showSagittalPlane={showSagittalPlane}
        hiddenRegions={hiddenRegions}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* ────── タブ + コントロールバー ────── */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-gray-900 rounded-lg border border-gray-800">
        {/* タブ切替 */}
        <div className="flex rounded overflow-hidden border border-gray-700">
          {[
            { mode: "macro" as ViewMode, label: "大区分 (9)" },
            { mode: "detailed" as ViewMode, label: "解剖学的アトラス (43)" },
            { mode: "slice" as ViewMode, label: "MRIスライス断面" },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => handleViewModeChange(mode)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === mode ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 皮質下構造モード（macro のみ） */}
        {viewMode === "macro" && (
          <button
            onClick={() => setCortexHidden((v) => !v)}
            className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${cortexHidden ? "bg-red-900/50 text-red-300 border-red-700" : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"}`}
            title="大脳皮質を非表示にして皮質下構造を確認"
          >
            皮質下構造モード{cortexHidden ? " ON" : ""}
          </button>
        )}

        {/* スライスタブ: 軸ラジオボタン */}
        {viewMode === "slice" && (
          <SliceAxisRadio value={sliceAxis} onChange={setSliceAxis} />
        )}

        {/* 選択解除（slice 以外） */}
        {selectedRegion && viewMode !== "slice" && (
          <button
            onClick={() => setSelectedRegion(null)}
            className="text-xs px-2.5 py-1.5 bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300 rounded border border-yellow-700 transition-colors font-medium ml-auto"
          >
            ✕ 選択解除
          </button>
        )}
      </div>

      {/* ────── スライス断面タブ ────── */}
      {viewMode === "slice" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
          {/* 3Dモデル */}
          <div className="lg:col-span-2">{glbPanel}</div>
          {/* 2Dスライス縦並び */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-gray-900 rounded-lg border border-gray-800 p-3 h-full flex flex-col">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex-shrink-0">
                MRI スライス
                <span className="ml-2 normal-case font-normal text-gray-600">
                  ← 3Dモデルと連動
                </span>
              </div>
              <div className="flex-1 min-h-0">
                <BrainSliceViewer
                  mniCoords={mniCoords}
                  onCoordsChange={setMniCoords}
                  onSliceFilesChange={setSliceFiles}
                  layout="vertical"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────── 大区分 / アトラスタブ ────── */}
      {viewMode !== "slice" && (
        <>
          {/* 上段: 3Dモデル（左2/3）+ アノテーション（右1/3） */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
            <div className="lg:col-span-2">{glbPanel}</div>
            <div className="lg:col-span-1 h-full">
              <div
                className="bg-gray-900 rounded-lg border border-gray-800 h-full"
                style={{ minHeight: "200px" }}
              >
                <RegionAnnotationPanel
                  regionKey={selectedRegion}
                  labelsData={labelsData}
                  annotations={annotations}
                  onRegionClick={handleRegionSelect}
                />
              </div>
            </div>
          </div>

          {/* 下段: 領域ツリー（全幅） */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-2 overflow-y-auto max-h-64">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1.5 mb-1.5">
              領域一覧
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4">
              {Object.entries(tree).map(([k, node]) => (
                <TreeNode
                  key={k}
                  label={node.label}
                  node={node}
                  labelsData={labelsData}
                  selectedRegion={selectedRegion}
                  onSelect={handleRegionSelect}
                  depth={0}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
