import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import FrontMatter from "@/components/ui/FrontMatter";

function Breadcrumbs({ slug, section }: { slug: string[]; section: string }) {
  // スラグの各部分をデコード
  const decodedSlug = slug.map((part) => decodeURIComponent(part));

  // セクションディレクトリのリストとタブ名のマッピング
  const sectionDirs = {
    Neuroanatomy: "anatomy",
    Diseases: "disease",
    Symptoms: "symptoms",
    Examination: "tests",
    Treatment: "treatments",
  };

  // パスを構築
  let pathParts = [{ name: "Neurology", href: "/neurology", isLast: false }];

  // 最後のスラグ（ファイル名）を取得
  const fileName = decodedSlug[decodedSlug.length - 1].replace(/\.md$/, "");

  // セクションディレクトリをパスに追加
  pathParts.push({
    name: section,
    href: `/neurology?tab=${sectionDirs[section]}`,
    isLast: false,
  });

  // ファイル名を追加
  pathParts.push({
    name: fileName,
    href: "#",
    isLast: true,
  });

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
  try {
    // スラグの各部分をデコード
    const decodedSlug = slug.map((part) => decodeURIComponent(part));

    // 可能性のあるベースパス
    const basePaths = [
      "Neuroanatomy",
      "Diseases",
      "Symptoms",
      "Examination",
      "Treatment",
    ];

    // まずベースパスとの組み合わせを試す
    for (const baseDir of basePaths) {
      try {
        // ファイル名を取得（最後のスラグ）
        const fileName = decodedSlug[decodedSlug.length - 1];

        // ベースパスとファイル名を組み合わせてパスを構築
        const sectionPath = path.join(
          process.cwd(),
          "content",
          "neurology",
          baseDir,
          fileName
        );

        // .mdの拡張子を追加（もし既に.mdがある場合は追加しない）
        const sectionMdPath = sectionPath.endsWith(".md")
          ? sectionPath
          : `${sectionPath}.md`;

        // ファイルの存在確認
        await fs.access(sectionMdPath);

        // ファイルを読み込む
        const content = await fs.readFile(sectionMdPath, "utf-8");

        // 見つかったファイルのパスに基づいて画像パスを調整
        return {
          content: processContent(content, [baseDir, fileName]),
          section: baseDir,
        };
      } catch (e) {
        continue;
      }
    }

    // 直接のパスを試す（上記で見つからなかった場合）
    const directPath = path.join(
      process.cwd(),
      "content/neurology",
      ...decodedSlug
    );

    // 画像ファイルの場合はスキップ
    if (/\.(png|jpe?g|gif|svg|webp)$/i.test(directPath)) {
      return null;
    }

    const mdPath = directPath.endsWith(".md") ? directPath : `${directPath}.md`;

    try {
      await fs.access(mdPath);
      const content = await fs.readFile(mdPath, "utf-8");
      return {
        content: processContent(content, decodedSlug),
        section: decodedSlug[0],
      };
    } catch (error) {
      console.error(`File not found at path: ${mdPath}`);
      return null;
    }
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return null;
  }
}

// コンテンツの処理を別関数に分離
function processContent(content: string, slugParts: string[]) {
  // slugPartsの最後の要素がファイル名、その前がディレクトリパス
  const currentDir = slugParts.slice(0, -1).join("/");

  return content.replace(
    /!\[([^\]]*)\]\((\.\/)?assets\/([^)]+)\)/g,
    (match, alt, prefix, imagePath) => {
      // 画像の相対パスを構築
      const imageUrl = `/api/images/${currentDir}/assets/${imagePath}`;
      console.log("Image URL:", imageUrl); // デバッグ用
      return `![${alt}](${imageUrl})`;
    }
  );
}

export default async function NeurologyView({
  params,
}: {
  params: { slug: string[] };
}) {
  const result = await getMarkdownContent(params.slug);

  if (!result) {
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

  // gray-matterを使用してフロントマターを抽出
  const { data: frontMatter } = matter(result.content);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/neurology" className="text-blue-600 hover:text-blue-800">
          ← Back to Neurology Notes
        </Link>
      </div>

      <Breadcrumbs slug={params.slug} section={result.section} />

      <article className="bg-white rounded-lg shadow p-6">
        <div className="mb-8 text-right">
          <FrontMatter frontMatter={frontMatter} />
        </div>

        <div className="prose prose-lg max-w-none">
          <MDXRemote source={result.content} />
        </div>
      </article>
    </div>
  );
}
