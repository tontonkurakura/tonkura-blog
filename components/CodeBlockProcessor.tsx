"use client";

import { useEffect } from "react";

export default function CodeBlockProcessor() {
  useEffect(() => {
    // コードブロックを処理
    document.querySelectorAll("pre").forEach((pre) => {
      // 言語情報を取得
      const code = pre.querySelector("code");
      if (!code) return;
      if (!pre.parentNode) return;

      // 言語クラスを取得 (例: language-javascript)
      const languageClass = Array.from(code.classList).find((cls) =>
        cls.startsWith("language-")
      );
      const language = languageClass
        ? languageClass.replace("language-", "")
        : "";

      // コードブロックをラップするdivを作成
      const wrapper = document.createElement("div");
      wrapper.className = "relative group";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // 言語表示を追加（右上に配置、常に表示）
      if (language) {
        const langDisplay = document.createElement("div");
        langDisplay.className =
          "absolute top-0 right-0 px-3 py-1.5 text-xs font-semibold text-gray-100 bg-gray-700 rounded-bl-md rounded-br-md";
        langDisplay.textContent = language;
        wrapper.appendChild(langDisplay);
      }

      // コピーボタンを追加（言語名の下に配置、常に表示）
      const codeText = code.textContent || "";
      const copyButton = document.createElement("button");
      copyButton.className =
        "absolute top-8 right-2 p-1.5 text-gray-300 hover:text-gray-100 transition-colors";
      copyButton.setAttribute("aria-label", "コードをコピー");
      copyButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';

      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codeText);
          const originalHTML = copyButton.innerHTML;
          copyButton.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
          setTimeout(() => {
            copyButton.innerHTML = originalHTML;
          }, 2000);
        } catch (err) {
          console.error("コピーに失敗しました:", err);
        }
      });

      wrapper.appendChild(copyButton);
    });
  }, []); // 空の依存配列で一度だけ実行

  return null; // このコンポーネントはUIをレンダリングしない
}
