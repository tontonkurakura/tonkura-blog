"use client";

import Link from "next/link";
import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDaisetsu, setShowDaisetsu] = useState(false);
  const [keySequence, setKeySequence] = useState("");
  const [isDiscovered, setIsDiscovered] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // ローカルストレージからDaisetsuの表示状態を復元
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedShowDaisetsu = localStorage.getItem("showDaisetsu");
      if (savedShowDaisetsu === "true") {
        setShowDaisetsu(true);
      }
    }
  }, []);

  // Daisetsuの表示状態をローカルストレージに保存
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("showDaisetsu", showDaisetsu.toString());
    }
  }, [showDaisetsu]);

  useEffect(() => {
    const handleKeyPress = (event: globalThis.KeyboardEvent) => {
      const newSequence = keySequence + event.key.toLowerCase();
      setKeySequence(newSequence);

      // 最後の3文字のみを保持
      if (newSequence.length > 3) {
        setKeySequence(newSequence.slice(-3));
      }

      // キーシーケンスが"zen"の場合、Daisetsuを表示
      if (newSequence.endsWith("zen")) {
        setShowDaisetsu(true);
        setIsDiscovered(true);
        // ローカルストレージに保存
        if (typeof window !== "undefined") {
          localStorage.setItem("showDaisetsu", "true");
        }
        // 3秒後にディスカバーエフェクトを消す
        setTimeout(() => {
          setIsDiscovered(false);
        }, 3000);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [keySequence]);

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEscKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [isMenuOpen]);

  // メニュー外クリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navRef.current &&
        !navRef.current.contains(event.target as Node) &&
        isMenuOpen
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // キーボードでのナビゲーション
  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  // 神経学関連のページかどうかを判定
  const isNeurologyPage = pathname.startsWith("/neurology");

  // Databaseページかどうかを判定
  const isDatabasePage = pathname.startsWith("/database");

  return (
    <header className="bg-[#0a2647] text-white py-2 md:py-3">
      <div className="container mx-auto px-2">
        <div className="flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-wide">
            TonKurA
          </h1>

          {/* ハンバーガーメニューボタン（モバイル用） */}
          <button
            className="md:hidden w-8 h-8 flex flex-col justify-center items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="navigation-menu"
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-white my-1 transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>

          {/* メインナビゲーションメニュー */}
          <nav
            ref={navRef}
            className={`w-full md:w-auto transition-all duration-300 ${
              isMenuOpen ? "block" : "hidden md:block"
            }`}
            id="navigation-menu"
            aria-label="メインナビゲーション"
          >
            <div className="md:flex md:flex-col md:items-center">
              {/* 1行目 */}
              <ul
                className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 py-2 md:py-1"
                role="menubar"
              >
                <li className="w-full md:w-auto text-center" role="none">
                  <Link
                    href="/"
                    className="block px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-blue-800 to-indigo-800 hover:shadow-inner text-sm md:text-base font-bold"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-current={pathname === "/" ? "page" : undefined}
                  >
                    Home
                  </Link>
                </li>
                <li className="w-full md:w-auto text-center" role="none">
                  <Link
                    href="/blog"
                    className="block px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-indigo-800 to-purple-800 hover:shadow-inner text-sm md:text-base font-bold"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-current={
                      pathname.startsWith("/blog") ? "page" : undefined
                    }
                  >
                    Blog
                  </Link>
                </li>
                <li className="w-full md:w-auto text-center" role="none">
                  <Link
                    href="/neurology"
                    className="block px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-fuchsia-800 to-red-800 hover:shadow-inner text-sm md:text-base font-bold"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-current={
                      pathname.startsWith("/neurology") ? "page" : undefined
                    }
                  >
                    Neurology
                  </Link>
                </li>
                <li className="w-full md:w-auto text-center" role="none">
                  <Link
                    href="/database"
                    className="block px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-cyan-800 to-blue-800 hover:shadow-inner text-sm md:text-base font-bold"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-current={
                      pathname.startsWith("/database")
                        ? "page"
                        : undefined
                    }
                  >
                    Database
                  </Link>
                </li>
              </ul>

              {/* 2行目 */}
              <ul
                className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 py-2 md:py-1"
                role="menubar"
              >
                <li className="w-full md:w-auto text-center" role="none">
                  <Link
                    href="/tools"
                    className="block px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-rose-800 to-pink-800 hover:shadow-inner text-sm md:text-base font-bold"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-current={
                      pathname.startsWith("/tools") ? "page" : undefined
                    }
                  >
                    Tools
                  </Link>
                </li>
                <li className="w-full md:w-auto text-center" role="none">
                  <Link
                    href="/photographs"
                    className="block px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-pink-800/80 to-orange-800/80 hover:shadow-inner text-sm md:text-base font-bold"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-current={
                      pathname.startsWith("/photographs") ? "page" : undefined
                    }
                  >
                    Photographs
                  </Link>
                </li>
                <li className="w-full md:w-auto text-center" role="none">
                  <Link
                    href="/recipes"
                    className="block px-3 py-1 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-orange-800 to-yellow-800 hover:shadow-inner text-sm md:text-base font-bold"
                    onClick={() => setIsMenuOpen(false)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    aria-current={
                      pathname.startsWith("/recipes") ? "page" : undefined
                    }
                  >
                    Recipes
                  </Link>
                </li>
                {showDaisetsu && (
                  <li className="w-full md:w-auto text-center" role="none">
                    <Link
                      href="/daisetsu"
                      className={`block px-3 py-1 rounded-lg transition-all duration-500 hover:bg-gradient-to-r from-yellow-800 to-green-800 hover:shadow-inner text-sm md:text-base font-bold ${
                        isDiscovered
                          ? "animate-[discover_2s_ease-out] bg-gradient-to-r from-yellow-800/50 to-green-800/50"
                          : ""
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                      role="menuitem"
                      tabIndex={0}
                      onKeyDown={handleKeyDown}
                      aria-current={
                        pathname.startsWith("/daisetsu") ? "page" : undefined
                      }
                    >
                      Daisetsu
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </nav>

          {/* 神経学関連ページの場合のみ表示するサブナビゲーション */}
          {isNeurologyPage && (
            <nav className="w-full mt-1 bg-[#0a2647]/80 rounded-lg p-1">
              <ul className="flex flex-wrap justify-center space-x-2 md:space-x-3">
                {/* 将来的に他のサブメニューを追加する場合はここに追加 */}
              </ul>
            </nav>
          )}

          {/* Databaseページの場合のみ表示するサブナビゲーション */}
          {isDatabasePage && (
            <nav className="w-full mt-1 bg-[#0a2647]/80 rounded-lg p-1">
              <ul className="flex flex-wrap justify-center space-x-2 md:space-x-3">
                {/* 将来的に他のサブメニューを追加する場合はここに追加 */}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
