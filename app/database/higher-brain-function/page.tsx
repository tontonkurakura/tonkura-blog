"use client";

import Link from "next/link";
import { useState } from "react";

// 症候・疾患のカテゴリー定義
const categories = [
  {
    id: "memory",
    title: "記憶の障害",
    items: [
      { id: "alzheimer-memory", title: "アルツハイマー型認知症による記憶障害" },
      { id: "transient-epileptic-amnesia", title: "一過性てんかん性健忘" },
      { id: "dissociative-amnesia", title: "解離性健忘" },
      { id: "confabulation", title: "作話" },
    ],
  },
  {
    id: "language",
    title: "言語の障害",
    items: [
      { id: "broca-aphasia", title: "運動性失語（Broca失語）" },
      { id: "wernicke-aphasia", title: "感覚性失語（Wernicke失語）" },
      { id: "conduction-aphasia", title: "伝導失語" },
      { id: "transcortical-aphasia", title: "超皮質性失語" },
      { id: "pure-anarthria", title: "純粋語唖" },
      { id: "anomic-aphasia", title: "失名辞失語（健忘失語）" },
      { id: "apraxia-of-speech", title: "発語失行" },
      { id: "alexia-agraphia", title: "失読失書" },
      { id: "pure-agraphia", title: "純粋失書" },
      { id: "pure-alexia", title: "純粋失読" },
      { id: "surface-dyslexia-dysgraphia", title: "表層失読/表層失書" },
      { id: "phonological-dyslexia-dysgraphia", title: "音韻失読/音韻失書" },
      { id: "deep-dyslexia-dysgraphia", title: "深層失読/深層失書" },
    ],
  },
  {
    id: "praxis",
    title: "行為の障害",
    items: [
      { id: "limb-kinetic-apraxia", title: "肢節運動失行" },
      { id: "ideational-apraxia", title: "観念失行" },
      { id: "ideomotor-apraxia", title: "観念運動失行" },
      { id: "constructional-disorder", title: "構成障害" },
      { id: "compulsive-manipulation", title: "強迫的行為" },
      { id: "buccofacial-apraxia", title: "口部顔面失行" },
      { id: "executive-dysfunction", title: "遂行機能障害" },
      { id: "dressing-apraxia", title: "着衣失行" },
      { id: "imitation-behavior", title: "模倣行動" },
    ],
  },
  {
    id: "cognition",
    title: "認知の障害",
    items: [
      { id: "visual-agnosia", title: "視覚性失認" },
      { id: "prosopagnosia", title: "相貌失認" },
      { id: "topographical-disorder", title: "地誌的障害" },
      { id: "unilateral-spatial-neglect", title: "半側空間無視" },
      { id: "balint-syndrome", title: "Balint症候群" },
      { id: "cerebral-achromatopsia", title: "大脳性色覚障害" },
      { id: "asomatognosia", title: "身体失認" },
      { id: "auditory-agnosia", title: "聴覚性失認" },
      { id: "amusia", title: "感覚性失音楽" },
      { id: "anton-syndrome", title: "Anton症候群" },
      { id: "tactile-agnosia", title: "触覚性失認" },
      { id: "acalculia", title: "失計算" },
      { id: "right-left-disorientation", title: "左右盲" },
      { id: "anosognosia", title: "病態失認" },
    ],
  },
  {
    id: "frontal",
    title: "前頭葉の障害",
    items: [
      { id: "motivational-disorder", title: "意欲障害" },
      { id: "emotional-incontinence", title: "感情失禁" },
      { id: "executive-dysfunction-frontal", title: "遂行機能障害" },
      { id: "personality-change", title: "性格変化" },
      { id: "disinhibition", title: "脱抑制" },
      { id: "compulsive-tool-use", title: "道具の強迫的使用" },
      { id: "grasping", title: "把握現象" },
      { id: "perseveration", title: "保続" },
      { id: "antagonistic-apraxia", title: "拮抗失行" },
    ],
  },
  {
    id: "others",
    title: "その他",
    items: [{ id: "callosal-disconnection", title: "脳梁離断症候群" }],
  },
];

export default function HigherBrainFunctionPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // 検索フィルター関数
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/database"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          データベース一覧に戻る
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          高次脳機能データベース
        </h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                このデータベースは現在開発段階です。内容は随時更新・修正されます。
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-600">
          高次脳機能障害の症候・疾患、検査について包括的に学ぶことができます。
        </p>
      </div>

      {/* 検索ボックス */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="症候・疾患名、検査名で検索..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* コンテンツセクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 症候・疾患セクション */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">症候・疾患</h2>
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border-b pb-4 last:border-b-0">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">
                  {category.title}
                </h3>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/database/higher-brain-function/symptoms/${category.id}/${item.id}`}
                      className="block p-2 hover:bg-gray-50 rounded transition-colors text-gray-600 hover:text-gray-900"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 検査セクション */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">検査</h2>
          <div className="space-y-2">
            <Link
              href="/database/higher-brain-function/examinations/wab"
              className="block p-2 hover:bg-gray-50 rounded transition-colors text-gray-600 hover:text-gray-900"
            >
              WAB失語症検査
            </Link>
            {/* 他の検査へのリンクを追加 */}
          </div>
        </div>
      </div>
    </div>
  );
}
