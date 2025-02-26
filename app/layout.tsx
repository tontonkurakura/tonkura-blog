import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import Navigation from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";

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
      <body className={`${inter.className}`} suppressHydrationWarning={true}>
        <Navigation />
        <main className="container mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-16">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
