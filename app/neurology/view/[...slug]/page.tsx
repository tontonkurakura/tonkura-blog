import { promises as fs } from "fs";
import path from "path";
// 未使用のimportをコメントアウト
// import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
// import { serialize } from "next-mdx-remote/serialize";
// import rehypeSanitize from "rehype-sanitize";
import Link from "next/link";
import FrontMatter from "@/components/ui/FrontMatter";

function Breadcrumbs({ slug, section }: { slug: string[]; section: string }) {
  // スラグの各部分をデコード
  const decodedSlug = slug.map((part) => decodeURIComponent(part));

  // セクションディレクトリのリストとタブ名のマッピング
  const sectionDirs: { [key: string]: string } = {
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
    href: `/neurology?tab=${sectionDirs[section] || "anatomy"}`,
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
    // スラグの各部分を個別にデコード（スペースを除去）
    const decodedSlug = slug.map((part) => decodeURIComponent(part).trim());

    // 主要セクションのリスト
    const mainSections = [
      "Neuroanatomy",
      "Diseases",
      "Symptoms",
      "Examination",
      "Treatment",
    ];

    // パスの構築と探索
    let mdPath = null;
    let section = decodedSlug[0];

    // Differentialsの特別処理
    if (section === "Differentials") {
      const diseasePath = path.join(
        process.cwd(),
        "content",
        "neurology",
        "Diseases",
        "Differentials",
        ...decodedSlug.slice(1)
      );
      const diseasePathWithExt = diseasePath.endsWith(".md")
        ? diseasePath
        : `${diseasePath}.md`;

      try {
        await fs.access(diseasePathWithExt);
        mdPath = diseasePathWithExt;
        section = "Diseases"; // セクションをDiseasesに設定
      } catch {
        // Differentialsで見つからない場合は続行
      }
    }

    // 通常のパス構築
    if (!mdPath) {
      // セクション名が含まれていない場合、または無効なセクション名の場合
      if (!mainSections.includes(section)) {
        // 各セクションで探索
        for (const mainSection of mainSections) {
          const testPath = path.join(
            process.cwd(),
            "content",
            "neurology",
            mainSection,
            ...decodedSlug
          );
          const testPathWithExt = testPath.endsWith(".md")
            ? testPath
            : `${testPath}.md`;

          try {
            await fs.access(testPathWithExt);
            mdPath = testPathWithExt;
            section = mainSection;
            break;
          } catch {
            // このセクションでは見つからなかった場合は続行
            continue;
          }
        }
      } else {
        // 正しいセクション名が含まれている場合
        const normalPath = path.join(
          process.cwd(),
          "content",
          "neurology",
          ...decodedSlug
        );
        const normalPathWithExt = normalPath.endsWith(".md")
          ? normalPath
          : `${normalPath}.md`;

        try {
          await fs.access(normalPathWithExt);
          mdPath = normalPathWithExt;
        } catch {
          // 見つからない場合は続行
        }
      }
    }

    // ファイルが見つからなかった場合
    if (!mdPath) {
      return {
        content: "# Not Found\n\nThe requested content could not be found.",
        section: "Unknown",
        metadata: {},
      };
    }

    // ファイルの読み込み
    const fileContent = await fs.readFile(mdPath, "utf8");

    // 正規表現でフロントマターを抽出
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = fileContent.match(frontMatterRegex);

    let metadata = {};
    let content = fileContent;

    if (match) {
      // フロントマターをパース
      const frontMatterText = match[1];
      const frontMatterLines = frontMatterText.split("\n");

      // 簡易的なYAMLパーサー
      frontMatterLines.forEach((line) => {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length > 0) {
          const value = valueParts.join(":").trim();
          metadata = { ...metadata, [key.trim()]: value };
        }
      });

      // フロントマターを除去したコンテンツ
      content = fileContent.replace(match[0], "").trim();
    }

    return { content, section, metadata };
  } catch {
    return {
      content: "# Error\n\nAn error occurred while loading the content.",
      section: "Error",
      metadata: {},
    };
  }
}

export default async function NeurologyView({
  params,
}: {
  params: { slug: string[] };
}) {
  // paramsをawaitする
  const routeParams = await params;
  const result = await getMarkdownContent(routeParams.slug);

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

      <Breadcrumbs slug={routeParams.slug} section={result.section} />

      <article className="bg-white rounded-lg shadow p-6">
        <div className="mb-8 text-right">
          <FrontMatter frontMatter={result.metadata} />
        </div>

        <div className="prose prose-lg max-w-none">
          <MDXRemote source={result.content} components={{}} />
        </div>
      </article>
    </div>
  );
}
