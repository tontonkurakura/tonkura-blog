import { Metadata } from "next";
import path from "path";
import { getPostData } from "@/utils/markdown";

interface Props {
  params: { slug: string[] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const fullPath = path.join(process.cwd(), "content", ...params.slug) + ".md";
  const post = await getPostData(fullPath);

  return {
    title: post.title,
    description: post.description || "",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const fullPath = path.join(process.cwd(), "content", ...params.slug) + ".md";
  const post = await getPostData(fullPath);

  return (
    <div className="max-w-4xl mx-auto">
      <article className="prose prose-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-mplus">{post.title}</h1>
        {post.date && (
          <p className="text-gray-600 mb-8 font-mplus">
            投稿日: {new Date(post.date).toLocaleDateString("ja-JP")}
          </p>
        )}
        <div
          className="font-mplus"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
