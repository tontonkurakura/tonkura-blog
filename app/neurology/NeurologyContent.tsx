"use client";

import TreeView from "@/components/TreeView";
import { useEffect, useState } from "react";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

export default function NeurologyContent({
  basePath = "",
}: {
  basePath?: string;
}) {
  const [structureArray, setStructureArray] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContent() {
      try {
        // APIエンドポイントからディレクトリ構造を取得
        const response = await fetch(
          `/api/neurology-structure?basePath=${encodeURIComponent(basePath)}`
        );
        const data = await response.json();
        setStructureArray(data.structure);
      } catch (error) {
        console.error("Error loading neurology content:", error);
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [basePath]);

  if (loading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {structureArray.length > 0 ? (
        <TreeView
          node={{
            name: basePath || "Neurology Notes",
            path: "",
            type: "directory",
            children: structureArray,
          }}
        />
      ) : (
        <p className="text-gray-500">
          コンテンツがまだありません。content/neurology/{basePath}
          ディレクトリにマークダウンファイルを追加してください。
        </p>
      )}
    </div>
  );
}
