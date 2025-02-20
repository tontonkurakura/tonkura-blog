import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

function Breadcrumbs({ slug }: { slug: string[] }) {
  // 最後のスラグ（ファイルパス）を取得して分解
  const lastSlug = decodeURIComponent(slug[slug.length - 1])
    .replace(/\.md$/, "")
    .replace(/\\/g, "/");

  // パスを分割して配列にする
  const pathParts = [
    { name: "Neurology", href: "/neurology", isLast: false },
    ...lastSlug.split("/").map((part, index, array) => {
      // 現在のパートまでのパスを結合
      const currentPath = array.slice(0, index + 1).join("/");
      // 日本語を含むパスを正しくエンコード
      const encodedPath = currentPath
        .split("/")
        .map((p) => encodeURIComponent(p))
        .join("/");

      return {
        name: part,
        // 最後の要素以外はホームページの該当セクションへのリンクを設定
        href: index === array.length - 1 ? "#" : `/neurology#${encodedPath}`,
        isLast: index === array.length - 1,
      };
    }),
  ];

  return (
    <nav className="flex mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {pathParts.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-400">/</span>}
            {item.isLast ? (
              <span className="text-gray-600">{item.name}</span>
            ) : (
              <Link
                href={item.href}
                scroll={false}
                className="text-blue-600 hover:text-blue-800"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

async function getMarkdownContent(slug: string[]) {
  const decodedSlug = slug.map((part) =>
    decodeURIComponent(part).replace(/\\/g, "/")
  );
  const filePath =
    path.join(process.cwd(), "content/neurology", ...decodedSlug) + ".md";

  try {
    const content = await fs.readFile(filePath, "utf8");
    const { data, content: markdownContent } = matter(content);
    return { data, content: markdownContent };
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return null;
  }
}

export default async function NeurologyView({
  params,
}: {
  params: { slug: string[] };
}) {
  const post = await getMarkdownContent(params.slug);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <Link href="/neurology" className="text-blue-600 hover:text-blue-800">
            ← Back to Neurology Notes
          </Link>
        </div>
        <h1 className="text-3xl font-bold mb-8">
          ファイルが見つかりませんでした
        </h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/neurology" className="text-blue-600 hover:text-blue-800">
          ← Back to Neurology Notes
        </Link>
      </div>

      <Breadcrumbs slug={params.slug} />

      <article className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-8">
          {decodeURIComponent(params.slug[params.slug.length - 1])
            .replace(/\.md$/, "")
            .split(/[\/\\]/)
            .pop()}
        </h1>

        <div className="prose prose-lg max-w-none">
          <MDXRemote source={post.content} />
        </div>
      </article>
    </div>
  );
}
