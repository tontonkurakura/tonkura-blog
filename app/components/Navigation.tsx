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

  return (
    <header className="bg-[#0a2647] text-white py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-wide">
            TonKurA
          </h1>

          {/* ハンバーガーメニューボタン（モバイル用） */}
          <button
            className="md:hidden w-10 h-10 flex flex-col justify-center items-center"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="navigation-menu"
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white my-1 transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>

          {/* ナビゲーションメニュー */}
          <nav
            ref={navRef}
            className={`w-full md:w-auto transition-all duration-300 ${
              isMenuOpen ? "block" : "hidden md:block"
            }`}
            id="navigation-menu"
            aria-label="メインナビゲーション"
          >
            <ul
              className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 py-4 md:py-0"
              role="menubar"
            >
              <li className="w-full md:w-auto text-center" role="none">
                <Link
                  href="/"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-blue-800 to-indigo-800 hover:shadow-inner text-base md:text-lg font-bold"
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
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-indigo-800 to-purple-800 hover:shadow-inner text-base md:text-lg font-bold"
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
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-fuchsia-800 to-red-800 hover:shadow-inner text-base md:text-lg font-bold"
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
                  href="/tools"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-rose-800 to-pink-800 hover:shadow-inner text-base md:text-lg font-bold"
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
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-pink-800/80 to-orange-800/80 hover:shadow-inner text-base md:text-lg font-bold"
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
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-orange-800 to-yellow-800 hover:shadow-inner text-base md:text-lg font-bold"
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
                    className={`block px-4 py-2 rounded-lg transition-all duration-500 hover:bg-gradient-to-r from-yellow-800 to-green-800 hover:shadow-inner text-base md:text-lg font-bold ${
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
          </nav>
        </div>
      </div>
    </header>
  );
}
