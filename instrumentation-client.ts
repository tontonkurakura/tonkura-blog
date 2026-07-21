// クライアント側の Sentry 初期化。ブラウザでページが読まれるたびに使われる。
// @sentry/nextjs v9 以降の規約に従い、ファイル名は instrumentation-client.ts。
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  debug: process.env.NODE_ENV === "development",
  environment: process.env.NODE_ENV,

  // 本番ではトレースを間引く
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session Replay（DOM 録画）は意図的に無効のままにしている。
  // 有効化するには replayIntegration() を integrations に足す必要があるが、
  // 臨床系サイトで来訪者の画面を録画する必然性がなく、プライバシー面でも避ける。

  sendDefaultPii: false,
});

// App Router のナビゲーション計測（v9 以降で必要）
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
