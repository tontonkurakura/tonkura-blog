"use client";

import { useState } from "react";
import React from "react";
import type { CDRScores } from "@/types/calculator";

export default function CDRCalculator() {
  const [scores, setScores] = useState<CDRScores>({
    memory: 0,
    orientation: 0,
    judgment: 0,
    community: 0,
    home: 0,
    care: 0,
  });
  const [calculationReason, setCalculationReason] = useState<string>("");

  const handleChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const name = button.getAttribute("data-name") as keyof CDRScores;
    const value = parseFloat(button.value);
    setScores((prevScores) => ({
      ...prevScores,
      [name]: value,
    }));
  };

  const calculateCDR = (): { score: number; reason: string } => {
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

    // ルール1: 記憶と同じスコアの二次カテゴリーが3つ以上ある場合、CDR = 記憶スコア
    if (sameAsMemory >= 3) {
      return {
        score: memory,
        reason: `記憶と同じスコア(${memory})の二次カテゴリーが${sameAsMemory}個あるため`,
      };
    }

    // ルール2: 3つ以上の二次カテゴリーが記憶より大きいか小さい場合
    if (greaterThanMemory >= 3) {
      // 多数派のスコアを採用
      const scoresGreaterThanMemory = secondaryScores.filter(
        (score) => score > memory
      );
      const mostCommonScore = findMostCommonScore(scoresGreaterThanMemory);

      // 追加ルール1: 同点の場合は記憶に最も近いスコアを選ぶ
      const tiedScores = findTiedScores(scoresGreaterThanMemory);
      if (tiedScores.length > 1) {
        const closestScore = findClosestToMemory(tiedScores, memory);
        return {
          score: closestScore,
          reason: `記憶(${memory})より大きいスコアの二次カテゴリーが${greaterThanMemory}個あり、同点の場合は記憶に最も近いスコア(${closestScore})を採用`,
        };
      }

      return {
        score: mostCommonScore,
        reason: `記憶(${memory})より大きいスコアの二次カテゴリーが${greaterThanMemory}個あるため`,
      };
    }

    if (lessThanMemory >= 3) {
      // 多数派のスコアを採用
      const scoresLessThanMemory = secondaryScores.filter(
        (score) => score < memory
      );
      const mostCommonLowerScore = findMostCommonScore(scoresLessThanMemory);

      // 追加ルール1: 同点の場合は記憶に最も近いスコアを選ぶ
      const tiedScores = findTiedScores(scoresLessThanMemory);
      if (tiedScores.length > 1) {
        const closestScore = findClosestToMemory(tiedScores, memory);
        return {
          score: closestScore,
          reason: `記憶(${memory})より小さいスコアの二次カテゴリーが${lessThanMemory}個あり、同点の場合は記憶に最も近いスコア(${closestScore})を採用`,
        };
      }

      return {
        score: mostCommonLowerScore,
        reason: `記憶(${memory})より小さいスコアの二次カテゴリーが${lessThanMemory}個あるため`,
      };
    }

    // ルール3: 3つの二次カテゴリーが記憶の一方の側にあり、2つが他方の側にある場合、CDR = 記憶スコア
    if (
      (greaterThanMemory === 3 && lessThanMemory === 2) ||
      (lessThanMemory === 3 && greaterThanMemory === 2)
    ) {
      return {
        score: memory,
        reason: `3つの二次カテゴリーが記憶(${memory})の一方の側にあり、2つが他方の側にあるため`,
      };
    }

    // 追加ルール2: 1つまたは2つの二次カテゴリーが記憶と同じスコアで、記憶の片側に2つ以下の二次カテゴリーがある場合
    if (
      (sameAsMemory === 1 || sameAsMemory === 2) &&
      greaterThanMemory <= 2 &&
      lessThanMemory <= 2
    ) {
      return {
        score: memory,
        reason: `記憶と同じスコアの二次カテゴリーが${sameAsMemory}個あり、記憶の片側に2つ以下の二次カテゴリーがあるため`,
      };
    }

    // ルール4: 記憶 = 0.5の場合、CDRは0にはならず、0.5または1のいずれかとなる
    if (memory === 0.5) {
      // 二次カテゴリーのうち少なくとも3つ以上が1以上なら、CDR = 1
      const scoresOneOrMore = secondaryScores.filter((score) => score >= 1);
      if (scoresOneOrMore.length >= 3) {
        return {
          score: 1,
          reason: `記憶=0.5で、二次カテゴリーのうち${scoresOneOrMore.length}個が1以上のため`,
        };
      }
      // それ以外の場合はCDR = 0.5
      return {
        score: 0.5,
        reason: `記憶=0.5で、二次カテゴリーのうち1以上のスコアが3個未満のため`,
      };
    }

    // ルール5: 記憶 = 0の場合
    if (memory === 0) {
      // 二次カテゴリーのスコアが2つ以上0.5以上なら、CDR = 0.5
      const scoresAboveZero = secondaryScores.filter((score) => score >= 0.5);
      if (scoresAboveZero.length >= 2) {
        return {
          score: 0.5,
          reason: `記憶=0で、二次カテゴリーのうち${scoresAboveZero.length}個が0.5以上のため`,
        };
      }
      // 二次カテゴリーの障害が1つだけならCDR = 0
      return {
        score: 0,
        reason: `記憶=0で、二次カテゴリーのうち0.5以上のスコアが1個以下のため`,
      };
    }

    // 追加ルール3: 記憶が1以上の場合、CDRは0にならない
    if (memory >= 1) {
      // 二次カテゴリーの多数が0の場合はCDR = 0.5
      const zerosCount = secondaryScores.filter((score) => score === 0).length;
      if (zerosCount >= 3) {
        return {
          score: 0.5,
          reason: `記憶=${memory}（1以上）で、二次カテゴリーの多数(${zerosCount}個)が0のため、CDR=0.5`,
        };
      }
    }

    // デフォルトケース: 最も一般的なスコアを返す
    const defaultScore = findMostCommonScore([memory, ...secondaryScores]);
    return {
      score: defaultScore,
      reason: `特定のルールに該当しないため、最も一般的なスコア(${defaultScore})を採用`,
    };
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

  // 同点のスコアを見つける関数
  const findTiedScores = (scores: number[]): number[] => {
    const countByScore: Record<number, number> = {};

    scores.forEach((score) => {
      countByScore[score] = (countByScore[score] || 0) + 1;
    });

    let highestCount = 0;
    Object.values(countByScore).forEach((count) => {
      if (count > highestCount) {
        highestCount = count;
      }
    });

    const tiedScores: number[] = [];
    Object.entries(countByScore).forEach(([score, count]) => {
      if (count === highestCount) {
        tiedScores.push(parseFloat(score));
      }
    });

    return tiedScores;
  };

  // メモリースコアに最も近いスコアを見つける関数
  const findClosestToMemory = (scores: number[], memory: number): number => {
    let closest = scores[0];
    let minDiff = Math.abs(memory - closest);

    scores.forEach((score) => {
      const diff = Math.abs(memory - score);
      if (diff < minDiff) {
        minDiff = diff;
        closest = score;
      }
    });

    return closest;
  };

  const calculateSelectedCategories = (): number => {
    let count = 0;
    if (scores.memory > 0) count++;
    if (scores.orientation > 0) count++;
    if (scores.judgment > 0) count++;
    if (scores.community > 0) count++;
    if (scores.home > 0) count++;
    if (scores.care > 0) count++;
    return count;
  };

  function ScoreButton({
    name,
    value,
    currentScore,
  }: {
    name: keyof CDRScores;
    value: number;
    currentScore: number;
  }) {
    return (
      <button
        data-name={name}
        value={value}
        onClick={handleChange}
        className={`border rounded px-3 py-1.5 transition-colors ${
          currentScore === value
            ? "bg-blue-600 text-white border-blue-600"
            : "hover:bg-gray-100 border-gray-300"
        }`}
      >
        {value}
      </button>
    );
  }

  const cdrResult = calculateCDR();
  const cdrScore = cdrResult.score;
  const selectedCategories = calculateSelectedCategories();

  // 判定理由を更新
  React.useEffect(() => {
    setCalculationReason(cdrResult.reason);
  }, [cdrResult.reason]);

  // スコアに基づいて色を決定する関数
  const getScoreColorClass = () => {
    if (cdrScore === 0) return "bg-blue-600";
    if (cdrScore === 0.5) return "bg-green-600";
    if (cdrScore === 1) return "bg-yellow-600";
    if (cdrScore === 2) return "bg-orange-600";
    return "bg-red-600";
  };

  // 重症度のテキストを取得する関数
  const getSeverityText = () => {
    if (cdrScore === 0) return "認知症なし";
    if (cdrScore === 0.5) return "認知症の疑い";
    if (cdrScore === 1) return "軽度認知症";
    if (cdrScore === 2) return "中等度認知症";
    return "重度認知症";
  };

  // カテゴリーごとのスコアに基づいて色を決定する関数
  const getCategoryScoreColorClass = (score: number) => {
    if (score === 0) return ""; // 0点の場合は色を付けない
    if (score <= 1) return ""; // 1以下は無色
    if (score <= 2) return "text-orange-600"; // 2はオレンジ
    return "text-red-600"; // 3は赤
  };

  // カテゴリーごとのスコアに基づいて背景色を決定する関数
  const getCategoryScoreBgClass = (score: number) => {
    if (score === 0) return ""; // 0点の場合は色を付けない
    if (score <= 1) return ""; // 1以下は無色
    if (score <= 2) return "bg-orange-50"; // 2はオレンジ
    return "bg-red-50"; // 3は赤
  };

  return (
    <div className="bg-white rounded-lg p-6 relative">
      <div className="bg-yellow-100 border-yellow-400 border text-yellow-800 p-3 rounded-lg mb-6 text-center font-bold">
        ⚠️ このページは現在作成中です。CDRはまだ適切に計算されません。 ⚠️
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">
        CDR (Clinical Dementia Rating) 計算ツール
      </h1>
      <p className="mb-4 text-gray-700">
        CDRは認知症の重症度を評価するための臨床的評価尺度です。記憶、見当識、判断力と問題解決、社会適応、家庭状況と趣味・関心、介護状況の6つの領域を評価します。
      </p>

      <div className="mb-8">
        <div className="grid grid-cols-1 gap-6">
          {/* 記憶 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">記憶</h2>
            <div className="mb-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="memory"
                      value={0}
                      currentScore={scores.memory}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    記憶障害なし、軽度の一貫しないもの忘れ
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="memory"
                      value={0.5}
                      currentScore={scores.memory}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    一貫した軽い物忘れ、出来事を部分的に思い出す、良性健忘
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="memory"
                      value={1}
                      currentScore={scores.memory}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    中等度記憶障害、特に最近の出来事に関するもの、日常生活に支障
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="memory"
                      value={2}
                      currentScore={scores.memory}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    重度記憶障害、高度に学習した記憶は保持、新しいものはすぐに忘れる
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="memory"
                      value={3}
                      currentScore={scores.memory}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    重度記憶障害、断片記憶のみ残存
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 見当識 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">見当識</h2>
            <div className="mb-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="orientation"
                      value={0}
                      currentScore={scores.orientation}
                    />
                  </div>
                  <div className="ml-4 text-sm">見当識障害なし</div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="orientation"
                      value={0.5}
                      currentScore={scores.orientation}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    時間的関連性に軽度の障害がある以外は見当識障害なし
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="orientation"
                      value={1}
                      currentScore={scores.orientation}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    時間的関連に中等度の障害があり、検査では場所の見当識良好、他の場所で時に地誌的失見当
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="orientation"
                      value={2}
                      currentScore={scores.orientation}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    時間的関連性に重度の障害がある、通常時間の失見当、しばしば場所の失見当あり
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="orientation"
                      value={3}
                      currentScore={scores.orientation}
                    />
                  </div>
                  <div className="ml-4 text-sm">人物への見当識のみ</div>
                </div>
              </div>
            </div>
          </div>

          {/* 判断力と問題解決 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">判断力と問題解決</h2>
            <div className="mb-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="judgment"
                      value={0}
                      currentScore={scores.judgment}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    日常生活での問題解決に支障なし、過去の行動に関して判断も適切
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="judgment"
                      value={0.5}
                      currentScore={scores.judgment}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    問題解決、類似や相違の指摘における軽度の障害
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="judgment"
                      value={1}
                      currentScore={scores.judgment}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    問題解決、類似や相違の指摘における中等度障害、社会保持判断は保持
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="judgment"
                      value={2}
                      currentScore={scores.judgment}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    問題解決、類似や相違の指摘における重度の障害、社会的判断力の障害
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="judgment"
                      value={3}
                      currentScore={scores.judgment}
                    />
                  </div>
                  <div className="ml-4 text-sm">問題解決不能、判断不能</div>
                </div>
              </div>
            </div>
          </div>

          {/* 社会適応 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">社会適応</h2>
            <div className="mb-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="community"
                      value={0}
                      currentScore={scores.community}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    通常の仕事、買い物、金銭の管理、ボランティア、社会的グループで通常の自立した機能
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="community"
                      value={0.5}
                      currentScore={scores.community}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    上記の活動に軽度の障害がある
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="community"
                      value={1}
                      currentScore={scores.community}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    上記の活動のいくつかに参加できるが、自立した機能を果たすことはできない
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="community"
                      value={2}
                      currentScore={scores.community}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    家庭外では自立不可能、一見して家庭外の活動にかかわれるように見える
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="community"
                      value={3}
                      currentScore={scores.community}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    家庭外では自立不可能、一見して家庭外での活動に参加できるようには見えない
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 家庭状況と趣味・関心 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">家庭状況と趣味・関心</h2>
            <div className="mb-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="home"
                      value={0}
                      currentScore={scores.home}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    家庭での生活、趣味や知的関心は十分保たれている
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="home"
                      value={0.5}
                      currentScore={scores.home}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    家庭での生活、趣味や知的関心が軽度に障害されている
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="home"
                      value={1}
                      currentScore={scores.home}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    軽度しかし明らかな家庭生活の障害、複雑な家事の障害、複雑な趣味や関心の喪失
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="home"
                      value={2}
                      currentScore={scores.home}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    単純な家事手伝いのみ可能、非常に限られた関心がわずかにある
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="home"
                      value={3}
                      currentScore={scores.home}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    家庭内で意味のある生活活動はできない
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 介護状況 */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h2 className="text-lg font-semibold mb-2">介護状況</h2>
            <div className="mb-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="care"
                      value={0}
                      currentScore={scores.care}
                    />
                  </div>
                  <div className="ml-4 text-sm">セルフケア完全</div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="care"
                      value={1}
                      currentScore={scores.care}
                    />
                  </div>
                  <div className="ml-4 text-sm">時に励ましが必要</div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="care"
                      value={2}
                      currentScore={scores.care}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    着衣、衛生管理、身繕いに介助が必要
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-20 flex-shrink-0">
                    <ScoreButton
                      name="care"
                      value={3}
                      currentScore={scores.care}
                    />
                  </div>
                  <div className="ml-4 text-sm">
                    日常生活に十分な介護を要する、しばしば失禁
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* フローティングスコア表示 */}
      <div
        className={`mt-8 sticky bottom-4 z-10 ${getScoreColorClass()} bg-opacity-90 text-white p-4 rounded-xl shadow-xl mb-6 flex flex-col sm:flex-row sm:justify-between items-center gap-2`}
      >
        <div className="flex items-center text-xl">
          <span className="font-bold mr-2">CDR:</span>
          <span className="text-3xl font-extrabold mx-1">{cdrScore}</span>
          <span className="font-medium">/3</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm">
            <span className="font-medium">
              {selectedCategories}/6 項目選択済み
            </span>
          </div>
          <button
            onClick={() => {
              setScores({
                memory: 0,
                orientation: 0,
                judgment: 0,
                community: 0,
                home: 0,
                care: 0,
              });
            }}
            className="px-3 py-1 bg-white bg-opacity-30 hover:bg-opacity-40 rounded-lg text-sm font-medium transition-colors"
          >
            選択をクリア
          </button>
          <div className="sm:border-l sm:border-white sm:pl-4 font-semibold text-lg">
            {getSeverityText()}
          </div>
        </div>
      </div>

      {/* カテゴリー別スコアと評価基準 */}
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2 text-center">
              カテゴリー別スコア
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div
                className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(scores.memory)}`}
              >
                <span
                  className={`font-bold ${getCategoryScoreColorClass(scores.memory)}`}
                >
                  記憶:
                </span>
                <span
                  className={`font-medium ${getCategoryScoreColorClass(scores.memory)}`}
                >
                  {scores.memory}/3
                </span>
              </div>
              <div
                className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(scores.orientation)}`}
              >
                <span
                  className={`font-bold ${getCategoryScoreColorClass(scores.orientation)}`}
                >
                  見当識:
                </span>
                <span
                  className={`font-medium ${getCategoryScoreColorClass(scores.orientation)}`}
                >
                  {scores.orientation}/3
                </span>
              </div>
              <div
                className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(scores.judgment)}`}
              >
                <span
                  className={`font-bold ${getCategoryScoreColorClass(scores.judgment)}`}
                >
                  判断力:
                </span>
                <span
                  className={`font-medium ${getCategoryScoreColorClass(scores.judgment)}`}
                >
                  {scores.judgment}/3
                </span>
              </div>
              <div
                className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(scores.community)}`}
              >
                <span
                  className={`font-bold ${getCategoryScoreColorClass(scores.community)}`}
                >
                  社会活動:
                </span>
                <span
                  className={`font-medium ${getCategoryScoreColorClass(scores.community)}`}
                >
                  {scores.community}/3
                </span>
              </div>
              <div
                className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(scores.home)}`}
              >
                <span
                  className={`font-bold ${getCategoryScoreColorClass(scores.home)}`}
                >
                  家庭生活:
                </span>
                <span
                  className={`font-medium ${getCategoryScoreColorClass(scores.home)}`}
                >
                  {scores.home}/3
                </span>
              </div>
              <div
                className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(scores.care)}`}
              >
                <span
                  className={`font-bold ${getCategoryScoreColorClass(scores.care)}`}
                >
                  介護状況:
                </span>
                <span
                  className={`font-medium ${getCategoryScoreColorClass(scores.care)}`}
                >
                  {scores.care}/3
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border md:col-span-2">
            <h3 className="font-semibold mb-2 text-center">重症度分類</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div
                className={`p-2 rounded ${
                  cdrScore === 0
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">CDR 0:</span> 認知症なし
              </div>
              <div
                className={`p-2 rounded ${
                  cdrScore === 0.5
                    ? "bg-green-100 text-green-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">CDR 0.5:</span> 認知症の疑い
              </div>
              <div
                className={`p-2 rounded ${
                  cdrScore === 1
                    ? "bg-yellow-100 text-yellow-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">CDR 1:</span> 軽度認知症
              </div>
              <div
                className={`p-2 rounded ${
                  cdrScore === 2
                    ? "bg-orange-100 text-orange-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">CDR 2:</span> 中等度認知症
              </div>
              <div
                className={`p-2 rounded ${
                  cdrScore === 3
                    ? "bg-red-100 text-red-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">CDR 3:</span> 重度認知症
              </div>

              {/* 判定理由の表示 */}
              {calculationReason && (
                <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">判定理由:</span>{" "}
                    {calculationReason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className="text-sm text-gray-600 mt-4"
          style={{ fontSize: "12px" }}
        >
          <p>
            ※このツールは、医療情報の参考として提供されるものであり、正式な診断や治療の決定には使用できません。医学的な判断については、必ず医師に相談してください。
          </p>
          <p className="mt-2">
            ※CDRは可能なすべてのスコアリングに対応することを意図したものではありません。
            <br />
            非現実的な点数の組み合わせにより、アルゴリズムによって誤ったCDRになる場合があります。
            <br />
            例えば、記憶が0点で介護状況が3点といった状況は、現実では存在する可能性はほとんどありません。
          </p>
        </div>
      </div>
    </div>
  );
}
