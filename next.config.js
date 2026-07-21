const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tonkura.blog",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/images/neurology/:path*",
        destination: "/api/images/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://tonkura.blog; font-src 'self' data:; connect-src 'self' https://va.vercel-insights.com; frame-ancestors 'self'; worker-src 'self' blob:;",
          },
        ],
      },
    ];
  },
};

const { withSentryConfig } = require("@sentry/nextjs");

// org / project / authToken はハードコードせず環境変数から読む
// （SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN）。
// ソースマップの実アップロードは authToken がある環境（Vercel のビルド）でのみ走る。
module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), {
  // ソースマップのアップロードログは CI のときだけ出す
  silent: !process.env.CI,

  // 読めるスタックトレースのために広めにソースマップを上げる
  widenClientFileUpload: true,

  // ブラウザからの計測リクエストを /monitoring 経由で送り、広告ブロッカーを回避する。
  // これにより送信先が same-origin になるため、next.config.js の CSP
  // （connect-src 'self'）とも整合する。middleware は無いので衝突しない。
  tunnelRoute: "/monitoring",

  // disableLogger / automaticVercelMonitors / reactComponentAnnotation は
  // v10 で webpack.* 配下へ移動し、かつ Turbopack（Next 16 の既定）では非対応。
  // 指定しても効かず警告を出すだけなので付けない。
});
