import Link from "next/link";
import { KeyboardEvent, ReactNode } from "react";

/**
 * ナビゲーションリンク用のプロパティ
 */
export interface NavigationLinkProps {
  /** リンク先のURL */
  href: string;
  /** リンクの表示内容 */
  children: ReactNode;
  /** リンクがアクティブかどうか */
  isActive?: boolean;
  /** メニュー閉じる関数 */
  onClose?: () => void;
  /** 追加のCSSクラス */
  className?: string;
  /** アニメーションクラス */
  animationClass?: string;
  /** グラデーションの開始色 */
  fromColor?: string;
  /** グラデーションの終了色 */
  toColor?: string;
}

/**
 * ナビゲーションリンクコンポーネント
 */
export default function NavigationLink({
  href,
  children,
  isActive,
  onClose,
  className = "",
  animationClass = "",
  fromColor = "blue-800",
  toColor = "indigo-800",
}: NavigationLinkProps) {
  // キーボードでのナビゲーション
  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  // 基本のスタイル
  const baseStyle = `block px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:shadow-inner text-sm md:text-base font-bold`;

  // グラデーションのスタイル
  const gradientStyle = `from-${fromColor} to-${toColor}`;

  // 最終的なクラス名
  const linkClassName = `${baseStyle} hover:${gradientStyle} ${className} ${animationClass}`;

  return (
    <li className="w-full md:w-auto text-center" role="none">
      <Link
        href={href}
        className={linkClassName}
        onClick={onClose}
        role="menuitem"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-current={isActive ? "page" : undefined}
      >
        {children}
      </Link>
    </li>
  );
}
