import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const contentDirectory = path.join(process.cwd(), "content");

export async function getMarkdownContent(category: string, id: string) {
  const fullPath = path.join(
    contentDirectory,
    "database",
    "higher-brain-function",
    "symptoms",
    category,
    `${id}.md`
  );

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const htmlContent = marked(content, {
      breaks: true,
      gfm: true,
    });

    return {
      title: data.title,
      category: data.category,
      relatedAreas: data.relatedAreas || [],
      relatedExams: data.relatedExams || [],
      lastmod: data.lastmod,
      content: htmlContent,
    };
  } catch (error) {
    console.error("Error reading markdown file:", error);
    return null;
  }
}
