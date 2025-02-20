import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { M_PLUS_1p } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mplus1p = M_PLUS_1p({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

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
        className={`${geistSans.variable} ${geistMono.variable} ${mplus1p.className} bg-white`}
        suppressHydrationWarning={true}
      >
        <header className="bg-[#0a2647] text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold mb-4 tracking-wide">TonKurA</h1>
              <nav className="mt-2">
                <ul className="flex space-x-8">
                  <li>
                    <a
                      href="/"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-blue-800 to-indigo-800 hover:shadow-inner"
                    >
                      Home
                    </a>
                  </li>
                  <li>
                    <a
                      href="/blog"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-indigo-800 to-purple-800 hover:shadow-inner"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="/neurology"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-fuchsia-800 to-red-800 hover:shadow-inner"
                    >
                      Neurology
                    </a>
                  </li>
                  <li>
                    <a
                      href="/gallery"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-red-800 to-rose-800 hover:shadow-inner"
                    >
                      Gallery
                    </a>
                  </li>
                  <li>
                    <a
                      href="/tools"
                      className="px-4 py-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r from-rose-800 to-pink-800 hover:shadow-inner"
                    >
                      Tools
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
