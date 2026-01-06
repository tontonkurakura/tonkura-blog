import fs from "fs";
import path from "path";
import { getDirectoryStructure } from "./markdown";
import { DirectoryStructure } from "../types/blog";

interface OrderConfig {
  order: string[];
}

// order.jsonのパスを取得
const getOrderConfigPath = (dirPath: string = "") => {
  return path.join(
    process.cwd(),
    "content",
    "neurology",
    dirPath,
    "order.json"
  );
};

// 現在のorder.jsonを読み込む
export const loadOrderConfig = (dirPath: string = ""): OrderConfig => {
  const configPath = getOrderConfigPath(dirPath);
  let config: OrderConfig = { order: [] };

  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (error) {
    console.error("Error loading order config:", error);
  }

  return config;
};

// ディレクトリ構造から指定階層のアイテムを抽出する（ファイルとフォルダ両方）
const getAllItems = (
  structure: DirectoryStructure,
  currentPath: string = ""
): string[] => {
  const items: string[] = [];

  Object.entries(structure).forEach(([name, value]) => {
    if (name !== "order.json") {
      items.push(name);
    }
  });

  return items;
};

// 指定されたディレクトリ内の項目を取得する
const getDirectoryItems = (
  structure: DirectoryStructure,
  dirPath: string
): string[] => {
  const pathParts = dirPath.split("/").filter(Boolean);
  let currentStructure = structure;

  // 指定されたパスまで移動
  for (const part of pathParts) {
    if (currentStructure[part] && currentStructure[part] !== "file") {
      currentStructure = currentStructure[part] as DirectoryStructure;
    } else {
      return [];
    }
  }

  return getAllItems(currentStructure);
};

// order.jsonを更新する（再帰的）
const updateOrderConfigForDirectory = (
  structure: DirectoryStructure,
  currentPath: string = ""
) => {
  // 現在のディレクトリのorder.jsonを更新
  const currentConfig = loadOrderConfig(currentPath);
  const items = getDirectoryItems(structure, currentPath);
  const currentOrder = new Set(currentConfig.order);
  const newItems: string[] = [];

  // 新しいアイテムを特定
  items.forEach((item) => {
    if (!currentOrder.has(item)) {
      newItems.push(item);
    }
  });

  // 既存の順序を保持しながら、新しいアイテムを末尾に追加
  const updatedOrder = [
    ...currentConfig.order.filter((item) => items.includes(item)),
    ...newItems,
  ];

  // 更新された設定を保存
  if (updatedOrder.length > 0) {
    const configPath = getOrderConfigPath(currentPath);
    fs.writeFileSync(
      configPath,
      JSON.stringify({ order: updatedOrder }, null, 2),
      "utf-8"
    );
  }

  // サブディレクトリに対しても実行
  items.forEach((item) => {
    const newPath = currentPath ? `${currentPath}/${item}` : item;
    if (structure[item] !== "file") {
      updateOrderConfigForDirectory(structure, newPath);
    }
  });

  return updatedOrder;
};

// メインの更新関数
export const updateOrderConfig = async () => {
  const neurologyPath = path.join(process.cwd(), "content", "neurology");
  const structure = await getDirectoryStructure(neurologyPath);
  return updateOrderConfigForDirectory(structure);
};
