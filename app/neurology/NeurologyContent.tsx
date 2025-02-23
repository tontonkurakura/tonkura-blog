import { getDirectoryStructure } from "@/utils/markdown";
import TreeView from "@/components/TreeView";
import path from "path";
import fs from "fs";

interface OrderConfig {
  order: string[];
}

interface DirectoryStructure {
  [key: string]: DirectoryStructure | "file";
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

// 設定ファイルを読み込む関数
async function loadOrderConfig(): Promise<OrderConfig> {
  const configPath = path.join(
    process.cwd(),
    "content",
    "neurology",
    "order.json"
  );
  let config: OrderConfig = { order: [] };

  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (error) {
    console.error("Error loading order config:", error);
  }

  return config;
}

// ディレクトリ構造を再帰的にTreeNode形式に変換する関数
function convertToTreeNode(
  structure: DirectoryStructure,
  currentPath: string = "",
  orderConfig: OrderConfig | null = null
): TreeNode[] {
  const entries = Object.entries(structure);

  // 設定ファイルに基づいて並び替え
  if (orderConfig && currentPath === "") {
    const orderMap = new Map(
      orderConfig.order.map((name: string, index: number) => [name, index])
    );

    entries.sort(([nameA], [nameB]) => {
      const indexA = orderMap.get(nameA) ?? Infinity;
      const indexB = orderMap.get(nameB) ?? Infinity;
      return indexA - indexB;
    });
  }

  return entries.map(([name, data]) => {
    const nodePath = currentPath ? `${currentPath}/${name}` : name;

    if (data === "file") {
      return {
        name,
        path: nodePath,
        type: "file" as const,
      };
    } else {
      return {
        name,
        path: nodePath,
        type: "directory" as const,
        children: convertToTreeNode(data, nodePath, orderConfig),
      };
    }
  });
}

export default async function NeurologyContent() {
  const structure = await getDirectoryStructure(
    path.join(process.cwd(), "content")
  );
  const orderConfig = await loadOrderConfig();

  // neurologyディレクトリの内容を取得
  const neurologyContent = structure["neurology"] || {};

  // ディレクトリ構造を変換（順序設定を適用）
  const structureArray = convertToTreeNode(neurologyContent, "", orderConfig);

  return (
    <div className="grid grid-cols-1 gap-6">
      {Object.keys(neurologyContent).length > 0 ? (
        <TreeView
          node={{
            name: "Neurology Notes",
            path: "",
            type: "directory",
            children: structureArray,
          }}
        />
      ) : (
        <p className="text-gray-500">
          コンテンツがまだありません。content/neurologyディレクトリにマークダウンファイルを追加してください。
        </p>
      )}
    </div>
  );
}
