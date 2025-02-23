"use client";

import CopyButton from "./CopyButton";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
  language?: string;
}

export default function CodeBlock({ children, className, language }: CodeBlockProps) {
  // コードの内容を取得
  const code = children?.toString() || "";
  
  return (
    <pre className={className} data-language={language}>
      <CopyButton code={code} />
      {children}
    </pre>
  );
} 