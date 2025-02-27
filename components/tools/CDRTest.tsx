import React, { useState } from "react";
import type { CDRScores } from "@/types/calculator";

export default function CDRTest() {
  const [results, setResults] = useState<
    {
      scores: CDRScores;
      cdrScore: number;
      unrealistic: boolean;
      appliedRule: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [showUnrealistic, setShowUnrealistic] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // CDRの計算関数（CDRCalculator.tsxからコピー）
  const calculateCDR = (scores: CDRScores): number => {
    // メモリー（M）は主要カテゴリー、他は二次カテゴリー
    const memory = scores.memory;
    const secondaryScores = [
      scores.orientation,
      scores.judgment,
      scores.community,
      scores.home,
      scores.care,
    ];

    // 二次カテゴリーのスコアがメモリーと同じ、より大きい、より小さいものをカウント
    let sameAsMemory = 0;
    let greaterThanMemory = 0;
    let lessThanMemory = 0;

    secondaryScores.forEach((score) => {
      if (score === memory) sameAsMemory++;
      else if (score > memory) greaterThanMemory++;
      else lessThanMemory++;
    });

    // ルール1: メモリーと同じスコアの二次カテゴリーが3つ以上ある場合、CDR = メモリースコア
    if (sameAsMemory >= 3) {
      return memory;
    }

    // ルール2: 3つ以上の二次カテゴリーがメモリーより大きいか小さい場合
    if (greaterThanMemory >= 3) {
      // 多数派のスコアを採用
      return findMostCommonScore(
        secondaryScores.filter((score) => score > memory)
      );
    }

    if (lessThanMemory >= 3) {
      // 多数派のスコアを採用
      const mostCommonLowerScore = findMostCommonScore(
        secondaryScores.filter((score) => score < memory)
      );

      return mostCommonLowerScore;
    }

    // ルール3: 3つの二次カテゴリーがメモリーの一方の側にあり、2つが他方の側にある場合、CDR = メモリースコア
    if (
      (greaterThanMemory === 3 && lessThanMemory === 2) ||
      (lessThanMemory === 3 && greaterThanMemory === 2)
    ) {
      return memory;
    }

    // ルール4: メモリー = 0.5の場合、CDRは0にはならず、0.5または1のいずれかとなる
    if (memory === 0.5) {
      // 二次カテゴリーのうち少なくとも3つ以上が1以上なら、CDR = 1
      const scoresOneOrMore = secondaryScores.filter((score) => score >= 1);
      if (scoresOneOrMore.length >= 3) {
        return 1;
      }
      // それ以外の場合はCDR = 0.5
      return 0.5;
    }

    // ルール5: メモリー = 0の場合
    if (memory === 0) {
      // 二次カテゴリーのスコアが2つ以上0.5以上なら、CDR = 0.5
      const scoresAboveZero = secondaryScores.filter((score) => score >= 0.5);
      if (scoresAboveZero.length >= 2) {
        return 0.5;
      }
      // 二次カテゴリーの障害が1つだけならCDR = 0
      return 0;
    }

    // デフォルトケース: 最も一般的なスコアを返す
    return findMostCommonScore([memory, ...secondaryScores]);
  };

  // 最も一般的なスコアを見つける関数
  const findMostCommonScore = (scores: number[]): number => {
    const countByScore: Record<number, number> = {};

    scores.forEach((score) => {
      countByScore[score] = (countByScore[score] || 0) + 1;
    });

    let mostCommonScore = scores[0];
    let highestCount = 0;

    Object.entries(countByScore).forEach(([score, count]) => {
      if (count > highestCount) {
        highestCount = count;
        mostCommonScore = parseFloat(score);
      }
    });

    return mostCommonScore;
  };

  // 非現実的な組み合わせかどうかを判定する関数
  const isUnrealisticCombination = (scores: CDRScores): boolean => {
    // 記憶が0で他のスコアが高い場合
    if (
      scores.memory === 0 &&
      (scores.orientation > 1 ||
        scores.judgment > 1 ||
        scores.community > 1 ||
        scores.home > 1 ||
        scores.care > 1)
    ) {
      return true;
    }

    // 記憶が3未満で介護状況が3の場合
    if (scores.memory < 3 && scores.care === 3) {
      return true;
    }

    // 記憶が低く、他のスコアが極端に高い場合
    if (
      scores.memory <= 1 &&
      (scores.orientation === 3 ||
        scores.judgment === 3 ||
        scores.community === 3 ||
        scores.home === 3)
    ) {
      return true;
    }

    return false;
  };

  // どのルールが適用されたかを判定する関数
  const getAppliedRule = (scores: CDRScores): string => {
    const memory = scores.memory;
    const secondaryScores = [
      scores.orientation,
      scores.judgment,
      scores.community,
      scores.home,
      scores.care,
    ];

    let sameAsMemory = 0;
    let greaterThanMemory = 0;
    let lessThanMemory = 0;

    secondaryScores.forEach((score) => {
      if (score === memory) sameAsMemory++;
      else if (score > memory) greaterThanMemory++;
      else lessThanMemory++;
    });

    if (sameAsMemory >= 3) {
      return "ルール1: メモリーと同じスコアの二次カテゴリーが3つ以上";
    }

    if (greaterThanMemory >= 3) {
      return "ルール2a: 3つ以上の二次カテゴリーがメモリーより大きい";
    }

    if (lessThanMemory >= 3) {
      return "ルール2b: 3つ以上の二次カテゴリーがメモリーより小さい";
    }

    if (
      (greaterThanMemory === 3 && lessThanMemory === 2) ||
      (lessThanMemory === 3 && greaterThanMemory === 2)
    ) {
      return "ルール3: 3つの二次カテゴリーがメモリーの一方の側、2つが他方の側";
    }

    if (memory === 0.5) {
      const scoresOneOrMore = secondaryScores.filter((score) => score >= 1);
      if (scoresOneOrMore.length >= 3) {
        return "ルール4a: メモリー=0.5、3つ以上の二次カテゴリーが1以上";
      }
      return "ルール4b: メモリー=0.5、その他の場合";
    }

    if (memory === 0) {
      const scoresAboveZero = secondaryScores.filter((score) => score >= 0.5);
      if (scoresAboveZero.length >= 2) {
        return "ルール5a: メモリー=0、2つ以上の二次カテゴリーが0.5以上";
      }
      return "ルール5b: メモリー=0、二次カテゴリーの障害が1つだけ";
    }

    return "デフォルト: 最も一般的なスコアを採用";
  };

  // テストを実行する関数
  const runTest = () => {
    if (loading) return;

    setLoading(true);
    setTestCompleted(false);
    setResults([]);

    // 非同期で実行するために setTimeout を使用
    setTimeout(() => {
      const testResults: {
        scores: CDRScores;
        cdrScore: number;
        unrealistic: boolean;
        appliedRule: string;
      }[] = [];
      const possibleScores = [0, 0.5, 1, 2, 3];
      const possibleCareScores = [0, 1, 2, 3]; // 介護状況は0.5がない

      // 全ての組み合わせを生成
      for (const memory of possibleScores) {
        for (const orientation of possibleScores) {
          for (const judgment of possibleScores) {
            for (const community of possibleScores) {
              for (const home of possibleScores) {
                for (const care of possibleCareScores) {
                  const scores: CDRScores = {
                    memory,
                    orientation,
                    judgment,
                    community,
                    home,
                    care,
                  };

                  const cdrScore = calculateCDR(scores);
                  const unrealistic = isUnrealisticCombination(scores);

                  testResults.push({
                    scores,
                    cdrScore,
                    unrealistic,
                    appliedRule: getAppliedRule(scores),
                  });
                }
              }
            }
          }
        }
      }

      setResults(testResults);
      setLoading(false);
      setTestCompleted(true);
    }, 100);
  };

  // 結果をフィルタリングする関数
  const filteredResults = results.filter((result) => {
    if (!showUnrealistic && result.unrealistic) {
      return false;
    }

    if (filter) {
      const searchTerms = filter.toLowerCase().split(" ");
      const resultString = JSON.stringify(result.scores).toLowerCase();
      return searchTerms.every((term) => resultString.includes(term));
    }

    return true;
  });

  // CDRスコアごとの集計
  const cdrCounts = filteredResults.reduce(
    (acc: Record<string, number>, result) => {
      const key = result.cdrScore.toString();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  // ルールごとの集計
  const ruleCounts = filteredResults.reduce(
    (acc: Record<string, number>, result) => {
      const key = result.appliedRule;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="bg-white rounded-lg p-6 relative">
      <h1 className="text-2xl font-bold mb-6 text-center">CDR 計算テスト</h1>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              フィルター（例: &quot;memory:0 care:3&quot;）
            </label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="検索キーワードを入力"
              disabled={loading}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnrealistic}
                onChange={(e) => setShowUnrealistic(e.target.checked)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-700">
                非現実的な組み合わせも表示
              </span>
            </label>
          </div>
        </div>

        {!testCompleted && (
          <div className="flex justify-center mt-4">
            <button
              onClick={runTest}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "テスト実行中..." : "テストを実行する"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-lg">テスト実行中...</p>
          <p className="text-sm text-gray-500">
            （全12,500通りの組み合わせをテスト中）
          </p>
        </div>
      ) : testCompleted ? (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">集計結果</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">CDRスコア別</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(cdrCounts)
                    .sort()
                    .map(([score, count]) => (
                      <div key={score} className="flex justify-between">
                        <span>CDR {score}:</span>
                        <span className="font-medium">{count}件</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="border rounded p-4">
                <h3 className="font-medium mb-2">適用ルール別</h3>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(ruleCounts).map(([rule, count]) => (
                    <div key={rule} className="flex justify-between">
                      <span className="truncate">{rule}:</span>
                      <span className="font-medium">{count}件</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-2">
            テスト結果 ({filteredResults.length} / {results.length}件)
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">記憶</th>
                  <th className="border p-2">見当識</th>
                  <th className="border p-2">判断力</th>
                  <th className="border p-2">社会活動</th>
                  <th className="border p-2">家庭生活</th>
                  <th className="border p-2">介護状況</th>
                  <th className="border p-2">CDR</th>
                  <th className="border p-2">適用ルール</th>
                  <th className="border p-2">非現実的</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.slice(0, 1000).map((result, index) => (
                  <tr
                    key={index}
                    className={result.unrealistic ? "bg-red-50" : ""}
                  >
                    <td className="border p-2">{result.scores.memory}</td>
                    <td className="border p-2">{result.scores.orientation}</td>
                    <td className="border p-2">{result.scores.judgment}</td>
                    <td className="border p-2">{result.scores.community}</td>
                    <td className="border p-2">{result.scores.home}</td>
                    <td className="border p-2">{result.scores.care}</td>
                    <td className="border p-2 font-bold">{result.cdrScore}</td>
                    <td className="border p-2 text-xs">{result.appliedRule}</td>
                    <td className="border p-2">
                      {result.unrealistic ? "⚠️" : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredResults.length > 1000 && (
              <p className="text-center text-gray-500 mt-4">
                表示件数制限のため、最初の1000件のみ表示しています。
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg">
            「テストを実行する」ボタンをクリックして、CDR計算のテストを開始してください。
          </p>
          <p className="text-sm text-gray-500 mt-2">
            全12,500通りの組み合わせに対してCDRスコアを計算します。
          </p>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-600">
        <p>
          ※このテストツールは、CDR計算アルゴリズムの検証用です。全12,500通りの組み合わせに対してCDRスコアを計算します。
        </p>
        <p className="mt-2">
          ※非現実的な組み合わせ（例：記憶が0点で介護状況が3点など）は、臨床的には存在する可能性が低いものです。
        </p>
      </div>
    </div>
  );
}
