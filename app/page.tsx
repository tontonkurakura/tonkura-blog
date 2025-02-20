import Image from "next/image";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Welcome to TonKurA</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          医学、脳画像解析、プログラミング、写真など、様々な分野での学びや発見を共有するブログです。
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Latest Articles</h3>
          <ul className="space-y-2">
            <li className="hover:text-blue-600">
              <a href="/blog/neurology">神経変性疾患について</a>
            </li>
            <li className="hover:text-blue-600">
              <a href="/blog/programming">プログラミング学習記録</a>
            </li>
          </ul>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Featured Photos</h3>
          <div className="grid grid-cols-2 gap-4">
            {/* 写真のプレビューを追加予定 */}
          </div>
        </div>
      </section>
    </div>
  );
}
