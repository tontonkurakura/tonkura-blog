"use client";

import { useState } from "react";

interface CopyButtonProps {
  code: string;
}

export default function CopyButton({ code }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("コピーに失敗しました:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-0 right-12 px-2 py-1 text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors rounded-bl-lg font-medium tracking-wide"
      aria-label="コードをコピー"
    >
      {copied ? "コピーしました" : "コピー"}
    </button>
  );
}
