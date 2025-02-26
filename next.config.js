/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  serverRuntimeConfig: {
    // サーバーサイドでのみ利用可能な設定
    projectRoot: process.cwd(),
    cacheDir: "/tmp/.cache", // 一時ディレクトリを使用
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tonkura.blog",
      },
    ],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
  },
  // Next.js 15でのMDXサポート
  experimental: {
    mdxRs: true,
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
            value: "DENY",
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
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://tonkura.blog; font-src 'self' data:; connect-src 'self' https://va.vercel-insights.com; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
