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
import {
  PostMeta,
  PostData,
  PostListResponse,
  PostListOptions,
  DirectoryStructure,
  OrderConfig,
} from "@/types/blog";

const contentDirectory = path.join(process.cwd(), "content");
const blogDirectory = path.join(contentDirectory, "blog");

// メモリキャッシュの追加
interface MemoryCache {
  postMeta: PostMeta[] | null;
  tagCounts: { [key: string]: number } | null;
  postContent: { [key: string]: PostData } | null;
  lastUpdated: number;
}

// キャッシュの有効期限（5分）
const CACHE_TTL = 5 * 60 * 1000;

// メモリキャッシュの初期化
const memoryCache: MemoryCache = {
  postMeta: null,
  tagCounts: null,
  postContent: null,
  lastUpdated: 0,
};

// 環境に応じてキャッシュディレクトリを設定
const getCacheDir = () => {
  if (process.env.NODE_ENV === "production") {
    return "/tmp/.cache";
  }
  return path.join(process.cwd(), ".cache");
};

const CACHE_FILE = path.join(getCacheDir(), "posts-meta.json");

// メタデータのキャッシュを作成
export async function generatePostMetaCache(): Promise<PostMeta[]> {
  // メモリキャッシュが有効な場合はそれを返す
  const now = Date.now();
  if (memoryCache.postMeta && now - memoryCache.lastUpdated < CACHE_TTL) {
    return memoryCache.postMeta;
  }

  const posts: PostMeta[] = [];

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
  const sortedPosts = posts.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    if (dateA === dateB) {
      return a.title.localeCompare(b.title, "ja");
    }
    return dateB - dateA;
  });

  // メモリキャッシュを更新
  memoryCache.postMeta = sortedPosts;
  memoryCache.lastUpdated = now;

  return sortedPosts;
}

// キャッシュからメタデータを取得（キャッシュがない場合は直接生成）
export async function getPostMetaFromCache(): Promise<PostMeta[]> {
  return generatePostMetaCache();
}

// 一覧表示用の軽量な関数
export async function getPostList(
  page: number = 1,
  limit: number = 10,
  options: PostListOptions = {}
): Promise<PostListResponse> {
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

    const total = filteredPosts.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);

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

// 記事の詳細を取得
export async function getPostData(id: string): Promise<PostData | null> {
  // メモリキャッシュをチェック
  if (
    memoryCache.postContent &&
    memoryCache.postContent[id] &&
    Date.now() - memoryCache.lastUpdated < CACHE_TTL
  ) {
    return memoryCache.postContent[id];
  }

  try {
    const fullPath = path.join(blogDirectory, `${id}.md`);
    const fileContent = await fs.promises.readFile(fullPath, "utf-8");
    const { data, content } = matter(fileContent);

    // Markdownをパース
    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(highlight)
      .use(rehypeStringify)
      .process(content);

    const htmlContent = processedContent.toString();

    // キャッシュを初期化
    if (!memoryCache.postContent) {
      memoryCache.postContent = {};
    }

    const postData: PostData = {
      id,
      title: data.title || path.basename(fullPath, ".md"),
      date: data.date,
      tags: data.tags || [],
      description: data.description || "",
      content: htmlContent,
    };

    // メモリキャッシュに追加
    memoryCache.postContent[id] = postData;

    return postData;
  } catch (error) {
    console.error(`記事の取得に失敗しました: ${id}`, error);
    return null;
  }
}

// タグごとの記事数を取得
export async function getTagCounts(): Promise<{ [key: string]: number }> {
  // メモリキャッシュをチェック
  if (
    memoryCache.tagCounts &&
    Date.now() - memoryCache.lastUpdated < CACHE_TTL
  ) {
    return memoryCache.tagCounts;
  }

  const posts = await getPostMetaFromCache();
  const tagCounts: { [key: string]: number } = {};

  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  // メモリキャッシュに追加
  memoryCache.tagCounts = tagCounts;

  return tagCounts;
}

// ディレクトリ構造を取得
export async function getDirectoryStructure(
  baseDir: string = contentDirectory
): Promise<DirectoryStructure> {
  const structure: DirectoryStructure = {};

  async function traverseDirectory(
    dir: string,
    currentStructure: DirectoryStructure
  ): Promise<void> {
    try {
      const items = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          currentStructure[item.name] = {};
          await traverseDirectory(
            fullPath,
            currentStructure[item.name] as DirectoryStructure
          );
        } else if (
          item.isFile() &&
          (item.name.endsWith(".md") || item.name === "order.json")
        ) {
          currentStructure[item.name] = "file";
        }
      }
    } catch (error) {
      console.error(`ディレクトリの読み込みに失敗しました: ${dir}`, error);
    }
  }

  await traverseDirectory(baseDir, structure);
  return structure;
}

// 記事の並び順設定
export const orderConfig: OrderConfig = {
  defaultOrder: "date-desc",
  options: [
    { value: "date-desc", label: "新しい順" },
    { value: "date-asc", label: "古い順" },
    { value: "title-asc", label: "タイトル昇順" },
    { value: "title-desc", label: "タイトル降順" },
  ],
};

// 記事を並び替える
export function sortPosts(
  posts: PostMeta[],
  order: string = orderConfig.defaultOrder
): PostMeta[] {
  const sortedPosts = [...posts]; // 配列のコピーを作成

  switch (order) {
    case "date-asc":
      return sortedPosts.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
      });
    case "title-asc":
      return sortedPosts.sort((a, b) => a.title.localeCompare(b.title, "ja"));
    case "title-desc":
      return sortedPosts.sort((a, b) => b.title.localeCompare(a.title, "ja"));
    case "date-desc":
    default:
      return sortedPosts.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });
  }
}
