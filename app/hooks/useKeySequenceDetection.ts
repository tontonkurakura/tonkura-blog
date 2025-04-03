import { useState, useEffect } from "react";

/**
 * 隠しメニュー項目の型定義
 */
export interface HiddenMenuItem {
  /** 項目が表示されるべきかどうか */
  show: boolean;
  /** 発見アニメーションを表示するかどうか */
  isDiscovered: boolean;
}

/**
 * 隠しメニュー項目の状態の型定義
 */
export interface HiddenMenuItems {
  daisetsu: HiddenMenuItem;
  recipes: HiddenMenuItem;
}

/**
 * 特定のキーシーケンスを検出し、隠しメニューの表示を管理するフック
 * @returns 隠しメニューの状態と関連関数
 */
export function useKeySequenceDetection() {
  // キーシーケンスの状態
  const [keySequence, setKeySequence] = useState("");

  // 隠しメニュー項目の状態
  const [hiddenMenuItems, setHiddenMenuItems] = useState<HiddenMenuItems>({
    daisetsu: { show: false, isDiscovered: false },
    recipes: { show: false, isDiscovered: false },
  });

  // クライアントサイドかどうか
  const [isClient, setIsClient] = useState(false);

  // クライアントサイド初期化
  useEffect(() => {
    setIsClient(true);

    // LocalStorageから保存された状態を復元
    const savedDaisetsu = localStorage.getItem("showDaisetsu") === "true";
    const savedRecipes = localStorage.getItem("showRecipes") === "true";

    if (savedDaisetsu || savedRecipes) {
      setHiddenMenuItems({
        daisetsu: { show: savedDaisetsu, isDiscovered: false },
        recipes: { show: savedRecipes, isDiscovered: false },
      });
    }
  }, []);

  // キーシーケンスの検出
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const newSequence = keySequence + event.key.toLowerCase();
      setKeySequence(newSequence);

      // 最後の4文字のみを保持
      if (newSequence.length > 4) {
        setKeySequence(newSequence.slice(-4));
      }

      // "zen"シーケンスの検出 - Daisetsuメニューの表示
      if (newSequence.endsWith("zen")) {
        const newState = !hiddenMenuItems.daisetsu.show;

        setHiddenMenuItems((prev) => ({
          ...prev,
          daisetsu: {
            show: newState,
            isDiscovered: newState,
          },
        }));

        // 発見アニメーションのリセット
        if (newState) {
          localStorage.setItem("showDaisetsu", "true");
          setTimeout(() => {
            setHiddenMenuItems((prev) => ({
              ...prev,
              daisetsu: {
                ...prev.daisetsu,
                isDiscovered: false,
              },
            }));
          }, 3000);
        } else {
          localStorage.setItem("showDaisetsu", "false");
        }
      }

      // "cook"シーケンスの検出 - Recipesメニューの表示
      if (newSequence.endsWith("cook")) {
        const newState = !hiddenMenuItems.recipes.show;

        setHiddenMenuItems((prev) => ({
          ...prev,
          recipes: {
            show: newState,
            isDiscovered: newState,
          },
        }));

        // 発見アニメーションのリセット
        if (newState) {
          localStorage.setItem("showRecipes", "true");
          setTimeout(() => {
            setHiddenMenuItems((prev) => ({
              ...prev,
              recipes: {
                ...prev.recipes,
                isDiscovered: false,
              },
            }));
          }, 3000);
        } else {
          localStorage.setItem("showRecipes", "false");
        }
      }
    };

    if (isClient) {
      window.addEventListener("keydown", handleKeyPress);
      return () => {
        window.removeEventListener("keydown", handleKeyPress);
      };
    }
  }, [keySequence, hiddenMenuItems, isClient]);

  return {
    hiddenMenuItems,
    isClient,
  };
}
