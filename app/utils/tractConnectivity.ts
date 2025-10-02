import { useEffect, useState } from "react";

// CSVファイルのトラクト名と実際のファイル名の間のマッピング
// 例: CSVでの "SLF_I" は実際のファイルでは "SLF1" になるなど
const tractNameMapping: Record<string, string> = {
  SLF_I: "SLF1",
  SLF_II: "SLF2",
  SLF_III: "SLF3",
  C_R: "C_FP", // C_Rは実際のファイル名ではC_FPとして扱われる
  CStr_S: "CS_S", // 他のマッピングが必要な場合
  CStr_A: "CS_A",
  CStr_P: "CS_P",
  CTh_S: "TR_S", // Coricothalamic Tract -> Thalamic Radiation
  CTh_P: "TR_P",
  CTh_A: "TR_A",
  PTAT: "PAT", // 名前の違いの修正
};

// 接続情報の型定義
export interface ConnectivityInfo {
  region: string;
  hemisphere: string;
  tract: string;
  tractFullName: string;
  connectivity: number;
}

// トラクト（AF_L など）ごとに高接続性のある皮質領域をマップする型
export interface TractToRegionsMap {
  [tractId: string]: string[]; // 各トラクトIDに対応する皮質領域IDのリスト
}

// CSVのトラクト名を実際のファイル名に変換する関数
function convertTractName(csvTractName: string): string {
  return tractNameMapping[csvTractName] || csvTractName;
}

// この関数は選択されたトラクト（AF_L, AF_R）に対応する皮質領域を返す
export function useHighConnectivityRegions() {
  const [tractToRegionsMap, setTractToRegionsMap] = useState<TractToRegionsMap>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  // CSVファイルを読み込み、解析する
  useEffect(() => {
    const loadConnectivityData = async () => {
      try {
        setIsLoading(true);

        // CSVファイルを取得
        const response = await fetch(
          "/data/brain/atlas/hcp1065_prob_coverage_nifti/high_connectivity_tracts.csv"
        );
        const csvText = await response.text();

        // CSVをパースする
        const rows = csvText.split("\n");
        // 最初のヘッダー行をスキップ
        const dataRows = rows.slice(1);

        // トラクトごとに領域をマッピングするオブジェクトを作成
        const newTractToRegionsMap: TractToRegionsMap = {};

        // 各行を処理
        for (const row of dataRows) {
          if (!row.trim()) continue; // 空行をスキップ

          const columns = row.split(",");
          if (columns.length < 5) continue; // 不完全な行をスキップ

          const region = columns[0]; // 皮質領域ID（例: 6mp）
          const hemisphere = columns[1]; // LEFT または RIGHT
          const csvTractName = columns[2]; // トラクトのID（例: CStr_S）
          // const tractFullName = columns[3]; // トラクトの完全名
          const connectivity = parseFloat(columns[4]); // 接続性のパーセンテージ

          // 接続性が一定の閾値以上の場合のみ考慮する
          // ここでは100%の接続性のみを考慮（閾値は必要に応じて調整可能）
          if (connectivity >= 100) {
            // CSVのトラクト名を実際のファイル名に変換
            const realTractName = convertTractName(csvTractName);

            // トラクト名に左右の情報を追加（"SLF1" -> "SLF1_L" または "SLF1_R"）
            const tractWithHemisphere = `${realTractName}_${hemisphere === "LEFT" ? "L" : "R"}`;

            // 既にマップが存在しない場合は新しい配列を作成
            if (!newTractToRegionsMap[tractWithHemisphere]) {
              newTractToRegionsMap[tractWithHemisphere] = [];
            }

            // HCP-MMP1では左半球は1-180、右半球は201-380の値を持つ
            const regionId = region; // 領域IDはそのまま使用
            const numericalRegionId =
              hemisphere === "LEFT" ? regionId : `${parseInt(regionId) + 200}`;

            // 重複を避けつつリージョンを追加
            if (
              !newTractToRegionsMap[tractWithHemisphere].includes(
                numericalRegionId
              )
            ) {
              newTractToRegionsMap[tractWithHemisphere].push(numericalRegionId);
            }
          }
        }

        // デバッグ出力
        console.log(
          `高接続性データ読み込み完了: ${Object.keys(newTractToRegionsMap).length}個のトラクト`
        );
        for (const tract of Object.keys(newTractToRegionsMap).slice(0, 5)) {
          console.log(
            `${tract}: ${newTractToRegionsMap[tract].length}個の関連領域`
          );
        }

        // 状態を更新
        setTractToRegionsMap(newTractToRegionsMap);
        setIsLoading(false);
      } catch (error) {
        console.error("接続性データのロード中にエラーが発生しました:", error);
        setIsLoading(false);
      }
    };

    loadConnectivityData();
  }, []);

  return { tractToRegionsMap, isLoading };
}

// JSONファイルからのトラクト接続性データの型定義
export interface ConnectomeRegion {
  region_name: string;
  description: string;
  probability: number;
  region_number: number;
}

export interface ConnectomeData {
  [tractBase: string]: {
    tract_name: string;
    full_name: string;
    connections: {
      left: ConnectomeRegion[];
      right: ConnectomeRegion[];
    };
  };
}

// 新しいJSONデータを使用するカスタムフック
export function useConnectomeData() {
  const [connectomeData, setConnectomeData] = useState<ConnectomeData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [tractToRegionsMapNew, setTractToRegionsMapNew] =
    useState<TractToRegionsMap>({});

  useEffect(() => {
    const loadConnectomeData = async () => {
      try {
        setIsLoading(true);

        // JSONファイルを取得
        const response = await fetch(
          "/data/brain/atlas/hcp1065_prob_coverage_nifti/tract_to_region_connectome.json"
        );
        const data: ConnectomeData = await response.json();

        // データを保存
        setConnectomeData(data);

        // トラクトごとに領域をマッピングするオブジェクトを作成
        const newTractToRegionsMap: TractToRegionsMap = {};

        // JSONデータを処理
        Object.keys(data).forEach((tractBase) => {
          const tractInfo = data[tractBase];

          // 左半球のトラクト
          const leftTractId = `${tractBase}_L`;
          newTractToRegionsMap[leftTractId] = tractInfo.connections.left
            .filter((region) => region.probability >= 80) // 接続確率80%以上
            .map((region) => {
              // HCP-MMP1では左半球は元のregion_number
              return region.region_number.toString();
            });

          // 右半球のトラクト
          const rightTractId = `${tractBase}_R`;
          newTractToRegionsMap[rightTractId] = tractInfo.connections.right
            .filter((region) => region.probability >= 80) // 接続確率80%以上
            .map((region) => {
              // HCP-MMP1では右半球は200を足す
              return (region.region_number + 200).toString();
            });
        });

        // デバッグ出力
        console.log(
          `コネクトームデータ読み込み完了: ${Object.keys(newTractToRegionsMap).length}個のトラクト`
        );
        for (const tract of Object.keys(newTractToRegionsMap).slice(0, 5)) {
          console.log(
            `${tract}: ${newTractToRegionsMap[tract].length}個の関連領域 (JSON)`
          );
        }

        // 状態を更新
        setTractToRegionsMapNew(newTractToRegionsMap);
        setIsLoading(false);
      } catch (error) {
        console.error(
          "コネクトームデータのロード中にエラーが発生しました:",
          error
        );
        setIsLoading(false);
      }
    };

    loadConnectomeData();
  }, []);

  return { connectomeData, tractToRegionsMapNew, isLoading };
}

// 既存の関数を拡張して、JSONデータからの接続性情報も考慮するように変更
export function getHighConnectivityRegions(
  selectedTracts: string[],
  tractToRegionsMap: TractToRegionsMap,
  tractToRegionsMapNew?: TractToRegionsMap
): string[] {
  // 選択されたすべてのトラクトに関連する皮質領域を集める
  const regions: string[] = [];

  for (const tract of selectedTracts) {
    // 新しいJSONデータを優先して使用
    const connectedRegions =
      (tractToRegionsMapNew && tractToRegionsMapNew[tract]) ||
      tractToRegionsMap[tract] ||
      [];

    // 重複を避けつつ領域を追加
    for (const region of connectedRegions) {
      if (!regions.includes(region)) {
        regions.push(region);
      }
    }
  }

  // 内部処理では右半球は201-380だが、NIFTIファイルでは左右とも1-180
  // 内部ID表現をそのまま返す（NiivueViewerコンポーネント側で変換処理を行う）
  console.log(
    `選択されたトラクト ${selectedTracts.join(", ")} の接続領域: ${regions.join(", ")}`
  );

  return regions;
}
