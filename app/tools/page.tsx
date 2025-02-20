"use client";

import React, { useState } from "react";
import IgGIndexCalculator from "@/components/tools/IgGIndexCalculator";
import HDSRCalculator from "@/components/tools/HDSRCalculator";

const tools = [
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

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId === selectedTool ? null : toolId);
  };

  const SelectedComponent = selectedTool
    ? tools.find((tool) => tool.id === selectedTool)?.component
    : null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-mplus">Clinical Tools</h1>

      {/* ツール一覧のナビゲーション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={`p-4 text-left bg-white rounded-lg border shadow-sm transition-colors ${
              selectedTool === tool.id
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-200 hover:border-blue-500"
            }`}
          >
            <h2 className="text-xl font-bold mb-2 font-mplus">{tool.name}</h2>
            <p className="text-gray-600 text-sm">{tool.description}</p>
          </button>
        ))}
      </div>

      {/* 選択されたツールの表示エリア */}
      <div
        className={`transition-all duration-300 ${
          selectedTool ? "opacity-100" : "opacity-0"
        }`}
      >
        {SelectedComponent && (
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
            {selectedTool && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold font-mplus">
                  {tools.find((tool) => tool.id === selectedTool)?.name}
                </h2>
              </div>
            )}
            <SelectedComponent />
          </div>
        )}
      </div>
    </div>
  );
}
