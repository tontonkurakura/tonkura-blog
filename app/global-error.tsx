"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    // エラーをSentryに送信
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1>エラーが発生しました</h1>
          <p>申し訳ありませんが、問題が発生しました。</p>
          <p>エラー: {error.message}</p>
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            ホームに戻る
          </button>
        </div>
      </body>
    </html>
  );
}
