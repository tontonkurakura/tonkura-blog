"use client";

import { useState, useEffect, useCallback } from "react";

interface AALJapaneseLabel {
  englishLabel: string;
  japaneseLabel: string;
  laterality: string;
  category: string;
  englishName?: string;
}

interface BrainRegionListProps {
  regions: { index: number; name: string; color: string }[];
  selectedRegion: number | null;
  onRegionSelect: (regionIndex: number) => void;
  japaneseLabels?: Record<string, string>;
  japaneseLabelsData?: AALJapaneseLabel[];
}

export default function BrainRegionList({
  regions,
  selectedRegion,
  onRegionSelect,
  japaneseLabels = {},
  japaneseLabelsData = [],
}: BrainRegionListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRegions, setFilteredRegions] = useState(regions);
  const [sortOrder, setSortOrder] = useState<"index" | "name">("index");

  // 英語名から日本語名を取得する関数をuseCallbackでメモ化
  const getJapaneseName = useCallback(
    (englishName: string): string => {
      // 新しいJSONデータから検索
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

      // 後方互換性のために従来の方法も残す
      // 完全一致で検索
      if (japaneseLabels[englishName]) {
        return japaneseLabels[englishName];
      }

      // 部分一致で検索（左右の情報を考慮）
      for (const key in japaneseLabels) {
        if (englishName.includes(key)) {
          // 左右の情報を接頭辞に変更
          const japaneseName = japaneseLabels[key];
          if (englishName.includes("_L")) {
            return "左" + japaneseName.replace(" 左", "");
          } else if (englishName.includes("_R")) {
            return "右" + japaneseName.replace(" 右", "");
          }
          return japaneseName;
        }
      }

      return "";
    },
    [japaneseLabels, japaneseLabelsData]
  );

  // 検索語や並び順が変更されたときにリージョンをフィルタリング
  useEffect(() => {
    // AAL3で空になっている領域（前部帯状回(35, 36)と視床(81, 82)）を除外
    let filtered = regions.filter(
      (region) => ![35, 36, 81, 82].includes(region.index)
    );

    // 検索語でフィルタリング
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((region) => {
        const englishNameMatch = region.name
          .toLowerCase()
          .includes(lowerSearchTerm);
        const japaneseName = getJapaneseName(region.name);
        const japaneseNameMatch =
          japaneseName && japaneseName.includes(lowerSearchTerm);
        return englishNameMatch || japaneseNameMatch;
      });
    }

    // 並び順でソート
    if (sortOrder === "index") {
      filtered.sort((a, b) => a.index - b.index);
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredRegions(filtered);
  }, [regions, searchTerm, sortOrder, getJapaneseName]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <input
          type="text"
          placeholder="領域を検索..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-2 flex justify-between">
        <div className="text-sm text-gray-500">
          {filteredRegions.length} / {regions.length} 領域
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">並び順:</span>
          <select
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "index" | "name")}
          >
            <option value="index">インデックス</option>
            <option value="name">名前</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredRegions.map((region) => {
            const isSelected = selectedRegion === region.index;
            const japaneseName = getJapaneseName(region.name);

            return (
              <li
                key={region.index}
                role="button"
                tabIndex={0}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-50 ${
                  isSelected ? "bg-blue-50" : ""
                }`}
                onClick={() => onRegionSelect(region.index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRegionSelect(region.index);
                  }
                }}
              >
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: region.color }}
                  ></div>
                  <div>
                    <div className="font-medium">
                      {japaneseName ? (
                        <span className="text-blue-700">{japaneseName}</span>
                      ) : (
                        region.name
                      )}
                    </div>
                    {japaneseName && (
                      <div className="text-xs text-gray-500">{region.name}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      ID: {region.index}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
