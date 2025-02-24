/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日間のキャッシュ
  },
  async rewrites() {
    return [
      {
        source: "/images/neurology/:path*",
        destination: "/api/images/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
