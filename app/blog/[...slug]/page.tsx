import { Metadata } from "next";
import { getPostData } from "@/utils/markdown";
import Link from "next/link";
import CodeBlockProcessor from "@/components/CodeBlockProcessor";

type PageParams = {
  slug: string[];
};

type Props = {
  params: PageParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = params.slug.join("/");
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
  const id = params.slug.join("/");
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
      <CodeBlockProcessor />
    </div>
  );
}
