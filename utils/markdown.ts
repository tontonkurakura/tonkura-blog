import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import highlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { unstable_cache } from "next/cache";
import {
  PostMeta,
  PostData,
  PostListResponse,
  PostListOptions,
  DirectoryStructure,
  OrderConfig,
} from "../types/blog";

const contentDirectory = path.join(process.cwd(), "content");
const blogDirectory = path.join(contentDirectory, "blog");

// 内部関数: 全記事のメタデータを取得（キャッシュなし）
async function fetchPostMeta(): Promise<PostMeta[]> {
  const posts: PostMeta[] = [];

  async function traverseDirectory(dir: string) {
    // fs.promisesを使用してディレクトリを読み込む
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

// キャッシュの設定
// メタデータは頻繁には変わらないが、新しい記事を追加したときに反映させたい
// revalidate: 3600 (1時間) またはオンデマンドでの更新を想定
export const getPostMetaFromCache = unstable_cache(
  async () => fetchPostMeta(),
  ["posts-meta"],
  { tags: ["posts"], revalidate: 3600 }
);

// 互換性のためのエイリアス
export const generatePostMetaCache = getPostMetaFromCache;

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
      const searchTag = options.tag;
      filteredPosts = filteredPosts.filter((post) =>
        post.tags ? post.tags.includes(searchTag) : false
      );
    }

    // 検索クエリでフィルタリング
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      filteredPosts = filteredPosts.filter((post) => {
        const searchTarget = `${post.title} ${post.description || ""} ${post.tags?.join(" ") || ""
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

// 内部関数: 記事詳細を取得（キャッシュなし）
async function fetchPostData(id: string): Promise<PostData | null> {
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

    return {
      id,
      title: data.title || path.basename(fullPath, ".md"),
      date: data.date,
      tags: data.tags || [],
      description: data.description || "",
      content: htmlContent,
    };
  } catch (error) {
    console.error(`記事の取得に失敗しました: ${id}`, error);
    return null;
  }
}

// 記事の詳細を取得（キャッシュ付き）
export const getPostData = unstable_cache(
  async (id: string) => fetchPostData(id),
  ["post-data"],
  { tags: ["posts"], revalidate: 3600 }
);

// タグごとの記事数を取得
export async function getTagCounts(): Promise<{ [key: string]: number }> {
  const posts = await getPostMetaFromCache();
  const tagCounts: { [key: string]: number } = {};

  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  return tagCounts;
}

// ディレクトリ構造を取得
// 頻繁に変更されないためキャッシュ可能ですが、ファイルシステム走査が含まれるため
// unstable_cacheでラップするのも有効です。ここでは一旦そのままにします。
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
