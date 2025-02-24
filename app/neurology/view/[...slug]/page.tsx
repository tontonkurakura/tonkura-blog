import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

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

    // まず直接のパスを試す
    let filePath = path.join(
      process.cwd(),
      "content/neurology",
      ...decodedSlug
    );

    // 画像ファイルの場合はスキップ
    if (/\.(png|jpe?g|gif|svg|webp)$/i.test(filePath)) {
      return null;
    }

    const mdPath = filePath.endsWith(".md") ? filePath : `${filePath}.md`;

    try {
      const content = await fs.readFile(mdPath, "utf-8");
      return {
        content: processContent(content, decodedSlug),
        section: decodedSlug[0],
      };
    } catch (error) {
      // ファイルが見つからない場合、各セクションディレクトリで検索
      for (const baseDir of basePaths) {
        try {
          // 最後のスラグ部分のみを使用してセクションディレクトリ内を検索
          const sectionPath = path.join(
            process.cwd(),
            "content/neurology",
            baseDir,
            decodedSlug[decodedSlug.length - 1]
          );
          const sectionMdPath = sectionPath.endsWith(".md")
            ? sectionPath
            : `${sectionPath}.md`;

          const content = await fs.readFile(sectionMdPath, "utf-8");
          // 見つかったファイルのパスに基づいて画像パスを調整
          return {
            content: processContent(content, [
              baseDir,
              decodedSlug[decodedSlug.length - 1],
            ]),
            section: baseDir,
          };
        } catch (e) {
          continue;
        }
      }
    }

    throw new Error("File not found in any section directory");
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link href="/neurology" className="text-blue-600 hover:text-blue-800">
          ← Back to Neurology Notes
        </Link>
      </div>

      <Breadcrumbs slug={params.slug} section={result.section} />

      <article className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-8">
          {decodeURIComponent(params.slug[params.slug.length - 1])
            .replace(/\.md$/, "")
            .split(/[\/\\]/)
            .pop()}
        </h1>

        <div className="prose prose-lg max-w-none">
          <MDXRemote source={result.content} />
        </div>
      </article>
    </div>
  );
}
