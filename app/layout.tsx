import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import "highlight.js/styles/github-dark.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TonKurA",
  description:
    "Personal blog about medical science, brain imaging, programming, and photography",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <body
        className={`${inter.className} bg-white`}
        suppressHydrationWarning={true}
      >
        <header className="bg-[#0a2647] text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold mb-4 tracking-wide">TonKurA</h1>
              <nav className="mt-2">
                <ul className="flex space-x-8">
                  <li>
                    <Link
                      href="/"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-blue-800 to-indigo-800 hover:shadow-inner text-lg font-bold"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/blog"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-indigo-800 to-purple-800 hover:shadow-inner text-lg font-bold"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/neurology"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-fuchsia-800 to-red-800 hover:shadow-inner text-lg font-bold"
                    >
                      Neurology
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tools"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-rose-800 to-pink-800 hover:shadow-inner text-lg font-bold"
                    >
                      Tools
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/photographs"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-pink-800/80 to-orange-800/80 hover:shadow-inner text-lg font-bold"
                    >
                      Photographs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/recipes"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-orange-800 to-yellow-800 hover:shadow-inner text-lg font-bold"
                    >
                      Recipes
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto pt-12">{children}</main>
      </body>
    </html>
  );
}
