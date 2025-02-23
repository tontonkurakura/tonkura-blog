import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import highlight from "rehype-highlight";
import { visit } from "unist-util-visit";

const contentDirectory = path.join(process.cwd(), "content");
const blogDirectory = path.join(contentDirectory, "blog");
const neurologyDirectory = path.join(contentDirectory, "neurology");

export interface PostData {
  id: string;
  title: string;
  category: string;
  content: string;
  date?: string;
  tags?: string[];
  description?: string;
}

export interface DirectoryStructure {
  [key: string]: DirectoryStructure | "file";
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
  baseDir: string = contentDirectory
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

export async function getPostData(fullPath: string): Promise<PostData> {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkAddLanguageClass)
    .use(remarkRehype)
    .use(highlight)
    .use(rehypeAddLanguage)
    .use(rehypeStringify)
    .process(content);

  const contentHtml = processedContent.toString();

  const category = path.relative(contentDirectory, path.dirname(fullPath));
  const id = path.relative(contentDirectory, fullPath).replace(/\.md$/, "");

  return {
    id,
    title: data.title || path.basename(fullPath, ".md"),
    category,
    content: contentHtml,
    date: data.date,
    tags: data.tags,
    description: data.description,
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

  traverseDirectory(blogDirectory);
  traverseDirectory(neurologyDirectory);
  return Promise.all(posts);
}
