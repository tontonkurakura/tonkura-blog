"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

// データの型定義
interface BrodmannArea {
  area: string;
  name: string;
  function: string;
}

interface QuizQuestion {
  correctItem: BrodmannArea;
  options: BrodmannArea[];
}

export default function BrodmannAreasPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, area, name
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizMode, setQuizMode] = useState<"area" | "name" | "function">(
    "area"
  );
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  // JSONから読み込むためのstate
  const [brodmannData, setBrodmannData] = useState<BrodmannArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // JSONファイルからデータを読み込む
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 領域データの読み込み
        const areasResponse = await fetch("/data/brodmann/areas.json");
        const areasData = await areasResponse.json();
        setBrodmannData(areasData);

        setIsLoading(false);
      } catch (error) {
        console.error("データの読み込みに失敗しました", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // 検索条件に基づいてデータをフィルタリング
  const filteredData = brodmannData.filter((item) => {
    if (searchTerm === "") return true;

    const term = searchTerm.toLowerCase();

    if (filterType === "area") {
      return item.area.toLowerCase().includes(term);
    } else if (filterType === "name") {
      return item.name.toLowerCase().includes(term);
    } else {
      return (
        item.area.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term)
      );
    }
  });

  // 新しい問題を生成する関数
  const generateNewQuestion = useCallback(() => {
    if (brodmannData.length === 0) return;

    setIsCorrect(null);
    setSelectedAnswer(null);

    // 機能モードの場合は詳細情報のある領域からのみ選択
    let availableAreas = brodmannData;
    if (quizMode === "function") {
      // 詳細情報があり、functionフィールドを持つ領域のみフィルタリング
      const areasWithFunction = brodmannData.filter((area) => area.function);

      if (areasWithFunction.length > 0) {
        availableAreas = areasWithFunction;
      }
    }

    // ランダムな正解項目を選択
    const correctIndex = Math.floor(Math.random() * availableAreas.length);
    const correctItem = availableAreas[correctIndex];

    // ランダムな不正解の選択肢を3つ選ぶ
    let options = [correctItem];
    while (options.length < 4) {
      const randomIndex = Math.floor(Math.random() * availableAreas.length);
      const randomItem = availableAreas[randomIndex];

      // 重複しないように確認
      if (
        !options.some((item) => {
          if (quizMode === "area" || quizMode === "function") {
            return item.area === randomItem.area;
          } else {
            return item.name === randomItem.name;
          }
        })
      ) {
        options.push(randomItem);
      }
    }

    // 選択肢をシャッフル
    options = options.sort(() => Math.random() - 0.5);

    // 問題を設定
    setCurrentQuestion({
      correctItem,
      options,
    });
  }, [brodmannData, quizMode]);

  // クイズモードの切り替え時に新しい問題を生成
  useEffect(() => {
    if (showQuiz && !isLoading && brodmannData.length > 0) {
      generateNewQuestion();
    }
  }, [showQuiz, quizMode, isLoading, brodmannData, generateNewQuestion]);

  // 回答をチェックする関数
  const checkAnswer = (answer: string) => {
    if (!currentQuestion) return;

    setSelectedAnswer(answer);

    // 修正: 比較時に全角スペースや余分な空白を削除し、大文字小文字の違いを無視して比較
    const normalizeString = (str: string) => {
      return str.trim().toLowerCase().replace(/\s+/g, " ");
    };

    const isAnswerCorrect =
      quizMode === "area" || quizMode === "function"
        ? normalizeString(answer) ===
        normalizeString(currentQuestion.correctItem.name)
        : normalizeString(answer) ===
        normalizeString(currentQuestion.correctItem.area);

    setIsCorrect(isAnswerCorrect);
    setScore((prev) => ({
      correct: prev.correct + (isAnswerCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-lg text-gray-600">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

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
          ブロードマン脳地図データベース
        </h1>
        <p className="text-gray-600 mb-4">
          ブロードマン脳地図は、1909年にドイツの神経解剖学者コルビニアン・ブロードマンが提唱した大脳皮質の区分法です。
          大脳皮質を細胞構築学的特徴に基づいて、52の領域（ブロードマン領域）に分類しています。
        </p>

        {/* クイズモードと検索モードの切り替えボタン */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setShowQuiz(false)}
            className={`px-4 py-2 rounded-md ${!showQuiz
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            データベース検索
          </button>
          <button
            onClick={() => setShowQuiz(true)}
            className={`px-4 py-2 rounded-md ${showQuiz
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            ブロードマン領域クイズ
          </button>
        </div>
      </div>

      {showQuiz ? (
        // クイズモード
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">ブロードマン領域クイズ</h2>

          {/* クイズモード選択 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setQuizMode("area")}
                className={`px-4 py-2 rounded-md ${quizMode === "area"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                領域番号から名称を答える
              </button>
              <button
                onClick={() => setQuizMode("name")}
                className={`px-4 py-2 rounded-md ${quizMode === "name"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                名称から領域番号を答える
              </button>
              <button
                onClick={() => setQuizMode("function")}
                className={`px-4 py-2 rounded-md ${quizMode === "function"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
              >
                機能から領域を答える
              </button>
            </div>
          </div>

          {/* スコア表示 */}
          <div className="mb-4 bg-gray-100 p-3 rounded-md">
            <p className="font-semibold">
              スコア: {score.correct} / {score.total}
              {score.total > 0 &&
                ` (${Math.round((score.correct / score.total) * 100)}%)`}
            </p>
          </div>

          {/* 問題表示 */}
          {currentQuestion && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                {quizMode === "area"
                  ? `ブロードマン領域「${currentQuestion.correctItem.area}」の名称は何でしょう？`
                  : quizMode === "name"
                    ? `「${currentQuestion.correctItem.name}」はどのブロードマン領域でしょう？`
                    : `この機能を持つブロードマン領域の名称は何でしょう？\n「${brodmannData.find(
                      (item) =>
                        item.area === currentQuestion.correctItem.area
                    )?.function || "機能情報がありません"
                    }」`}
              </h3>

              {/* 選択肢 */}
              <div className="grid gap-3">
                {currentQuestion.options.map(
                  (option: BrodmannArea, index: number) => {
                    const optionValue =
                      quizMode === "area" ? option.name : option.area;
                    const correctValue =
                      quizMode === "area"
                        ? currentQuestion.correctItem.name
                        : currentQuestion.correctItem.area;

                    // 正規化関数（上と同じ）
                    const normalizeString = (str: string) => {
                      return str.trim().toLowerCase().replace(/\s+/g, " ");
                    };

                    // 選択した回答の正規化値
                    const normalizedSelected = selectedAnswer
                      ? normalizeString(selectedAnswer)
                      : null;
                    // このオプションの正規化値
                    const normalizedOption = normalizeString(optionValue);
                    // 正解の正規化値
                    const normalizedCorrect = normalizeString(correctValue);

                    // このオプションが選択されたものか
                    const isSelected = normalizedSelected === normalizedOption;
                    // このオプションが正解か
                    const isThisCorrect =
                      normalizedOption === normalizedCorrect;

                    return (
                      <button
                        key={index}
                        onClick={() => checkAnswer(optionValue)}
                        disabled={selectedAnswer !== null}
                        className={`p-3 rounded text-left ${isSelected
                            ? isCorrect
                              ? "bg-green-100 border-2 border-green-500"
                              : "bg-red-100 border-2 border-red-500"
                            : selectedAnswer !== null && isThisCorrect
                              ? "bg-green-100 border-2 border-green-500"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                      >
                        {optionValue}
                      </button>
                    );
                  }
                )}
              </div>

              {/* 回答結果表示 */}
              {selectedAnswer && (
                <div
                  className={`mt-4 p-4 rounded ${isCorrect ? "bg-green-100" : "bg-red-100"}`}
                >
                  <p className="font-semibold">
                    {isCorrect ? "正解です！" : "不正解です。"}
                  </p>
                  <p>
                    正解:{" "}
                    {quizMode === "area" || quizMode === "function"
                      ? currentQuestion.correctItem.name
                      : currentQuestion.correctItem.area}
                  </p>
                  {!isCorrect && <p>あなたの回答: {selectedAnswer}</p>}

                  {/* 正解時に機能情報を表示 */}
                  {isCorrect &&
                    brodmannData.find(
                      (item) => item.area === currentQuestion.correctItem.area
                    )?.function &&
                    quizMode !== "function" && (
                      <div className="mt-2 p-3 bg-blue-50 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">機能:</span>{" "}
                          {
                            brodmannData.find(
                              (item) =>
                                item.area === currentQuestion.correctItem.area
                            )?.function
                          }
                        </p>
                      </div>
                    )}
                </div>
              )}

              {/* 次の問題ボタン */}
              {selectedAnswer && (
                <button
                  onClick={generateNewQuestion}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  次の問題へ
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        // データベース検索モード
        <>
          {/* 検索機能 */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="検索..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="filterType"
                    value="all"
                    checked={filterType === "all"}
                    onChange={() => setFilterType("all")}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">すべて</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="radio"
                    name="filterType"
                    value="area"
                    checked={filterType === "area"}
                    onChange={() => setFilterType("area")}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">領域番号</span>
                </label>
                <label className="inline-flex items-center ml-4">
                  <input
                    type="radio"
                    name="filterType"
                    value="name"
                    checked={filterType === "name"}
                    onChange={() => setFilterType("name")}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">名称</span>
                </label>
              </div>
            </div>
          </div>

          {/* 領域一覧テーブル */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ブロードマン領域
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      機能
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item, index) => {
                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.area}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {item.function || "情報なし"}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        該当する領域が見つかりませんでした
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                全 {brodmannData.length} 領域中 {filteredData.length} 領域表示
              </p>
            </div>
          </div>
        </>
      )}

      {/* 追加情報 */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">ブロードマン領域について</h2>
        <p className="mb-4">
          ブロードマン脳地図は、神経科学や神経解剖学において広く用いられており、脳の機能局在の理解や脳損傷の診断に役立てられています。
          例えば、ブロードマン領域44・45は「ブローカ野」として知られ、言語の産生に重要な役割を果たしています。
        </p>
        <p className="mb-4">
          現代の脳画像技術の発展により、ブロードマン脳地図はさらに詳細化・再定義されていますが、
          ブロードマンの分類は依然として脳科学の基礎的枠組みとして重要です。
        </p>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            注意:
            このデータベースは教育目的で提供されています。診断や臨床判断の根拠としては使用しないでください。
          </p>
        </div>
      </div>
    </div>
  );
}
