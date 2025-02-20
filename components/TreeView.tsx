"use client";

import Link from "next/link";

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  description?: string;
  children?: TreeNode[];
};

type TreeViewProps = {
  node: TreeNode;
  level?: number;
};

type TreeViewItemProps = TreeViewProps & {
  isLast: boolean;
};

// パスを正しくエンコードする関数
function encodePathForId(path: string): string {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

const TreeViewItem = ({ node, level = 0, isLast }: TreeViewItemProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const encodedPath = encodePathForId(node.path);

  // ルートレベルのディレクトリの場合、カードスタイルを適用
  if (level === 0 && node.type === "directory") {
    return (
      <div
        id={encodedPath}
        className="bg-white border border-gray-200 rounded-lg p-6 mb-6 scroll-mt-4"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-2">{node.name}</h2>
        {node.description && (
          <p className="text-gray-600 text-sm mb-4">{node.description}</p>
        )}
        {hasChildren && (
          <div className="space-y-2">
            {node.children.map((child, index) => (
              <TreeViewItem
                key={child.path}
                node={child}
                level={level + 1}
                isLast={index === node.children!.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // その他のアイテムの場合
  return (
    <div className="relative">
      <div className="flex items-center py-1">
        <div className="flex items-center">
          {/* インデントとライン（ルートレベル以外の場合のみ表示） */}
          {level > 1 && (
            <div className="flex">
              {Array.from({ length: level - 2 }).map((_, i) => (
                <div key={i} className="w-4 border-l border-gray-300" />
              ))}
              <div
                className={`w-4 ${!isLast ? "border-l" : ""} border-gray-300`}
              >
                <div className="w-full h-1/2 border-b border-gray-300" />
              </div>
            </div>
          )}

          {/* タイトル */}
          <div className="flex items-center">
            {node.type === "directory" ? (
              <div id={encodedPath} className="scroll-mt-4">
                <span className="ml-1 text-gray-700 font-semibold">
                  {node.name}
                </span>
              </div>
            ) : (
              <Link
                href={`/neurology/view/${encodeURIComponent(
                  node.path.replace(/\.md$/, "")
                )}`}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                {node.name.replace(/\.md$/, "")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 子要素 */}
      {hasChildren && (
        <div className="ml-4">
          {node.children.map((child, index) => (
            <TreeViewItem
              key={child.path}
              node={child}
              level={level + 1}
              isLast={index === node.children!.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function TreeView({ node }: TreeViewProps) {
  // ルートディレクトリの子要素（カテゴリー）を取得
  const categories = node.children || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category, index) => (
        <TreeViewItem
          key={category.path}
          node={category}
          level={0}
          isLast={index === categories.length - 1}
        />
      ))}
    </div>
  );
}
