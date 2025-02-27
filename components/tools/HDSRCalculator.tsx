"use client";

import { useState } from "react";
import React from "react";
import type { HDSRScores } from "@/types/calculator";

export default function HDSRCalculator() {
  const [scores, setScores] = useState<HDSRScores>({
    age: 1,
    date_weekday: 1,
    date_day: 1,
    date_month: 1,
    date_year: 1,
    location: 2,
    words_1: 1,
    words_2: 1,
    words_3: 1,
    calc_1: 1,
    calc_2: 1,
    calc_3: 0,
    calc_4: 0,
    calc_5: 0,
    reverse_3digit: 1,
    reverse_4digit: 1,
    recall_1: 2,
    recall_2: 2,
    recall_3: 2,
    items_1: 1,
    items_2: 1,
    items_3: 1,
    items_4: 1,
    items_5: 1,
    vegetables: 5,
  });

  const handleChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const name = button.getAttribute("data-name") as keyof HDSRScores;
    const value = parseInt(button.value, 10);
    setScores((prevScores) => ({
      ...prevScores,
      [name]: value,
    }));
  };

  const calculateScore = (): number => {
    const dateScore =
      scores.date_weekday +
      scores.date_day +
      scores.date_month +
      scores.date_year;
    const wordsScore = scores.words_1 + scores.words_2 + scores.words_3;
    const calcScore = scores.calc_1 + scores.calc_2;
    const reverseScore = scores.reverse_3digit + scores.reverse_4digit;
    const recallScore = scores.recall_1 + scores.recall_2 + scores.recall_3;
    const itemsScore =
      scores.items_1 +
      scores.items_2 +
      scores.items_3 +
      scores.items_4 +
      scores.items_5;

    return (
      scores.age +
      dateScore +
      scores.location +
      wordsScore +
      calcScore +
      reverseScore +
      recallScore +
      itemsScore +
      scores.vegetables
    );
  };

  // 各カテゴリーのスコアを計算する関数
  const calculateCategoryScores = () => {
    const dateScore =
      scores.date_weekday +
      scores.date_day +
      scores.date_month +
      scores.date_year;
    const wordsScore = scores.words_1 + scores.words_2 + scores.words_3;
    const calcScore = scores.calc_1 + scores.calc_2;
    const reverseScore = scores.reverse_3digit + scores.reverse_4digit;
    const recallScore = scores.recall_1 + scores.recall_2 + scores.recall_3;
    const itemsScore =
      scores.items_1 +
      scores.items_2 +
      scores.items_3 +
      scores.items_4 +
      scores.items_5;

    return {
      ageScore: scores.age,
      dateScore,
      locationScore: scores.location,
      wordsScore,
      calcScore,
      reverseScore,
      recallScore,
      itemsScore,
      vegetablesScore: scores.vegetables,
    };
  };

  // 選択された項目数を計算
  const calculateSelectedItems = (): number => {
    let count = 0;
    Object.values(scores).forEach((score) => {
      if (score > 0) count++;
    });
    return count;
  };

  function ScoreButton({
    name,
    value,
    currentScore,
  }: {
    name: keyof HDSRScores;
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

  const totalScore = calculateScore();
  const selectedItems = calculateSelectedItems();
  const categoryScores = calculateCategoryScores();

  // スコアに基づいて色を決定する関数
  const getScoreColorClass = () => {
    if (totalScore >= 25) return "bg-blue-600";
    if (totalScore >= 20 && totalScore < 25) return "bg-green-600";
    if (totalScore >= 15 && totalScore < 20) return "bg-yellow-600";
    if (totalScore >= 10 && totalScore < 15) return "bg-orange-600";
    return "bg-red-600";
  };

  // 重症度のテキストを取得する関数
  const getSeverityText = () => {
    if (totalScore >= 25) return "正常";
    if (totalScore >= 20 && totalScore < 25) return "軽度認知機能障害の疑い";
    if (totalScore >= 15 && totalScore < 20) return "軽度認知症";
    if (totalScore >= 10 && totalScore < 15) return "中等度認知症";
    return "重度認知症";
  };

  // カテゴリーごとのスコアに基づいて色を決定する関数
  const getCategoryScoreColorClass = (score: number, maxScore: number) => {
    if (score === maxScore) return ""; // 満点の場合は色を付けない
    const ratio = score / maxScore;
    if (ratio >= 0.6) return ""; // 60%以上は無色
    if (ratio >= 0.3) return "text-orange-600"; // 30-60%はオレンジ
    return "text-red-600"; // 30%未満は赤
  };

  // カテゴリーごとのスコアに基づいて背景色を決定する関数
  const getCategoryScoreBgClass = (score: number, maxScore: number) => {
    if (score === maxScore) return ""; // 満点の場合は色を付けない
    const ratio = score / maxScore;
    if (ratio >= 0.6) return ""; // 60%以上は無色
    if (ratio >= 0.3) return "bg-orange-50"; // 30-60%はオレンジ
    return "bg-red-50"; // 30%未満は赤
  };

  return (
    <div className="bg-white rounded-lg p-6 relative">
      <h3 className="text-2xl font-bold mb-6 font-mplus">
        改訂 長谷川式簡易認知能評価スケール (HDS-R)
      </h3>

      <div className="flex flex-col gap-6">
        <div>
          <label className="block mb-2 text-gray-700">
            1. 年齢の見当識
            <div className="ml-4 text-gray-700">
              『お歳はいくつですか？』
              <div className="text-sm text-gray-500">
                （2年までの誤差は正解）
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton name="age" value={0} currentScore={scores.age} />
            <ScoreButton name="age" value={1} currentScore={scores.age} />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            2. 時間の見当識
            <div className="ml-4 text-gray-700">
              『今日は何年何月何日何曜日ですか？』
              <div className="text-sm text-gray-500">（各1点）</div>
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">曜日</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="date_weekday"
                  value={0}
                  currentScore={scores.date_weekday}
                />
                <ScoreButton
                  name="date_weekday"
                  value={1}
                  currentScore={scores.date_weekday}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">日</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="date_day"
                  value={0}
                  currentScore={scores.date_day}
                />
                <ScoreButton
                  name="date_day"
                  value={1}
                  currentScore={scores.date_day}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">月</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="date_month"
                  value={0}
                  currentScore={scores.date_month}
                />
                <ScoreButton
                  name="date_month"
                  value={1}
                  currentScore={scores.date_month}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">年</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="date_year"
                  value={0}
                  currentScore={scores.date_year}
                />
                <ScoreButton
                  name="date_year"
                  value={1}
                  currentScore={scores.date_year}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            3. 場所の見当識
            <div className="ml-4 text-gray-700">
              『私たちがいまいるところはどこですか？』
              <div className="text-sm text-gray-500">
                （自発的に答えられれば2点、5秒おいて自発的に答えられなければ「ここは家ですか？病院ですか？施設ですか？」とヒントを出し、答えられれば1点）
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="location"
              value={0}
              currentScore={scores.location}
            />
            <ScoreButton
              name="location"
              value={1}
              currentScore={scores.location}
            />
            <ScoreButton
              name="location"
              value={2}
              currentScore={scores.location}
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            4. 即時記憶
            <div className="ml-4 text-gray-700">
              『これから言う3つの言葉を言ってみてください。』
              <div className="text-sm text-gray-500 mt-1">
                系列1:「桜」「猫」「電車」
                <br />
                系列2:「梅」「犬」「自動車」
                <br />
                （各1点）
              </div>
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">1</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="words_1"
                  value={0}
                  currentScore={scores.words_1}
                />
                <ScoreButton
                  name="words_1"
                  value={1}
                  currentScore={scores.words_1}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">2</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="words_2"
                  value={0}
                  currentScore={scores.words_2}
                />
                <ScoreButton
                  name="words_2"
                  value={1}
                  currentScore={scores.words_2}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">3</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="words_3"
                  value={0}
                  currentScore={scores.words_3}
                />
                <ScoreButton
                  name="words_3"
                  value={1}
                  currentScore={scores.words_3}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            5. 計算
            <div className="ml-4 text-gray-700">
              『100から7を順番に引いてください。』
              <div className="text-sm text-gray-500">
                （93まで1点、86まで2点。それ以降は不要）
              </div>
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">93</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="calc_1"
                  value={0}
                  currentScore={scores.calc_1}
                />
                <ScoreButton
                  name="calc_1"
                  value={1}
                  currentScore={scores.calc_1}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">86</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="calc_2"
                  value={0}
                  currentScore={scores.calc_2}
                />
                <ScoreButton
                  name="calc_2"
                  value={1}
                  currentScore={scores.calc_2}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            6. 数字の逆唱
            <div className="ml-4 text-gray-700">
              『これから言う数字を逆から言ってください。』
              <div className="text-sm text-gray-500 mt-1">
                3桁：「6-8-2」（1点）
                <br />
                4桁：「3-5-2-9」（1点）
              </div>
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">2-8-6</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="reverse_3digit"
                  value={0}
                  currentScore={scores.reverse_3digit}
                />
                <ScoreButton
                  name="reverse_3digit"
                  value={1}
                  currentScore={scores.reverse_3digit}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">9-2-5-3</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="reverse_4digit"
                  value={0}
                  currentScore={scores.reverse_4digit}
                />
                <ScoreButton
                  name="reverse_4digit"
                  value={1}
                  currentScore={scores.reverse_4digit}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            7. 遅延再生
            <div className="ml-4 text-gray-700">
              『先ほど覚えていただいた3つの言葉をもう一度言ってみてください。』
              <div className="text-sm text-gray-500">
                （自発的に答えられれば2点、ヒント（植物、動物、乗り物）を与えて正答できれば1点）
              </div>
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">1</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="recall_1"
                  value={0}
                  currentScore={scores.recall_1}
                />
                <ScoreButton
                  name="recall_1"
                  value={1}
                  currentScore={scores.recall_1}
                />
                <ScoreButton
                  name="recall_1"
                  value={2}
                  currentScore={scores.recall_1}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">2</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="recall_2"
                  value={0}
                  currentScore={scores.recall_2}
                />
                <ScoreButton
                  name="recall_2"
                  value={1}
                  currentScore={scores.recall_2}
                />
                <ScoreButton
                  name="recall_2"
                  value={2}
                  currentScore={scores.recall_2}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-500">3</span>
              <div className="flex gap-2">
                <ScoreButton
                  name="recall_3"
                  value={0}
                  currentScore={scores.recall_3}
                />
                <ScoreButton
                  name="recall_3"
                  value={1}
                  currentScore={scores.recall_3}
                />
                <ScoreButton
                  name="recall_3"
                  value={2}
                  currentScore={scores.recall_3}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            8. 視覚性記憶
            <div className="ml-4 text-gray-700">
              『これから5つの品物を見せます。それを隠しますので何があったか言ってください。』
              <div className="text-sm text-gray-500 mt-1">
                「鉛筆」「時計」「スプーン」「鍵」「歯ブラシ」
                <br />
                （各1点）
              </div>
            </div>
          </label>
          <div className="flex flex-col gap-2">
            {["鉛筆", "時計", "スプーン", "鍵", "歯ブラシ"].map(
              (item, index) => (
                <div key={item} className="flex justify-end items-center gap-2">
                  <span className="text-sm text-gray-500">{item}</span>
                  <div className="flex gap-2">
                    <ScoreButton
                      name={`items_${index + 1}`}
                      value={0}
                      currentScore={
                        scores[`items_${index + 1}` as keyof HDSRScores]
                      }
                    />
                    <ScoreButton
                      name={`items_${index + 1}`}
                      value={1}
                      currentScore={
                        scores[`items_${index + 1}` as keyof HDSRScores]
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-gray-700">
            9. 語想起
            <div className="ml-4 text-gray-700">
              『知っている野菜の名前をできるだけ多く言ってください。』
              <div className="text-sm text-gray-500">
                （6個で1点、以降1つにつき1点追加。10個以上で5点）
              </div>
            </div>
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex justify-end items-center gap-2">
              <div className="flex gap-2">
                {[5, 6, 7, 8, 9, 10].map((count) => (
                  <div key={count} className="flex flex-col items-center">
                    <span className="text-sm text-gray-500 mb-1">
                      {count}個{count === 5 ? "以下" : ""}
                    </span>
                    <ScoreButton
                      name="vegetables"
                      value={Math.max(0, Math.min(5, count - 5))}
                      currentScore={scores.vegetables}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* フローティングスコア表示 */}
        <div
          className={`mt-8 sticky bottom-4 z-10 ${getScoreColorClass()} bg-opacity-90 text-white p-4 rounded-xl shadow-xl mb-6 flex flex-col sm:flex-row sm:justify-between items-center gap-2`}
        >
          <div className="flex items-center text-xl">
            <span className="font-bold mr-2">合計点:</span>
            <span className="text-3xl font-extrabold mx-1">{totalScore}</span>
            <span className="font-medium">/30</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm">
              <span className="font-medium">
                {selectedItems}/25 項目選択済み
              </span>
            </div>
            <button
              onClick={() => {
                setScores({
                  age: 1,
                  date_weekday: 1,
                  date_day: 1,
                  date_month: 1,
                  date_year: 1,
                  location: 2,
                  words_1: 1,
                  words_2: 1,
                  words_3: 1,
                  calc_1: 1,
                  calc_2: 1,
                  calc_3: 0,
                  calc_4: 0,
                  calc_5: 0,
                  reverse_3digit: 1,
                  reverse_4digit: 1,
                  recall_1: 2,
                  recall_2: 2,
                  recall_3: 2,
                  items_1: 1,
                  items_2: 1,
                  items_3: 1,
                  items_4: 1,
                  items_5: 1,
                  vegetables: 5,
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
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-3 rounded-lg shadow-sm border">
              <h3 className="font-semibold mb-2 text-center">
                カテゴリー別スコア
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.ageScore, 1)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.ageScore, 1)}`}
                  >
                    年齢:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.ageScore, 1)}`}
                  >
                    {categoryScores.ageScore}/1
                  </span>
                </div>
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.dateScore, 4)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.dateScore, 4)}`}
                  >
                    日時の見当識:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.dateScore, 4)}`}
                  >
                    {categoryScores.dateScore}/4
                  </span>
                </div>
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.locationScore, 2)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.locationScore, 2)}`}
                  >
                    場所の見当識:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.locationScore, 2)}`}
                  >
                    {categoryScores.locationScore}/2
                  </span>
                </div>
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.wordsScore, 3)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.wordsScore, 3)}`}
                  >
                    即時記憶:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.wordsScore, 3)}`}
                  >
                    {categoryScores.wordsScore}/3
                  </span>
                </div>
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.calcScore, 2)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.calcScore, 2)}`}
                  >
                    計算:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.calcScore, 2)}`}
                  >
                    {categoryScores.calcScore}/2
                  </span>
                </div>
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.reverseScore, 2)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.reverseScore, 2)}`}
                  >
                    数字の逆唱:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.reverseScore, 2)}`}
                  >
                    {categoryScores.reverseScore}/2
                  </span>
                </div>
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.recallScore, 6)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.recallScore, 6)}`}
                  >
                    遅延再生:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.recallScore, 6)}`}
                  >
                    {categoryScores.recallScore}/6
                  </span>
                </div>
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.itemsScore, 5)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.itemsScore, 5)}`}
                  >
                    物品呼称:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.itemsScore, 5)}`}
                  >
                    {categoryScores.itemsScore}/5
                  </span>
                </div>
                <div
                  className={`flex justify-between p-1.5 rounded ${getCategoryScoreBgClass(categoryScores.vegetablesScore, 5)}`}
                >
                  <span
                    className={`font-bold ${getCategoryScoreColorClass(categoryScores.vegetablesScore, 5)}`}
                  >
                    語想起:
                  </span>
                  <span
                    className={`font-medium ${getCategoryScoreColorClass(categoryScores.vegetablesScore, 5)}`}
                  >
                    {categoryScores.vegetablesScore}/5
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm border md:col-span-2">
              <h3 className="font-semibold mb-2 text-center">重症度分類</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div
                  className={`p-2 rounded ${
                    totalScore >= 25
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-semibold">25-30点:</span> 正常
                </div>
                <div
                  className={`p-2 rounded ${
                    totalScore >= 20 && totalScore < 25
                      ? "bg-green-100 text-green-800 font-medium"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-semibold">20-24点:</span>{" "}
                  軽度認知機能障害の疑い
                </div>
                <div
                  className={`p-2 rounded ${
                    totalScore >= 15 && totalScore < 20
                      ? "bg-yellow-100 text-yellow-800 font-medium"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-semibold">15-19点:</span> 軽度認知症
                </div>
                <div
                  className={`p-2 rounded ${
                    totalScore >= 10 && totalScore < 15
                      ? "bg-orange-100 text-orange-800 font-medium"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-semibold">10-14点:</span> 中等度認知症
                </div>
                <div
                  className={`p-2 rounded ${
                    totalScore < 10
                      ? "bg-red-100 text-red-800 font-medium"
                      : "bg-gray-50"
                  }`}
                >
                  <span className="font-semibold">0-9点:</span> 重度認知症
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-4">
            <p>
              ※
              HDS-Rは認知症のスクリーニング検査です。最終的な診断は医療専門家によって行われるべきです。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
