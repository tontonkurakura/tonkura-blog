import { useState, useEffect } from "react";

// トラクト情報の型定義
export interface TractInfo {
  path: string;
  name: string;
  description: string;
  fullName?: string;
  category: string;
}

// トラクトデータ全体の型定義
export interface TractData {
  [key: string]: TractInfo;
}

// JSONファイルのトラクト名と説明の型定義
interface TractNamesData {
  [category: string]: {
    [tractBaseId: string]: {
      name: string;
      description: string;
    };
  };
}

// JSONファイルのトラクトパスの型定義
interface TractPathsData {
  [category: string]: {
    [tractId: string]: string;
  };
}

// JSONファイルのカテゴリ名の型定義
export interface CategoryNamesData {
  [category: string]: string;
}

// カテゴリごとにペアリングされたトラクトの型定義
export interface TractPair {
  id: string;
  name: string;
  left?: string;
  right?: string;
  // CSVでの順序を追加
  order?: number;
}

// カテゴリごとのトラクトペアのマップの型定義
export interface TractsByCategoryPaired {
  [category: string]: TractPair[];
}

// CSVファイルの順序を定義
// この順序はabbreviation.csvファイルに基づいています
const TRACT_ORDER: { [key: string]: number } = {
  // Association fibers
  AF: 1,
  C_FPH: 2,
  C_FP: 3,
  C_PHP: 4,
  C_PH: 5,
  C_PO: 6,
  EMC: 7,
  FAT: 8,
  IFOF: 9,
  ILF: 10,
  MdLF: 11,
  PAT: 12,
  SLF1: 13,
  SLF2: 14,
  SLF3: 15,
  UF: 16,
  VOF: 17,

  // Projection fibers
  AR: 1,
  CBT: 2,
  CPT_F: 3,
  CPT_P: 4,
  CPT_O: 5,
  CS_A: 6,
  CS_S: 7,
  CS_P: 8,
  CST: 9,
  DRTT: 10,
  F: 11,
  ML: 12,
  OR: 13,
  RST: 14,
  TR_A: 15,
  TR_P: 16,
  TR_S: 17,

  // Commissural fibers
  AC: 1,
  CC: 2,
};

/**
 * トラクトデータを読み込むためのカスタムフック
 * @returns トラクトデータ、カテゴリごとのペアリングされたトラクト、カテゴリ表示名、ローディング状態
 */
export default function useTractData() {
  const [tractData, setTractData] = useState<TractData>({});
  const [tractsByCategory, setTractsByCategory] =
    useState<TractsByCategoryPaired>({
      Association: [],
      Projection: [],
      Commissural: [],
    });
  const [categoryDisplayNames, setCategoryDisplayNames] =
    useState<CategoryNamesData>({
      Association: "連合線維 (Association fibers)",
      Projection: "投射線維 (Projection fibers)",
      Commissural: "交連線維 (Commissural fibers)",
    });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTractData = async () => {
      try {
        setIsLoading(true);

        // トラクト名と説明を読み込む
        const tractNamesResponse = await fetch(
          "/data/brain/atlas/tract-info/tract-names-ja.json"
        );
        const tractNamesData: TractNamesData = await tractNamesResponse.json();

        // トラクトパスを読み込む
        const tractPathsResponse = await fetch(
          "/data/brain/atlas/tract-info/tract-paths.json"
        );
        const tractPathsData: TractPathsData = await tractPathsResponse.json();

        // カテゴリ表示名を読み込む
        const categoryNamesResponse = await fetch(
          "/data/brain/atlas/tract-info/category-names.json"
        );
        const categoryNamesData: CategoryNamesData =
          await categoryNamesResponse.json();

        // カテゴリ表示名をセット（脳神経と小脳線維を除外）
        const filteredCategoryNames: CategoryNamesData = {};
        Object.keys(categoryNamesData).forEach((key) => {
          if (key !== "Cranial Nerves" && key !== "Cerebellum") {
            filteredCategoryNames[key] = categoryNamesData[key];
          }
        });
        setCategoryDisplayNames(filteredCategoryNames);

        // tractDataの構築
        const newTractData: TractData = {};

        // すべてのカテゴリとトラクトを処理（脳神経と小脳線維を除外）
        Object.keys(tractPathsData).forEach((category) => {
          if (category !== "Cranial Nerves" && category !== "Cerebellum") {
            Object.keys(tractPathsData[category]).forEach((tractId) => {
              // トラクトの基本名を取得（_LやR_を除去）
              const baseTractId = tractId.replace(/_[LR]$/, "");

              // トラクト情報を作成
              const isLeft = tractId.endsWith("_L");
              const isRight = tractId.endsWith("_R");

              let displayName = "";
              if (isLeft || isRight) {
                // 左右の区別があるトラクト
                const side = isLeft ? "（左）" : "（右）";
                // 基本名がある場合はそこから情報を取得
                if (
                  tractNamesData[category] &&
                  tractNamesData[category][baseTractId]
                ) {
                  displayName = `${tractNamesData[category][baseTractId].name}${side}`;
                } else {
                  // 個別のIDがある場合はそこから
                  const simpleTractId = tractId.replace(/_L$|_R$/, "");
                  if (
                    tractNamesData[category] &&
                    tractNamesData[category][simpleTractId]
                  ) {
                    displayName = `${tractNamesData[category][simpleTractId].name}${side}`;
                  } else {
                    displayName = tractId; // フォールバック
                  }
                }
              } else {
                // 左右の区別がないトラクト
                if (
                  tractNamesData[category] &&
                  tractNamesData[category][tractId]
                ) {
                  displayName = tractNamesData[category][tractId].name;
                } else {
                  displayName = tractId; // フォールバック
                }
              }

              // トラクトの説明を取得
              let description = "";
              if (tractNamesData[category]) {
                if (isLeft || isRight) {
                  if (tractNamesData[category][baseTractId]) {
                    description =
                      tractNamesData[category][baseTractId].description;
                  }
                } else if (tractNamesData[category][tractId]) {
                  description = tractNamesData[category][tractId].description;
                }
              }

              // フルネーム（英語名）を取得 - ここでは簡略化のためtractIdをそのまま使用
              const fullName = tractId;

              // tractDataオブジェクトにトラクト情報を追加
              newTractData[tractId] = {
                path: tractPathsData[category][tractId],
                name: displayName,
                description: description,
                fullName: fullName,
                category: category,
              };
            });
          }
        });

        setTractData(newTractData);

        // トラクトをカテゴリごとにペアリング
        const newTractsByCategory: TractsByCategoryPaired = {
          Association: [],
          Projection: [],
          Commissural: [],
        };

        // トラクトデータをカテゴリごとに整理（左右ペアごとにまとめる）
        Object.keys(newTractData).forEach((tractId) => {
          const tract = newTractData[tractId];
          const category = tract.category;

          // 脳神経と小脳線維を除外
          if (category === "Cranial Nerves" || category === "Cerebellum") {
            return;
          }

          // カテゴリが存在しない場合は初期化
          if (!newTractsByCategory[category]) {
            newTractsByCategory[category] = [];
          }

          // トラクトIDから左右の識別（末尾が_Lか_R）
          const isLeft = tractId.endsWith("_L");
          const isRight = tractId.endsWith("_R");

          // 交連線維（Commissural）など左右の区別がないものがあるので個別に処理
          if (category === "Commissural" && !isLeft && !isRight) {
            // 基本名を取得
            const baseName = tractId;
            // 順序を取得
            const order = TRACT_ORDER[baseName] || 999;

            newTractsByCategory[category].push({
              id: tractId,
              name: tract.name,
              left: tractId,
              right: undefined,
              order: order,
            });
            return;
          }

          // 左右の区別がないケースはスキップ
          if (!isLeft && !isRight) {
            return;
          }

          // 基本名を取得（_Lや_Rを除いた部分）
          const baseName = tractId.slice(0, -2);

          // トラクト名から「（左）」や「（右）」を除去
          const baseDisplayName = tract.name.replace(/（左）|（右）/g, "");

          // 既存の項目を検索
          const existingIndex = newTractsByCategory[category].findIndex(
            (item) => item.id === baseName
          );

          // 順序を取得
          const order = TRACT_ORDER[baseName] || 999;

          if (existingIndex >= 0) {
            // 既存項目に左右どちらかを追加
            if (isLeft) {
              newTractsByCategory[category][existingIndex].left = tractId;
            } else {
              newTractsByCategory[category][existingIndex].right = tractId;
            }
          } else {
            // 新規項目を追加
            newTractsByCategory[category].push({
              id: baseName,
              name: baseDisplayName,
              left: isLeft ? tractId : undefined,
              right: isRight ? tractId : undefined,
              order: order,
            });
          }
        });

        // 各カテゴリ内でトラクトを順番に並べ替え
        Object.keys(newTractsByCategory).forEach((category) => {
          newTractsByCategory[category].sort((a, b) => {
            return (a.order || 999) - (b.order || 999);
          });
        });

        setTractsByCategory(newTractsByCategory);
        setIsLoading(false);
      } catch (error) {
        console.error(
          "トラクトデータの読み込み中にエラーが発生しました:",
          error
        );
        setIsLoading(false);
      }
    };

    loadTractData();
  }, []);

  return {
    tractData,
    tractsByCategory,
    categoryDisplayNames,
    isLoading,
  };
}
