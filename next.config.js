/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30日間のキャッシュ
  },
  // 処理済み画像を永続化するための設定
  async headers() {
    return [
      {
        source: '/processed-images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000, stale-while-revalidate=31536000',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 