"use client";

import { useState } from "react";
import Link from "next/link";
import { FaChevronRight, FaChevronDown, FaFile } from "react-icons/fa";

interface TreeNodeProps {
  name: string;
  structure: any;
  path: string[];
}

const TreeNode: React.FC<TreeNodeProps> = ({ name, structure, path }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFile = structure === "file";
  const currentPath = [...path, name];

  if (isFile) {
    return (
      <div className="ml-6 py-1 flex items-center">
        <FaFile className="text-gray-500 mr-2" size={14} />
        <Link
          href={`/blog/${currentPath.join("/")}`}
          className="text-gray-700 hover:text-blue-600 font-mplus"
        >
          {name.replace(".md", "")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center py-1 w-full text-left hover:bg-gray-100 rounded px-2"
      >
        {isExpanded ? (
          <FaChevronDown className="text-gray-500 mr-2" size={14} />
        ) : (
          <FaChevronRight className="text-gray-500 mr-2" size={14} />
        )}
        <span className="font-mplus text-gray-800">{name}</span>
      </button>
      {isExpanded && (
        <div className="ml-4">
          {Object.entries(structure).map(([childName, childStructure]) => (
            <TreeNode
              key={childName}
              name={childName}
              structure={childStructure}
              path={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function BlogTree({ structure }: { structure: any }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      {Object.entries(structure).map(([name, subStructure]) => (
        <TreeNode key={name} name={name} structure={subStructure} path={[]} />
      ))}
    </div>
  );
}
