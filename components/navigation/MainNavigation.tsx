import { RefObject } from "react";
import { usePathname } from "next/navigation";
import NavigationLink from "./NavigationLink";

/**
 * メインナビゲーションのプロパティ
 */
interface MainNavigationProps {
  /** ナビゲーションへの参照 */
  navRef: RefObject<HTMLElement | null>;
  /** メニューが開いているかどうか */
  isMenuOpen: boolean;
  /** メニューを閉じる関数 */
  closeMenu: () => void;
}

/**
 * メインナビゲーションコンポーネント
 */
export default function MainNavigation({
  navRef,
  isMenuOpen,
  closeMenu,
}: MainNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      ref={navRef}
      className={`w-full md:w-auto transition-all duration-300 ${isMenuOpen ? "block" : "hidden md:block"
        }`}
      id="navigation-menu"
      aria-label="メインナビゲーション"
    >
      <div className="md:flex md:flex-col md:items-center">
        <div className="flex flex-col items-center w-full">
          {/* 1列目 */}
          <ul
            className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full py-2 md:py-1"
            role="menubar"
          >
            {/* ホーム */}
            <NavigationLink
              href="/"
              isActive={pathname === "/"}
              onClose={closeMenu}
            >
              Home
            </NavigationLink>

            {/* ブログ */}
            <NavigationLink
              href="/blog"
              isActive={pathname.startsWith("/blog")}
              onClose={closeMenu}
              fromColor="indigo-800"
              toColor="purple-800"
            >
              Blog
            </NavigationLink>

            {/* データベース */}
            <NavigationLink
              href="/database"
              isActive={pathname.startsWith("/database")}
              onClose={closeMenu}
              fromColor="cyan-800"
              toColor="blue-800"
            >
              Database
            </NavigationLink>

            {/* ツール */}
            <NavigationLink
              href="/tools"
              isActive={pathname.startsWith("/tools")}
              onClose={closeMenu}
              fromColor="rose-800"
              toColor="pink-800"
            >
              Tools
            </NavigationLink>

            {/* ギャラリー */}
            <NavigationLink
              href="/gallery"
              isActive={pathname.startsWith("/gallery")}
              onClose={closeMenu}
              fromColor="pink-800/80"
              toColor="orange-800/80"
            >
              Gallery
            </NavigationLink>
          </ul>

          {/* 2列目 */}
          <ul
            className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full border-t md:border-t-0 border-gray-600 pt-2 md:pt-0 py-2 md:py-1"
            role="menubar"
          >
            {/* 解剖学的アトラス */}
            <NavigationLink
              href="/anatomical-atlas"
              isActive={pathname.startsWith("/anatomical-atlas")}
              onClose={closeMenu}
              fromColor="teal-800"
              toColor="emerald-800"
            >
              Anatomical Atlas
            </NavigationLink>

            {/* 機能的アトラス */}
            <NavigationLink
              href="/functional-atlas"
              isActive={pathname.startsWith("/functional-atlas")}
              onClose={closeMenu}
              fromColor="emerald-800"
              toColor="lime-800"
            >
              Functional Atlas
            </NavigationLink>

            {/* 白質アトラス */}
            <NavigationLink
              href="/white-matter-atlas"
              isActive={pathname.startsWith("/white-matter-atlas")}
              onClose={closeMenu}
              fromColor="lime-800"
              toColor="green-800"
            >
              Tract Atlas
            </NavigationLink>
          </ul>
        </div>
      </div>
    </nav>
  );
}
