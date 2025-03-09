import Link from "next/link";
import { getMarkdownContent } from "@/app/lib/markdown";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    category: string;
    id: string;
  };
}

export default async function SymptomPage({ params }: PageProps) {
  const content = await getMarkdownContent(params.category, params.id);

  if (!content) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/database/higher-brain-function"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          高次脳機能データベースに戻る
        </Link>
      </div>

      <article className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-8">{content.title}</h1>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                このデータベースは現在開発段階です。内容は随時更新・修正されます。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-8">
          <h2 className="text-lg font-semibold mb-2">関連情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700">関連領域</h3>
              <ul className="list-disc list-inside">
                {content.relatedAreas.map((area, index) => (
                  <li key={index} className="text-gray-600">
                    {area}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">関連検査</h3>
              <ul className="list-disc list-inside">
                {content.relatedExams.map((exam, index) => (
                  <li key={index} className="text-gray-600">
                    {exam}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            最終更新: {content.lastmod}
          </div>
        </div>

        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
      </article>
    </div>
  );
}
