"use client";

import { usePathname } from "next/navigation";
import HamburgerButton from "./HamburgerButton";
import MainNavigation from "./MainNavigation";
import {
  DatabaseSubNavigation,
  NeurologySubNavigation,
} from "./SecondaryNavigation";
import { useMenuState } from "../../hooks/useMenuState";
import { useKeySequenceDetection } from "../../hooks/useKeySequenceDetection";

/**
 * ナビゲーションヘッダーコンポーネント
 * サイト全体のナビゲーションを管理します
 */
export default function NavigationHeader() {
  // ナビゲーションメニューの状態管理
  const { isMenuOpen, toggleMenu, closeMenu, navRef } = useMenuState();

  // 隠しメニュー項目の状態管理
  const { hiddenMenuItems, isClient } = useKeySequenceDetection();

  // 現在のパス
  const pathname = usePathname();

  // 特定のページかどうかを判定
  const isNeurologyPage = pathname.startsWith("/neurology");
  const isDatabasePage = pathname.startsWith("/database");

  return (
    <header className="bg-[#0a2647] text-white py-2 md:py-3">
      <div className="container mx-auto px-2">
        <div className="flex flex-col items-center">
          {/* サイトタイトル */}
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide">
            TonKurA
          </h1>

          {/* モバイル用ハンバーガーメニューボタン */}
          <HamburgerButton isOpen={isMenuOpen} onToggle={toggleMenu} />

          {/* メインナビゲーション */}
          <MainNavigation
            navRef={navRef}
            isMenuOpen={isMenuOpen}
            closeMenu={closeMenu}
            hiddenMenuItems={hiddenMenuItems}
          />

          {/* 条件付きサブナビゲーション */}
          {isNeurologyPage && <NeurologySubNavigation />}
          {isDatabasePage && <DatabaseSubNavigation />}
        </div>
      </div>
    </header>
  );
}
