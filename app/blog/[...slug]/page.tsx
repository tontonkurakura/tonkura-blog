import { Metadata } from "next";
import { getPostData } from "@/utils/markdown";
import Script from "next/script";
import Link from "next/link";

interface Props {
  params: { slug: string[] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const routeParams = await params;
  const id = routeParams.slug.join("/");
  const post = await getPostData(id);

  if (!post) {
    return {
      title: "記事が見つかりません",
      description: "お探しの記事は見つかりませんでした。",
    };
  }

  return {
    title: post.title,
    description: post.description || "",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const routeParams = await params;
  const id = routeParams.slug.join("/");
  const post = await getPostData(id);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-3xl font-bold mb-4">記事が見つかりません</h1>
        <p className="mb-6">お探しの記事は見つかりませんでした。</p>
        <Link
          href="/blog"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          ブログ一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <article className="prose prose-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-mplus">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 mb-8 not-prose">
          {post.date && (
            <p className="text-gray-600 font-mplus">
              投稿日: {new Date(post.date).toLocaleDateString("ja-JP")}
            </p>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div
          className="font-mplus"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
      <Script id="copy-code">{`
        document.addEventListener('click', async (e) => {
          if (e.target.closest('.copy-button')) {
            const button = e.target.closest('.copy-button');
            const code = button.getAttribute('data-code');
            try {
              await navigator.clipboard.writeText(code);
              const originalSvg = button.innerHTML;
              button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>';
              setTimeout(() => {
                button.innerHTML = originalSvg;
              }, 1500);
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          }
        });
      `}</Script>
    </div>
  );
}
