"use client";

import { useState } from "react";
import type { HDSRScores } from "@/types/calculator";

const HDSRCalculator: React.FC = () => {
  const [scores, setScores] = useState<HDSRScores>({
    age: 0,
    date_weekday: 0,
    date_day: 0,
    date_month: 0,
    date_year: 0,
    location: 0,
    words_1: 0,
    words_2: 0,
    words_3: 0,
    calc_1: 0,
    calc_2: 0,
    calc_3: 0,
    calc_4: 0,
    calc_5: 0,
    reverse_3digit: 0,
    reverse_4digit: 0,
    recall_1: 0,
    recall_2: 0,
    recall_3: 0,
    items_1: 0,
    items_2: 0,
    items_3: 0,
    items_4: 0,
    items_5: 0,
    vegetables: 0,
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

  const ScoreButton: React.FC<{
    name: keyof HDSRScores;
    value: number;
    currentScore: number;
  }> = ({ name, value, currentScore }) => (
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
      {value}点
    </button>
  );

  return (
    <div className="bg-white border rounded-lg p-6 shadow-md">
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

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-right">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">合計点</h4>
            <p className="text-3xl font-bold text-blue-600">
              {calculateScore()}/30点
            </p>
            <p className="text-sm text-gray-500 mt-2">
              20点以下で認知症が疑われます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HDSRCalculator;
