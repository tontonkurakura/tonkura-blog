"use client";

import React, { useState, useEffect } from "react";
import IgGIndexCalculator from "@/components/tools/IgGIndexCalculator";
import HDSRCalculator from "@/components/tools/HDSRCalculator";

type ToolComponent = React.ComponentType<{}>;

interface Tool {
  id: string;
  name: string;
  description: string;
  component: ToolComponent;
}

const tools: Tool[] = [
  {
    id: "igg-index",
    name: "IgG Index",
    description:
      "髄液/血清IgG比と髄液/血清アルブミン比から血液脳関門機能と髄腔内IgG産生を評価します。",
    component: IgGIndexCalculator,
  },
  {
    id: "hds-r",
    name: "HDS-R",
    description:
      "改訂 長谷川式簡易認知能評価スケール (HDS-R) による認知機能評価を行います。",
    component: HDSRCalculator,
  },
];

export default function ToolsPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // ページ読み込み時に最初のツールを自動選択
  useEffect(() => {
    // 初回レンダリング時のみ実行するため、条件チェックを追加
    if (tools.length > 0 && selectedTool === null) {
      setSelectedTool(tools[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 依存配列を空にして初回レンダリング時のみ実行

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId === selectedTool ? null : toolId);
  };

  // 選択されたツールのコンポーネントを取得
  const selectedToolData = selectedTool
    ? tools.find((tool) => tool.id === selectedTool)
    : null;

  // 選択されたツールのコンポーネントを動的にレンダリング
  const renderSelectedTool = () => {
    if (!selectedToolData) return null;

    if (selectedToolData.id === "igg-index") {
      return <IgGIndexCalculator />;
    } else if (selectedToolData.id === "hds-r") {
      return <HDSRCalculator />;
    }

    return null;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-mplus">Clinical Tools</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* サイドバー */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 sticky top-4">
            <h2 className="text-xl font-bold mb-4 font-mplus">ツール一覧</h2>
            <div className="flex flex-col gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={`p-3 text-left rounded-md transition-colors ${
                    selectedTool === tool.id
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">{tool.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* メインコンテンツエリア */}
        <div className="flex-grow">
          {selectedToolData && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mplus">
                  {selectedToolData.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  {selectedToolData.description}
                </p>
              </div>
              {renderSelectedTool()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
