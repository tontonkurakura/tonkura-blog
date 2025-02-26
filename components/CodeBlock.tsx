"use client";

import CopyButton from "./CopyButton";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
}

export default function CodeBlock({
  children,
  className,
  language,
}: CodeBlockProps) {
  // コードの内容を取得
  const code = children?.toString() || "";

  // クラス名から言語を抽出（className="language-javascript"のような形式）
  const extractedLanguage = language || className?.split("-")[1] || "";

  return (
    <div className="relative group">
      {extractedLanguage && (
        <div className="absolute top-0 left-0 px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-tr-none rounded-tl-md rounded-br-none rounded-bl-none">
          {extractedLanguage}
        </div>
      )}
      <pre
        className={`${className} font-mono text-sm mt-6 p-4 overflow-x-auto rounded-md bg-gray-50 border border-gray-200`}
        data-language={extractedLanguage}
      >
        <CopyButton code={code} />
        {children}
      </pre>
    </div>
  );
}
