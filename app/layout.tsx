import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import Navigation from "./components/Navigation";

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
        className={`${inter.className} bg-white dark:bg-gray-900`}
        suppressHydrationWarning={true}
      >
        <Navigation />
        <main className="container mx-auto px-4 md:px-6 pt-8 md:pt-12">
          {children}
        </main>
      </body>
    </html>
  );
}
