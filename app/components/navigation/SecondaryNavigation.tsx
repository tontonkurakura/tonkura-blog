import { ReactNode } from "react";

/**
 * セカンダリナビゲーションのプロパティ
 */
interface SecondaryNavigationProps {
  /** 表示するかどうか */
  show: boolean;
  /** 子要素 */
  children?: ReactNode;
}

/**
 * セカンダリナビゲーション（サブメニュー）コンポーネント
 */
export default function SecondaryNavigation({
  show,
  children,
}: SecondaryNavigationProps) {
  if (!show) return null;

  return (
    <nav className="w-full mt-1 bg-[#0a2647]/80 rounded-lg p-1">
      <ul className="flex flex-wrap justify-center space-x-2 md:space-x-3">
        {children}
      </ul>
    </nav>
  );
}

/**
 * データベースページのサブナビゲーション
 */
export function DatabaseSubNavigation() {
  return (
    <SecondaryNavigation show={true}>
      {/* 将来的に他のサブメニューを追加する場合はここに追加 */}
    </SecondaryNavigation>
  );
}

/**
 * 神経学ページのサブナビゲーション
 */
export function NeurologySubNavigation() {
  // 現在は非表示
  return (
    <SecondaryNavigation show={false}>
      {/* 将来的に他のサブメニューを追加する場合はここに追加 */}
    </SecondaryNavigation>
  );
}
