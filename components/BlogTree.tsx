import React from "react";
import Link from "next/link";
import { DirectoryStructure } from "@/types/blog";

interface BlogTreeProps {
  structure: DirectoryStructure;
}

export default function BlogTree({ structure }: BlogTreeProps) {
  const renderTree = (node: DirectoryStructure, path: string = "") => {
    return (
      <ul className="space-y-2">
        {node.children.map((item) => {
          const currentPath = path ? `${path}/${item.name}` : item.name;
          const isFile = item.type === "file";

          return (
            <li key={currentPath} className="pl-4">
              {isFile ? (
                <Link
                  href={`/blog/${currentPath}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {item.name}
                </Link>
              ) : (
                <>
                  <span className="font-semibold">{item.name}</span>
                  {item.children && renderTree(item, currentPath)}
                </>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {renderTree(structure)}
    </div>
  );
}
