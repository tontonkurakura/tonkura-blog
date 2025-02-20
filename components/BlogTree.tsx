import React from "react";
import Link from "next/link";
import { DirectoryStructure } from "@/utils/markdown";

interface BlogTreeProps {
  structure: DirectoryStructure;
}

export default function BlogTree({ structure }: BlogTreeProps) {
  const renderTree = (node: DirectoryStructure, path: string = "") => {
    return (
      <ul className="space-y-2">
        {Object.entries(node).map(([key, value]) => {
          const currentPath = path ? `${path}/${key}` : key;
          const isFile = typeof value === "string";

          return (
            <li key={currentPath} className="pl-4">
              {isFile ? (
                <Link
                  href={`/blog/${currentPath}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {key}
                </Link>
              ) : (
                <>
                  <span className="font-semibold">{key}</span>
                  {renderTree(value as DirectoryStructure, currentPath)}
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
