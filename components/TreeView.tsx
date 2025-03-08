"use client";

import Link from "next/link";

export interface TreeNode {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: TreeNode[];
}

interface TreeViewProps {
  node: TreeNode;
  level?: number;
}

function buildPath(parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((part) => encodeURIComponent(part.trim()))
    .join("/");
}

function FileLink({ name, path }: { name: string; path: string[] }) {
  const displayName = name.replace(/\.md$/, "");
  const encodedPath = buildPath(path);

  return (
    <Link
      href={`/neurology/view/${encodedPath}`}
      className="block py-1 px-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded transition-colors"
    >
      <span className="text-sm leading-relaxed truncate block">
        {displayName}
      </span>
    </Link>
  );
}

function FileCard({
  title,
  files,
  subDirectories,
  pathParts = [],
}: {
  title: string;
  files: TreeNode[];
  subDirectories: TreeNode[];
  pathParts?: string[];
}) {
  if (files.length === 0 && subDirectories.length === 0) return null;

  const currentPathParts = [...pathParts, title];

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <h4 className="text-base font-medium text-gray-900 mb-3 pb-2 border-b">
        {title}
      </h4>
      {files.length > 0 && (
        <div className="space-y-0.5 mb-4">
          {files.map((file, index) => (
            <FileLink
              key={index}
              name={file.name}
              path={[...currentPathParts, file.name]}
            />
          ))}
        </div>
      )}
      {subDirectories.length > 0 && (
        <div className="space-y-4 pl-4 border-l-2 border-gray-200">
          {subDirectories.map((dir) => {
            const dirFiles =
              dir.children?.filter((child) => child.type === "file") || [];
            const subDirs =
              dir.children?.filter((child) => child.type === "directory") || [];
            return (
              <FileCard
                key={dir.name}
                title={dir.name}
                files={dirFiles}
                subDirectories={subDirs}
                pathParts={currentPathParts}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function DirectoryContent({ node }: { node: TreeNode }) {
  if (!node.children) return null;

  const files = node.children
    .filter((child) => child.type === "file")
    .sort((a, b) => a.name.localeCompare(b.name));

  const directories = node.children
    .filter((child) => child.type === "directory")
    .sort((a, b) => a.name.localeCompare(b.name));

  const pathParts = node.name === "root" ? [] : [node.name];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {files.length > 0 && node.name !== "root" && (
          <div className="space-y-0.5">
            {files.map((file, index) => (
              <FileLink
                key={index}
                name={file.name}
                path={[node.name, file.name]}
              />
            ))}
          </div>
        )}
        {directories.map((dir) => {
          const dirFiles =
            dir.children?.filter((child) => child.type === "file") || [];
          const subDirs =
            dir.children?.filter((child) => child.type === "directory") || [];
          return (
            <FileCard
              key={dir.name}
              title={dir.name}
              files={dirFiles}
              subDirectories={subDirs}
              pathParts={pathParts}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function TreeView({ node }: TreeViewProps) {
  if (node.type === "file") {
    return <FileLink name={node.name} path={[node.name]} />;
  }

  return <DirectoryContent node={node} />;
}
