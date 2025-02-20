import path from "path";
import { getPostData } from "@/utils/markdown";

interface BlogPostPageProps {
  params: {
    slug: string[];
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
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
