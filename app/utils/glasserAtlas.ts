import { useState, useEffect } from "react";

// Glasser Atlas領域の型定義
export interface GlasserRegion {
  id: number;
  name: string;
  description: string;
  network: string;
}

// Glasser Atlasデータの型定義
interface GlasserAtlasData {
  regions: GlasserRegion[];
}

// idでアクセスできるようにマップ形式に変換した型
export interface GlasserRegionsMap {
  [id: string]: GlasserRegion;
}

// Glasser Atlas領域データを取得するカスタムフック
export function useGlasserAtlasData() {
  const [regionsMap, setRegionsMap] = useState<GlasserRegionsMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGlasserData = async () => {
      try {
        setIsLoading(true);

        // JSONファイルを取得
        const response = await fetch(
          "/data/brain/atlas/HCP-MMP1/glasser_atlas_regions.json"
        );

        if (!response.ok) {
          throw new Error(
            `Failed to load Glasser atlas data: ${response.status}`
          );
        }

        const data: GlasserAtlasData = await response.json();

        // idをキーとしたマップオブジェクトに変換
        const map: GlasserRegionsMap = {};
        data.regions.forEach((region) => {
          map[region.id.toString()] = region;
        });

        console.log(`Loaded ${data.regions.length} Glasser atlas regions`);

        setRegionsMap(map);
        setIsLoading(false);
      } catch (err) {
        console.error("Glasser atlas data loading error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setIsLoading(false);
      }
    };

    loadGlasserData();
  }, []);

  return { regionsMap, isLoading, error };
}

// 領域IDから領域名を取得するヘルパー関数
export function getRegionNameById(
  id: number | string,
  regionsMap: GlasserRegionsMap,
  isRightHemisphere: boolean = false
): string {
  // IDを文字列に変換
  const idStr = id.toString();

  // 左半球IDの取得（右半球の場合は200を引く）
  const leftHemisphereId =
    isRightHemisphere && parseInt(idStr) >= 200
      ? (parseInt(idStr) - 200).toString()
      : idStr;

  // 領域情報の取得
  const region = regionsMap[leftHemisphereId];

  if (region) {
    const hemisphere = isRightHemisphere ? "（右）" : "（左）";
    return `${region.name}${hemisphere}`;
  }

  return `Region ${id}`;
}

// 領域IDから詳細情報を取得するヘルパー関数
export function getRegionDetailsById(
  id: number | string,
  regionsMap: GlasserRegionsMap
) {
  // IDを文字列に変換
  const idStr = id.toString();

  // 右半球かどうかを判定
  const isRightHemisphere = parseInt(idStr) >= 200;

  // 左半球IDの取得
  const leftHemisphereId = isRightHemisphere
    ? (parseInt(idStr) - 200).toString()
    : idStr;

  // 領域情報の取得
  const region = regionsMap[leftHemisphereId];

  if (region) {
    return {
      id: idStr,
      numericId: parseInt(idStr),
      name: region.name,
      description: region.description,
      network: region.network,
      hemisphere: isRightHemisphere ? "右" : "左",
    };
  }

  return null;
}
