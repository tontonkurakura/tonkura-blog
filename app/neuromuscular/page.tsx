"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// 上肢の筋・神経支配データ
const upperLimbData = [
  {
    muscle: "僧帽筋",
    english: "Trapezius",
    nerve: "副神経",
    root: "C2, C3, C4",
  },
  {
    muscle: "胸鎖乳突筋",
    english: "Sternocleidomastoid (SCM)",
    nerve: "副神経",
    root: "C2, C3",
  },
  {
    muscle: "菱形筋",
    english: "Rhomboids",
    nerve: "肩甲背神経",
    root: "C4, C5",
  },
  {
    muscle: "三角筋",
    english: "Deltoid (Del)",
    nerve: "腋窩神経",
    root: "C5, C6",
  },
  {
    muscle: "上腕二頭筋",
    english: "Biceps Brachii (BB)",
    nerve: "筋皮神経",
    root: "C5, C6",
  },
  {
    muscle: "大円筋",
    english: "Teres Major (TM)",
    nerve: "肩甲下神経",
    root: "C5, C6",
  },
  {
    muscle: "大胸筋（鎖骨部）",
    english: "Pectoralis Major (clavicular)",
    nerve: "外側胸筋神経",
    root: "C5, C6",
  },
  {
    muscle: "棘上筋",
    english: "Supraspinatus (SS)",
    nerve: "肩甲上神経",
    root: "C5",
  },
  {
    muscle: "棘下筋",
    english: "Infraspinatus (IS)",
    nerve: "肩甲上神経",
    root: "C5",
  },
  {
    muscle: "前鋸筋",
    english: "Serratus Anterior (SA)",
    nerve: "長胸神経",
    root: "C5, C6, C7",
  },
  {
    muscle: "腕撓骨筋",
    english: "Brachioradialis (BR)",
    nerve: "橈骨神経",
    root: "C6",
  },
  {
    muscle: "長橈側手根屈筋",
    english: "Flexor Carpi Radialis (FCR)",
    nerve: "橈骨神経",
    root: "C6",
  },
  {
    muscle: "長撓側手根伸筋",
    english: "Extensor Carpi Radialis Longus (ECRL)",
    nerve: "橈骨神経",
    root: "C6",
  },
  {
    muscle: "円回内筋",
    english: "Pronator Teres (PT)",
    nerve: "正中神経",
    root: "C6",
  },
  {
    muscle: "前腕回外筋",
    english: "Supinator",
    nerve: "後骨間神経",
    root: "C6",
  },
  {
    muscle: "広背筋",
    english: "Latissimus Dorsi (LD)",
    nerve: "胸背神経",
    root: "C6, C7, C8",
  },
  {
    muscle: "上腕三頭筋",
    english: "Triceps Brachii (TB)",
    nerve: "橈骨神経",
    root: "C7",
  },
  {
    muscle: "総指伸筋",
    english: "Extensor Digitorum Communis (EDC)",
    nerve: "後骨間神経",
    root: "C7",
  },
  {
    muscle: "尺側手根伸筋",
    english: "Extensor Carpi Ulnaris (ECU)",
    nerve: "後骨間神経",
    root: "C7",
  },
  {
    muscle: "大胸筋（胸肋部）",
    english: "Pectoralis Major (sternocostal)",
    nerve: "内側胸筋神経",
    root: "C7, C8, T1",
  },
  {
    muscle: "長母指屈筋",
    english: "Flexor Pollicis Longus (FPL)",
    nerve: "前骨間神経",
    root: "C8",
  },
  {
    muscle: "深指屈筋 I・II",
    english: "Flexor Digitorum Profundus (FDP) I・II",
    nerve: "前骨間神経",
    root: "C8",
  },
  {
    muscle: "深指屈筋 III・IV",
    english: "Flexor Digitorum Profundus (FDP) III・IV",
    nerve: "尺骨神経",
    root: "C8",
  },
  {
    muscle: "他の屈筋群",
    english: "Other flexors",
    nerve: "正中神経",
    root: "C8",
  },
  {
    muscle: "浅指屈筋",
    english: "Flexor Digitorum Superficialis (FDS)",
    nerve: "正中神経",
    root: "C8",
  },
  {
    muscle: "尺側手根屈筋",
    english: "Flexor Carpi Ulnaris (FCU)",
    nerve: "尺骨神経",
    root: "C8",
  },
  {
    muscle: "第一背側骨間筋",
    english: "First Dorsal Interosseous (FDI)",
    nerve: "尺骨神経",
    root: "T1",
  },
  {
    muscle: "短母指外転筋",
    english: "Abductor Pollicis Brevis (APB)",
    nerve: "正中神経",
    root: "T1",
  },
  {
    muscle: "母指対立筋",
    english: "Opponens Pollicis (OP)",
    nerve: "正中神経",
    root: "T1",
  },
  {
    muscle: "小指外転筋",
    english: "Abductor Digiti Minimi (ADM)",
    nerve: "尺骨神経",
    root: "T1",
  },
];

// 下肢の筋・神経支配データ
const lowerLimbData = [
  {
    muscle: "腸腰筋",
    english: "Iliopsoas (IP)",
    nerve: "大腿神経, 脊髄神経",
    root: "L1, L2, L3",
  },
  {
    muscle: "大腿四頭筋",
    english: "Quadriceps Femoris (QF)",
    nerve: "大腿神経",
    root: "L2, L3, L4",
  },
  {
    muscle: "内転筋群",
    english: "Adductors",
    nerve: "閉鎖神経",
    root: "L2, L3, L4",
  },
  {
    muscle: "前脛骨筋",
    english: "Tibialis Anterior (TA)",
    nerve: "深腓骨神経",
    root: "L4, L5",
  },
  {
    muscle: "後脛骨筋",
    english: "Tibialis Posterior (TP)",
    nerve: "脛骨神経",
    root: "L4, L5",
  },
  {
    muscle: "中殿筋／小殿筋",
    english: "Gluteus Medius/Minimus (Gmed/Gmin)",
    nerve: "上臀神経",
    root: "L4, L5, S1",
  },
  {
    muscle: "長趾伸筋",
    english: "Extensor Digitorum Longus (EDL)",
    nerve: "深腓骨神経",
    root: "L5, S1",
  },
  {
    muscle: "短趾伸筋",
    english: "Extensor Digitorum Brevis (EDB)",
    nerve: "深腓骨神経",
    root: "L5, S1",
  },
  {
    muscle: "長母趾伸筋",
    english: "Extensor Hallucis Longus (EHL)",
    nerve: "深腓骨神経",
    root: "L5, S1",
  },
  {
    muscle: "長腓骨筋・短腓骨筋",
    english: "Peroneus Longus (PL), Peroneus Brevis (PB)",
    nerve: "浅腓骨神経",
    root: "L5, S1",
  },
  {
    muscle: "大殿筋",
    english: "Gluteus Maximus (Gmax)",
    nerve: "下殿神経",
    root: "L5, S1, S2",
  },
  {
    muscle: "ハムストリングス",
    english: "Hamstrings (Ham)",
    nerve: "坐骨神経",
    root: "L5, S1, S2",
  },
  {
    muscle: "長趾屈筋・長母趾屈筋",
    english: "Flexor Digitorum Longus (FDL), Flexor Hallucis Longus (FHL)",
    nerve: "脛骨神経",
    root: "L5, S1, S2",
  },
  {
    muscle: "腓腹筋",
    english: "Gastrocnemius (GC)",
    nerve: "脛骨神経",
    root: "S1, S2",
  },
  { muscle: "ヒラメ筋", english: "Soleus", nerve: "脛骨神経", root: "S1, S2" },
  {
    muscle: "足部の小筋群",
    english: "Small muscles of the foot",
    nerve: "内側足底神経, 外側足底神経",
    root: "S1, S2",
  },
];

// 筋肉データの型定義
interface MuscleData {
  muscle: string;
  english: string;
  nerve: string;
  root: string;
}

// 神経グループの型定義
interface NerveGroup {
  nerve: string;
  muscles: MuscleData[];
}

// 筋節グループの型定義
interface RootGroup {
  root: string;
  muscles: MuscleData[];
}

// 神経別の筋肉をグループ化する関数
function groupByNerve(data: MuscleData[]): NerveGroup[] {
  const groups: { [key: string]: MuscleData[] } = {};

  data.forEach((item) => {
    if (!groups[item.nerve]) {
      groups[item.nerve] = [];
    }
    groups[item.nerve].push(item);
  });

  return Object.entries(groups).map(([nerve, muscles]) => ({
    nerve,
    muscles,
  }));
}

// 筋節別の筋肉をグループ化する関数
function groupByRoot(data: MuscleData[]): RootGroup[] {
  const rootMap: { [key: string]: MuscleData[] } = {};

  data.forEach((item) => {
    const roots = item.root.split(", ");
    roots.forEach((root) => {
      if (!rootMap[root]) {
        rootMap[root] = [];
      }
      if (!rootMap[root].some((m) => m.muscle === item.muscle)) {
        rootMap[root].push(item);
      }
    });
  });

  return Object.entries(rootMap)
    .sort((a, b) => {
      // C, T, L, Sの順にソート
      const aPrefix = a[0].charAt(0);
      const bPrefix = b[0].charAt(0);
      if (aPrefix !== bPrefix) {
        const order = { C: 0, T: 1, L: 2, S: 3 };
        return (
          order[aPrefix as keyof typeof order] -
          order[bPrefix as keyof typeof order]
        );
      }

      // 数字部分で比較
      const aNum = parseInt(a[0].substring(1));
      const bNum = parseInt(b[0].substring(1));
      return aNum - bNum;
    })
    .map(([root, muscles]) => ({
      root,
      muscles,
    }));
}

// 検索機能のためのフィルター関数
function filterData(data: MuscleData[], searchTerm: string): MuscleData[] {
  if (!searchTerm) return data;

  const term = searchTerm.toLowerCase();
  return data.filter(
    (item) =>
      item.muscle.toLowerCase().includes(term) ||
      item.english.toLowerCase().includes(term) ||
      item.nerve.toLowerCase().includes(term) ||
      item.root.toLowerCase().includes(term)
  );
}

export default function NeuromuscularPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUpperLimb, setFilteredUpperLimb] = useState(upperLimbData);
  const [filteredLowerLimb, setFilteredLowerLimb] = useState(lowerLimbData);
  const [viewMode, setViewMode] = useState<"table" | "nerve" | "root">("table");

  // 検索語が変更されたときにデータをフィルタリング
  useEffect(() => {
    setFilteredUpperLimb(filterData(upperLimbData, searchTerm));
    setFilteredLowerLimb(filterData(lowerLimbData, searchTerm));
  }, [searchTerm]);

  // 神経別にグループ化したデータ
  const upperLimbByNerve = groupByNerve(filteredUpperLimb);
  const lowerLimbByNerve = groupByNerve(filteredLowerLimb);

  // 筋節別にグループ化したデータ
  const upperLimbByRoot = groupByRoot(filteredUpperLimb);
  const lowerLimbByRoot = groupByRoot(filteredLowerLimb);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">神経筋支配データベース</h1>
      <p className="mb-8 text-gray-600">
        このページでは、上肢と下肢の筋肉とその支配神経、筋節の情報を検索・閲覧できます。
      </p>

      {/* 検索ボックス */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="筋肉名、神経、筋節で検索..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {/* 表示モード切り替え */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              viewMode === "table"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border border-gray-300`}
            onClick={() => setViewMode("table")}
          >
            テーブル表示
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              viewMode === "nerve"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border-t border-b border-gray-300`}
            onClick={() => setViewMode("nerve")}
          >
            神経別表示
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              viewMode === "root"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            } border border-gray-300`}
            onClick={() => setViewMode("root")}
          >
            筋節別表示
          </button>
        </div>
      </div>

      <Tabs defaultValue="upper" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upper">上肢</TabsTrigger>
          <TabsTrigger value="lower">下肢</TabsTrigger>
        </TabsList>

        <TabsContent value="upper">
          {viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      筋肉
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      英語表記
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      神経
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      筋節
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUpperLimb.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.muscle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.english}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.nerve}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.root}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === "nerve" && (
            <div className="grid grid-cols-1 gap-6">
              {upperLimbByNerve.map((group, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">
                    {group.nerve}
                  </h3>
                  <ul className="space-y-2 pl-4">
                    {group.muscles.map((item: MuscleData, idx: number) => (
                      <li
                        key={idx}
                        className="flex flex-row flex-wrap items-center gap-2"
                      >
                        <span className="font-medium">{item.muscle}</span>
                        <span className="text-sm text-gray-500">
                          {item.english}
                        </span>
                        <span className="text-sm text-gray-600">
                          - 筋節: {item.root}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {viewMode === "root" && (
            <div className="grid grid-cols-1 gap-6">
              {upperLimbByRoot.map((group, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-green-700 border-b pb-2">
                    {group.root}
                  </h3>
                  <ul className="space-y-2 pl-4">
                    {group.muscles.map((item: MuscleData, idx: number) => (
                      <li
                        key={idx}
                        className="flex flex-row flex-wrap items-center gap-2"
                      >
                        <span className="font-medium">{item.muscle}</span>
                        <span className="text-sm text-gray-500">
                          {item.english}
                        </span>
                        <span className="text-sm text-gray-600">
                          - 神経: {item.nerve}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lower">
          {viewMode === "table" && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      筋肉
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      英語表記
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      神経
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      筋節
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLowerLimb.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.muscle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.english}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.nerve}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.root}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewMode === "nerve" && (
            <div className="grid grid-cols-1 gap-6">
              {lowerLimbByNerve.map((group, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">
                    {group.nerve}
                  </h3>
                  <ul className="space-y-2 pl-4">
                    {group.muscles.map((item: MuscleData, idx: number) => (
                      <li
                        key={idx}
                        className="flex flex-row flex-wrap items-center gap-2"
                      >
                        <span className="font-medium">{item.muscle}</span>
                        <span className="text-sm text-gray-500">
                          {item.english}
                        </span>
                        <span className="text-sm text-gray-600">
                          - 筋節: {item.root}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {viewMode === "root" && (
            <div className="grid grid-cols-1 gap-6">
              {lowerLimbByRoot.map((group, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-4 text-green-700 border-b pb-2">
                    {group.root}
                  </h3>
                  <ul className="space-y-2 pl-4">
                    {group.muscles.map((item: MuscleData, idx: number) => (
                      <li
                        key={idx}
                        className="flex flex-row flex-wrap items-center gap-2"
                      >
                        <span className="font-medium">{item.muscle}</span>
                        <span className="text-sm text-gray-500">
                          {item.english}
                        </span>
                        <span className="text-sm text-gray-600">
                          - 神経: {item.nerve}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
