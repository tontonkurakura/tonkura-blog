import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const contentDirectory = path.join(process.cwd(), "content");

export interface PostData {
  id: string;
  title: string;
  category: string;
  content: string;
  date?: string;
}

export function getDirectoryStructure(dir = contentDirectory): any {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const structure: { [key: string]: any } = {};

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      structure[item.name] = getDirectoryStructure(fullPath);
    } else if (item.isFile() && item.name.endsWith(".md")) {
      structure[item.name] = "file";
    }
  }

  return structure;
}

export async function getPostData(fullPath: string): Promise<PostData> {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  const category = path.relative(contentDirectory, path.dirname(fullPath));
  const id = path.relative(contentDirectory, fullPath).replace(/\.md$/, "");

  return {
    id,
    title: data.title || path.basename(fullPath, ".md"),
    category,
    content: contentHtml,
    date: data.date,
  };
}

export async function getAllPosts(): Promise<PostData[]> {
  const posts: PostData[] = [];

  function traverseDirectory(dir: string) {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (item.isFile() && item.name.endsWith(".md")) {
        posts.push(getPostData(fullPath));
      }
    }
  }

  traverseDirectory(contentDirectory);
  return Promise.all(posts);
}
