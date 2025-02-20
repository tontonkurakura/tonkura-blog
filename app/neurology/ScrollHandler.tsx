"use client";

import { useEffect } from "react";

export default function ScrollHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // スムーズスクロールを実行する関数
    const smoothScroll = (element: HTMLElement) => {
      const targetPosition =
        element.getBoundingClientRect().top + window.scrollY - 16; // scroll-mt-4の分を考慮
      const startPosition = window.scrollY;
      const distance = targetPosition - startPosition;
      const duration = 300; // スクロール時間を300msに設定
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);

        // イージング関数（easeOutQuad）を適用
        const easeProgress = 1 - (1 - progress) * (1 - progress);

        window.scrollTo(0, startPosition + distance * easeProgress);

        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        }
      };

      requestAnimationFrame(animation);
    };

    // ハッシュの変更を監視する関数
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // '#' を除去
      if (hash) {
        try {
          // URLエンコードされたハッシュをデコード
          const decodedHash = decodeURIComponent(hash);
          console.log("Decoded hash:", decodedHash);

          // 対応する要素を検索
          const element = document.getElementById(hash);
          console.log("Found element:", element);

          if (element) {
            // カスタムのスムーズスクロールを実行
            smoothScroll(element);
          } else {
            console.log("Element not found for hash:", hash);
          }
        } catch (error) {
          console.error("Error handling hash change:", error);
        }
      }
    };

    // 初回ロード時にもチェック
    handleHashChange();

    // ハッシュ変更イベントのリスナーを追加
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      // クリーンアップ
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return <>{children}</>;
}
