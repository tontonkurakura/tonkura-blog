import { getDirectoryStructure } from "@/utils/markdown";
import TreeView from "@/components/TreeView";
import path from "path";
import fs from "fs";
import { updateOrderConfig } from "@/utils/orderUtils";

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
async function loadOrderConfig(dirPath: string = ""): Promise<OrderConfig> {
  const configPath = path.join(
    process.cwd(),
    "content",
    "neurology",
    dirPath,
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
async function convertToTreeNode(
  structure: DirectoryStructure,
  currentPath: string = ""
): Promise<TreeNode[]> {
  const entries = Object.entries(structure).filter(
    ([name]) => name !== "order.json" && name !== "assets" // assetsフォルダを除外
  );
  const orderConfig = await loadOrderConfig(currentPath);
  const orderMap = new Map(
    orderConfig.order.map((name: string, index: number) => [name, index])
  );

  // 設定ファイルに基づいて並び替え
  entries.sort(([nameA], [nameB]) => {
    const indexA = orderMap.get(nameA) ?? Infinity;
    const indexB = orderMap.get(nameB) ?? Infinity;
    if (indexA === indexB) {
      // 順序が同じ場合は、フォルダを先に表示
      const isDirectoryA = structure[nameA] !== "file";
      const isDirectoryB = structure[nameB] !== "file";
      if (isDirectoryA !== isDirectoryB) {
        return isDirectoryA ? -1 : 1;
      }
      // それ以外は名前でソート
      return nameA.localeCompare(nameB);
    }
    return indexA - indexB;
  });

  const nodes = await Promise.all(
    entries.map(async ([name, data]) => {
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
          children: await convertToTreeNode(data, nodePath),
        };
      }
    })
  );

  return nodes;
}

export default async function NeurologyContent({
  basePath = "",
}: {
  basePath?: string;
}) {
  const neurologyPath = path.join(process.cwd(), "content", "neurology");
  const structure = await getDirectoryStructure(neurologyPath);

  // 開発環境の場合のみorder.jsonを更新
  if (process.env.NODE_ENV === "development") {
    updateOrderConfig();
  }

  // neurologyディレクトリの内容を取得
  // basePathが指定されている場合、そのパス以下のコンテンツのみを表示
  let filteredContent = structure;
  if (basePath) {
    const pathParts = basePath.split("/");
    let current = structure;
    for (const part of pathParts) {
      if (current[part]) {
        current = current[part] as DirectoryStructure;
      } else {
        current = {};
        break;
      }
    }
    filteredContent = current;
  }

  // ディレクトリ構造を変換（順序設定を適用）
  const structureArray = await convertToTreeNode(filteredContent);

  return (
    <div className="grid grid-cols-1 gap-6">
      {Object.keys(filteredContent).length > 0 ? (
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
