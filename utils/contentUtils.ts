import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getDirectoryStructure } from "./markdown";
import { getPhotos } from "./photoUtils";

interface ContentItem {
  title: string;
  date: string;
  path: string;
  type: "blog" | "neurology" | "photo";
}

export async function getLatestContent(
  limit: number = 3
): Promise<ContentItem[]> {
  const allContent: ContentItem[] = [];

  // ブログ記事を取得
  const blogStructure = getDirectoryStructure();
  const blogPosts = getAllMarkdownFiles(
    path.join(process.cwd(), "content"),
    []
  );
  const blogContent = await Promise.all(
    blogPosts.map(async (filePath) => {
      const content = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(content);
      return {
        title: data.title || path.basename(filePath, ".md"),
        date: data.date || new Date().toISOString(),
        path:
          "/blog/" +
          path
            .relative(path.join(process.cwd(), "content"), filePath)
            .replace(/\.md$/, ""),
        type: "blog" as const,
      };
    })
  );
  allContent.push(...blogContent);

  // Neurology記事を取得
  const neurologyPosts = getAllMarkdownFiles(
    path.join(process.cwd(), "content/neurology"),
    []
  );
  const neurologyContent = await Promise.all(
    neurologyPosts.map(async (filePath) => {
      const content = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(content);
      return {
        title: data.title || path.basename(filePath, ".md"),
        date: data.date || new Date().toISOString(),
        path:
          "/neurology/view/" +
          path
            .relative(path.join(process.cwd(), "content/neurology"), filePath)
            .replace(/\.md$/, ""),
        type: "neurology" as const,
      };
    })
  );
  allContent.push(...neurologyContent);

  // 写真を取得
  const photos = await getPhotos();
  const photoContent = photos.map((photo) => ({
    title: path.basename(photo.path),
    date: photo.exif.date,
    path: photo.webpPath,
    type: "photo" as const,
  }));
  allContent.push(...photoContent);

  // 日付でソートして最新のものを返す
  return allContent
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

function getAllMarkdownFiles(dir: string, files: string[]): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllMarkdownFiles(fullPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}
