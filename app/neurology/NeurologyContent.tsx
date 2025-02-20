import { getDirectoryStructure } from "@/utils/markdown";
import TreeView from "@/components/TreeView";
import path from "path";
import fs from "fs";

interface OrderConfig {
  order: string[];
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

// 設定ファイルを更新する関数
async function updateOrderConfig(
  structure: any,
  config: OrderConfig
): Promise<OrderConfig> {
  const existingFolders = new Set(config.order);
  const currentFolders = Object.keys(structure);

  // 新しいフォルダを検出して追加
  for (const folder of currentFolders) {
    if (!existingFolders.has(folder)) {
      config.order.push(folder);
    }
  }

  // 存在しないフォルダを削除
  config.order = config.order.filter((folder) =>
    currentFolders.includes(folder)
  );

  // 設定を保存
  try {
    const configPath = path.join(
      process.cwd(),
      "content",
      "neurology",
      "order.json"
    );
    fs.writeFileSync(
      configPath,
      JSON.stringify({ order: config.order }, null, 2)
    );
  } catch (error) {
    console.error("Error saving order config:", error);
  }

  return config;
}

// ディレクトリ構造を再帰的にTreeNode形式に変換する関数
function convertToTreeNode(
  structure: any,
  currentPath: string = "",
  orderConfig: OrderConfig | null = null
): {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: Array<any>;
}[] {
  let entries = Object.entries(structure);

  // 設定ファイルに基づいて並び替え
  if (orderConfig && currentPath === "") {
    const orderMap = new Map(
      orderConfig.order.map((name: string, index: number) => [name, index])
    );

    entries.sort(([nameA], [nameB]) => {
      const orderA = orderMap.has(nameA) ? orderMap.get(nameA) : Infinity;
      const orderB = orderMap.has(nameB) ? orderMap.get(nameB) : Infinity;
      return (orderA as number) - (orderB as number);
    });
  }

  return entries.map(([name, data]) => {
    const nodePath = currentPath ? `${currentPath}/${name}` : name;

    if (data === "file") {
      return {
        name,
        path: nodePath,
        type: "file",
      };
    } else {
      return {
        name,
        path: nodePath,
        type: "directory",
        children: convertToTreeNode(data, nodePath, orderConfig),
      };
    }
  });
}

export default async function NeurologyContent() {
  const structure = await getDirectoryStructure();
  let orderConfig = await loadOrderConfig();

  // neurologyディレクトリの内容を取得
  const neurologyContent = structure["neurology"] || {};

  // 設定ファイルを更新
  orderConfig = await updateOrderConfig(neurologyContent, orderConfig);

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
