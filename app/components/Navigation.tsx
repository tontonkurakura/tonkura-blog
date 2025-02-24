"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            className={`w-full md:w-auto transition-all duration-300 ${
              isMenuOpen ? "block" : "hidden md:block"
            }`}
          >
            <ul className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 py-4 md:py-0">
              <li className="w-full md:w-auto text-center">
                <Link
                  href="/"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-blue-800 to-indigo-800 hover:shadow-inner text-base md:text-lg font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li className="w-full md:w-auto text-center">
                <Link
                  href="/blog"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-indigo-800 to-purple-800 hover:shadow-inner text-base md:text-lg font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Blog
                </Link>
              </li>
              <li className="w-full md:w-auto text-center">
                <Link
                  href="/neurology"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-fuchsia-800 to-red-800 hover:shadow-inner text-base md:text-lg font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Neurology
                </Link>
              </li>
              <li className="w-full md:w-auto text-center">
                <Link
                  href="/tools"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-rose-800 to-pink-800 hover:shadow-inner text-base md:text-lg font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tools
                </Link>
              </li>
              <li className="w-full md:w-auto text-center">
                <Link
                  href="/photographs"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-pink-800/80 to-orange-800/80 hover:shadow-inner text-base md:text-lg font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Photographs
                </Link>
              </li>
              <li className="w-full md:w-auto text-center">
                <Link
                  href="/recipes"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-orange-800 to-yellow-800 hover:shadow-inner text-base md:text-lg font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Recipes
                </Link>
              </li>
              <li className="w-full md:w-auto text-center">
                <Link
                  href="/daisetsu"
                  className="block px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-yellow-800 to-green-800 hover:shadow-inner text-base md:text-lg font-bold"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Daisetsu
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
