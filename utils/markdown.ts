import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import highlight from "rehype-highlight";
import { visit } from "unist-util-visit";
import remarkGfm from "remark-gfm";

const contentDirectory = path.join(process.cwd(), "content");
const blogDirectory = path.join(contentDirectory, "blog");

// 環境に応じてキャッシュディレクトリを設定
const getCacheDir = () => {
  if (process.env.NODE_ENV === "production") {
    return "/tmp/.cache";
  }
  return path.join(process.cwd(), ".cache");
};

const CACHE_FILE = path.join(getCacheDir(), "posts-meta.json");

export interface PostData {
  id: string;
  title: string;
  content: string;
  date?: string;
  tags?: string[];
  description?: string;
}

export interface DirectoryStructure {
  [key: string]: DirectoryStructure | "file";
}

interface PostListItem {
  id: string;
  title: string;
  date?: string;
  tags?: string[];
  description?: string;
}

// コードブロックに言語情報を追加するプラグイン
function rehypeAddLanguage() {
  return (tree: any) => {
    visit(tree, "element", (node) => {
      if (node.tagName === "pre") {
        const [codeEl] = node.children;
        if (codeEl?.tagName === "code") {
          const classes = codeEl.properties.className || [];
          const language = classes
            .find((c: string) => c.startsWith("language-"))
            ?.replace("language-", "");
          if (language) {
            // 言語名を大文字始まりに変換（例：javascript → JavaScript）
            const formattedLanguage =
              language.charAt(0).toUpperCase() + language.slice(1);
            // preタグにクラスを追加
            node.properties.className = [
              ...(node.properties.className || []),
              "relative",
            ];
            node.properties["data-language"] = formattedLanguage;
            // コピーボタンを追加
            node.children = [
              {
                type: "element",
                tagName: "button",
                properties: {
                  className: [
                    "absolute",
                    "top-6",
                    "right-2",
                    "p-2",
                    "text-xs",
                    "text-white",
                    "bg-[#2a2b36]",
                    "hover:bg-[#3a3b46]",
                    "transition-colors",
                    "rounded-lg",
                    "font-mono",
                    "font-medium",
                    "tracking-wide",
                    "copy-button",
                    "flex",
                    "items-center",
                    "justify-center",
                  ],
                  "data-code": codeEl.children[0]?.value || "",
                },
                children: [
                  {
                    type: "element",
                    tagName: "svg",
                    properties: {
                      xmlns: "http://www.w3.org/2000/svg",
                      fill: "none",
                      viewBox: "0 0 24 24",
                      strokeWidth: "1.5",
                      stroke: "currentColor",
                      className: "w-4 h-4",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "path",
                        properties: {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75",
                        },
                      },
                    ],
                  },
                ],
              },
              ...node.children,
            ];
          }
        }
      }
    });
  };
}

// Markdownのコードブロックに言語クラスを追加するプラグイン
function remarkAddLanguageClass() {
  return (tree: any) => {
    visit(tree, "code", (node: any) => {
      if (node.lang) {
        node.data = node.data || {};
        node.data.hProperties = node.data.hProperties || {};
        node.data.hProperties.className = ["hljs", `language-${node.lang}`];
      }
    });
  };
}

export function getDirectoryStructure(
  baseDir: string = blogDirectory
): DirectoryStructure {
  const items = fs.readdirSync(baseDir, { withFileTypes: true });
  const structure: DirectoryStructure = {};

  for (const item of items) {
    const fullPath = path.join(baseDir, item.name);
    if (item.isDirectory()) {
      structure[item.name] = getDirectoryStructure(fullPath);
    } else if (item.isFile() && item.name.endsWith(".md")) {
      structure[item.name] = "file";
    }
  }

  return structure;
}

export async function getPostData(id: string): Promise<PostData> {
  // 検索対象のディレクトリを定義
  const searchDirectories = [
    path.join(contentDirectory, "blog"),
    path.join(contentDirectory, "neurology"),
  ];

  let fullPath = "";
  let fileExists = false;

  // 各ディレクトリで記事を検索
  for (const dir of searchDirectories) {
    // 1. 完全なパスでの検索
    const fullPathWithExt = path.join(dir, `${id}.md`);
    if (fs.existsSync(fullPathWithExt)) {
      fullPath = fullPathWithExt;
      fileExists = true;
      break;
    }

    // 2. パス部分とファイル名を分離
    const pathParts = id.split("/");
    const fileName = pathParts[pathParts.length - 1];

    // 3. ベースディレクトリにパス部分を追加
    const searchPath =
      pathParts.length > 1 ? path.join(dir, ...pathParts.slice(0, -1)) : dir;

    // 4. 指定されたパスが存在する場合、そのディレクトリ内でファイルを検索
    if (fs.existsSync(searchPath)) {
      const items = fs.readdirSync(searchPath, { withFileTypes: true });
      for (const item of items) {
        if (item.isFile()) {
          const itemName = item.name.replace(/\.md$/, "");
          if (itemName === fileName) {
            fullPath = path.join(searchPath, item.name);
            fileExists = true;
            break;
          }
        }
      }
    }

    if (fileExists) break;

    // 5. 完全一致で見つからない場合は、再帰的に検索
    const findFileRecursively = (searchDir: string): string | null => {
      const items = fs.readdirSync(searchDir, { withFileTypes: true });

      for (const item of items) {
        const itemPath = path.join(searchDir, item.name);

        if (item.isDirectory()) {
          const found = findFileRecursively(itemPath);
          if (found) return found;
        } else if (item.isFile()) {
          const itemName = item.name.replace(/\.md$/, "");
          if (itemName === fileName) {
            return itemPath;
          }
        }
      }

      return null;
    };

    const foundPath = findFileRecursively(dir);
    if (foundPath) {
      fullPath = foundPath;
      fileExists = true;
      break;
    }
  }

  if (!fileExists) {
    console.error(`Post not found: ${id}`);
    throw new Error(`Post not found: ${id}`);
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkAddLanguageClass)
    .use(remarkRehype)
    .use(highlight)
    .use(rehypeAddLanguage)
    .use(rehypeStringify)
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    id,
    title: data.title || path.basename(fullPath, ".md"),
    content: contentHtml,
    date: data.date,
    tags: data.tags,
    description: data.description,
  };
}

// サブディレクトリを再帰的に取得する関数
function getAllSubdirectories(dir: string): string[] {
  let results: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      const fullPath = path.join(dir, item.name);
      results.push(fullPath);
      results = results.concat(getAllSubdirectories(fullPath));
    }
  }

  return results;
}

export async function getAllPosts(): Promise<PostData[]> {
  const posts: PostData[] = [];
  const searchDirectories = [
    path.join(contentDirectory, "blog"),
    path.join(contentDirectory, "neurology"),
  ];

  for (const baseDir of searchDirectories) {
    async function traverseDirectory(dir: string) {
      const items = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          await traverseDirectory(fullPath);
        } else if (item.isFile() && item.name.endsWith(".md")) {
          try {
            const relativePath = path
              .relative(contentDirectory, fullPath)
              .replace(/\.md$/, "")
              .replace(/^(blog|neurology)\//, ""); // contentディレクトリからの相対パスを取得
            const post = await getPostData(relativePath);
            posts.push(post);
          } catch (error) {
            console.error(`記事の読み込みに失敗しました: ${fullPath}`, error);
            continue;
          }
        }
      }
    }

    await traverseDirectory(baseDir);
  }

  // 日付でソート（同じ日付の場合はタイトルでソート）
  return posts.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    if (dateA === dateB) {
      return a.title.localeCompare(b.title, "ja");
    }
    return dateB - dateA;
  });
}

// メタデータのキャッシュを作成
export async function generatePostMetaCache(): Promise<PostListItem[]> {
  const posts: PostListItem[] = [];

  // キャッシュディレクトリを作成
  const cacheDir = getCacheDir();
  try {
    await fs.promises.mkdir(cacheDir, { recursive: true });
  } catch (error) {
    console.warn("キャッシュディレクトリの作成に失敗しました:", error);
    // エラーは無視して続行
  }

  async function traverseDirectory(dir: string) {
    const items = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        await traverseDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith(".md")) {
        try {
          const relativePath = path.relative(blogDirectory, fullPath);
          const id = relativePath.replace(/\.md$/, "");
          const fileContent = await fs.promises.readFile(fullPath, "utf-8");
          const { data } = matter(fileContent);

          posts.push({
            id,
            title: data.title || path.basename(fullPath, ".md"),
            date: data.date,
            tags: data.tags,
            description: data.description,
          });
        } catch (error) {
          console.error(
            `記事のメタデータ読み込みに失敗しました: ${fullPath}`,
            error
          );
          continue;
        }
      }
    }
  }

  await traverseDirectory(blogDirectory);

  // 日付でソート
  return posts.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    if (dateA === dateB) {
      return a.title.localeCompare(b.title, "ja");
    }
    return dateB - dateA;
  });
}

// キャッシュからメタデータを取得（キャッシュがない場合は直接生成）
export async function getPostMetaFromCache(): Promise<PostListItem[]> {
  return generatePostMetaCache();
}

// 一覧表示用の軽量な関数
export async function getPostList(
  page: number = 1,
  limit: number = 10,
  options: {
    tag?: string;
    searchQuery?: string;
  } = {}
): Promise<{
  posts: PostListItem[];
  total: number;
  totalPages: number;
}> {
  try {
    const allPosts = await getPostMetaFromCache();
    let filteredPosts = [...allPosts]; // 配列のコピーを作成

    // タグでフィルタリング
    if (options.tag) {
      const searchTag = options.tag; // 型を確定させる
      filteredPosts = filteredPosts.filter((post) =>
        post.tags ? post.tags.includes(searchTag) : false
      );
    }

    // 検索クエリでフィルタリング（タイトル、説明文、タグを含む）
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filteredPosts = filteredPosts.filter((post) => {
        const searchTarget = `${post.title} ${post.description || ""} ${
          post.tags?.join(" ") || ""
        }`.toLowerCase();
        return searchTarget.includes(query);
      });
    }

    // 日付でソート（同じ日付の場合はタイトルでソート）
    const sortedPosts = [...filteredPosts].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateA === dateB) {
        return a.title.localeCompare(b.title, "ja");
      }
      return dateB - dateA;
    });

    const total = sortedPosts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = sortedPosts.slice(startIndex, startIndex + limit);

    return {
      posts: paginatedPosts,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("記事一覧の取得に失敗しました:", error);
    throw error;
  }
}

// タグの集計用関数
export async function getTagCounts(): Promise<{ [key: string]: number }> {
  try {
    const allPosts = await getPostMetaFromCache();
    const tagCounts: { [key: string]: number } = {};

    allPosts.forEach((post) => {
      post.tags?.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return tagCounts;
  } catch (error) {
    console.error("タグの集計に失敗しました:", error);
    throw error;
  }
}
