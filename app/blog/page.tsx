import { getDirectoryStructure } from "@/utils/markdown";
import BlogTree from "@/components/BlogTree";

export default function BlogPage() {
  const structure = getDirectoryStructure();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-mplus">ブログ記事一覧</h1>
      <div className="grid grid-cols-1 gap-6">
        <BlogTree structure={structure} />
      </div>
    </div>
  );
}
