"use client";

import { useState } from "react";
import React from "react";
import type { NIHSSScores } from "@/types/calculator";

export default function NIHSSCalculator() {
  const [scores, setScores] = useState<NIHSSScores>({
    totalScore: 0,
    consciousness_level: 0,
    consciousness_questions: 0,
    consciousness_commands: 0,
    gaze: 0,
    visual_fields: 0,
    facial_palsy: 0,
    left_arm_motor: 0,
    right_arm_motor: 0,
    left_leg_motor: 0,
    right_leg_motor: 0,
    limb_ataxia: 0,
    sensory: 0,
    language: 0,
    dysarthria: 0,
    neglect: 0,
  });

  // Nボタンが選択されているかどうかを追跡する状態
  const [nSelected, setNSelected] = useState<{
    left_arm_motor: boolean;
    right_arm_motor: boolean;
    left_leg_motor: boolean;
    right_leg_motor: boolean;
    limb_ataxia: boolean;
  }>({
    left_arm_motor: false,
    right_arm_motor: false,
    left_leg_motor: false,
    right_leg_motor: false,
    limb_ataxia: false,
  });

  const handleChange = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const name = button.getAttribute("data-name") as keyof NIHSSScores;
    const value = parseInt(button.value, 10);
    const isN = button.getAttribute("data-is-n") === "true";

    // Nボタンの状態を更新
    if (
      name === "left_arm_motor" ||
      name === "right_arm_motor" ||
      name === "left_leg_motor" ||
      name === "right_leg_motor" ||
      name === "limb_ataxia"
    ) {
      // Nボタンがクリックされた場合
      if (isN) {
        // Nボタンを選択状態にし、スコアを0に設定
        setNSelected((prev) => ({
          ...prev,
          [name]: true,
        }));
        setScores((prevScores) => ({
          ...prevScores,
          [name]: 0,
        }));
      } else {
        // 通常のスコアボタンがクリックされた場合、Nボタンの選択を解除
        setNSelected((prev) => ({
          ...prev,
          [name]: false,
        }));
        setScores((prevScores) => ({
          ...prevScores,
          [name]: value,
        }));
      }
    } else {
      // Nボタンがない項目の場合は通常通り処理
      setScores((prevScores) => ({
        ...prevScores,
        [name]: value,
      }));
    }
  };

  // 全ての選択をリセットする関数
  const handleReset = () => {
    setScores({
      totalScore: 0,
      consciousness_level: 0,
      consciousness_questions: 0,
      consciousness_commands: 0,
      gaze: 0,
      visual_fields: 0,
      facial_palsy: 0,
      left_arm_motor: 0,
      right_arm_motor: 0,
      left_leg_motor: 0,
      right_leg_motor: 0,
      limb_ataxia: 0,
      sensory: 0,
      language: 0,
      dysarthria: 0,
      neglect: 0,
    });
    setNSelected({
      left_arm_motor: false,
      right_arm_motor: false,
      left_leg_motor: false,
      right_leg_motor: false,
      limb_ataxia: false,
    });
  };

  const calculateScore = (): number => {
    return (
      scores.consciousness_level +
      scores.consciousness_questions +
      scores.consciousness_commands +
      scores.gaze +
      scores.visual_fields +
      scores.facial_palsy +
      scores.left_arm_motor +
      scores.right_arm_motor +
      scores.left_leg_motor +
      scores.right_leg_motor +
      scores.limb_ataxia +
      scores.sensory +
      scores.language +
      scores.dysarthria +
      scores.neglect
    );
  };

  // 各カテゴリーのスコアを計算する関数
  const calculateCategoryScores = () => {
    return {
      consciousness_level: scores.consciousness_level, // 1a. 意識水準
      consciousness_questions: scores.consciousness_questions, // 1b. 意識水準-質問
      consciousness_commands: scores.consciousness_commands, // 1c. 意識水準-従命
      gaze: scores.gaze, // 2. 最良の注視
      visual_fields: scores.visual_fields, // 3. 視野
      facial_palsy: scores.facial_palsy, // 4. 顔面麻痺
      left_arm_motor: scores.left_arm_motor, // 5-1. 上肢の運動（左）
      right_arm_motor: scores.right_arm_motor, // 5-2. 上肢の運動（右）
      left_leg_motor: scores.left_leg_motor, // 6-1. 下肢の運動（左）
      right_leg_motor: scores.right_leg_motor, // 6-2. 下肢の運動（右）
      limb_ataxia: scores.limb_ataxia, // 7. 運動失調
      sensory: scores.sensory, // 8. 感覚
      language: scores.language, // 9. 最良の言語
      dysarthria: scores.dysarthria, // 10. 構音障害
      neglect: scores.neglect, // 11. 消去現象と注意障害
    };
  };

  // 選択された項目数を計算
  const calculateSelectedItems = (): number => {
    let count = 0;
    Object.entries(scores).forEach(([key, value]) => {
      // Nが選択されている場合はカウントしない
      if (
        (key === "left_arm_motor" ||
          key === "right_arm_motor" ||
          key === "left_leg_motor" ||
          key === "right_leg_motor" ||
          key === "limb_ataxia") &&
        nSelected[key as keyof typeof nSelected]
      ) {
        // Nが選択されている場合はカウントしない
        return;
      }

      // スコアが0より大きい場合はカウント
      if (value > 0) count++;
    });
    return count;
  };

  function ScoreButton({
    name,
    value,
    currentScore,
    label,
    isN = false,
  }: {
    name: keyof NIHSSScores;
    value: number;
    currentScore: number;
    label?: string;
    isN?: boolean;
  }) {
    // Nが選択されているかどうかを確認
    const isNSelected =
      name in nSelected && nSelected[name as keyof typeof nSelected];

    // ボタンがアクティブかどうかを判断
    const isActive = isN ? isNSelected : currentScore === value && !isNSelected;

    return (
      <button
        data-name={name}
        value={value}
        data-is-n={isN}
        onClick={handleChange}
        className={`border rounded px-3 py-1.5 transition-colors ${isActive
            ? "bg-blue-600 text-white border-blue-600"
            : "hover:bg-gray-100 border-gray-300"
          }`}
      >
        {label || value}
      </button>
    );
  }

  const totalScore = calculateScore();
  const categoryScores = calculateCategoryScores();
  const selectedItems = calculateSelectedItems();

  // スコアに基づいて色を決定する関数
  const getScoreColorClass = () => {
    if (totalScore === 0) return "bg-blue-600";
    if (totalScore >= 1 && totalScore <= 4) return "bg-green-600";
    if (totalScore >= 5 && totalScore <= 15) return "bg-yellow-600";
    if (totalScore >= 16 && totalScore <= 20) return "bg-orange-600";
    return "bg-red-600";
  };

  // 重症度のテキストを取得する関数
  const getSeverityText = () => {
    if (totalScore === 0) return "脳卒中症状なし";
    if (totalScore >= 1 && totalScore <= 4) return "軽症脳卒中";
    if (totalScore >= 5 && totalScore <= 15) return "中等度脳卒中";
    if (totalScore >= 16 && totalScore <= 20) return "中等度～重症脳卒中";
    return "重症脳卒中";
  };

  // カテゴリーごとのスコアに基づいて色を決定する関数
  const getCategoryScoreColorClass = (score: number, maxScore: number) => {
    if (score === 0) return ""; // 0点の場合は色を付けない
    const ratio = score / maxScore;
    if (ratio <= 0.4) return ""; // 40%以下は無色
    if (ratio <= 0.7) return "text-orange-600"; // 40-70%はオレンジ
    return "text-red-600"; // 70%超は赤
  };

  // カテゴリーごとのスコアに基づいて背景色を決定する関数
  const getCategoryScoreBgClass = (score: number, maxScore: number) => {
    if (score === 0) return ""; // 0点の場合は色を付けない
    const ratio = score / maxScore;
    if (ratio <= 0.4) return ""; // 40%以下は無色
    if (ratio <= 0.7) return "bg-orange-50"; // 40-70%はオレンジ
    return "bg-red-50"; // 70%超は赤
  };

  return (
    <div className="bg-white rounded-lg p-6 relative">
      <div className="flex flex-col gap-6">
        {/* 1a. 意識水準 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            1a. 意識水準
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：完全覚醒
                <br />
                1：簡単な刺激で覚醒
                <br />
                2：繰り返し刺激、強い刺激で覚醒
                <br />
                3：完全に無反応
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="consciousness_level"
              value={0}
              currentScore={scores.consciousness_level}
            />
            <ScoreButton
              name="consciousness_level"
              value={1}
              currentScore={scores.consciousness_level}
            />
            <ScoreButton
              name="consciousness_level"
              value={2}
              currentScore={scores.consciousness_level}
            />
            <ScoreButton
              name="consciousness_level"
              value={3}
              currentScore={scores.consciousness_level}
            />
          </div>
        </div>

        {/* 1b. 意識障害―質問 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            1b. 意識障害―質問（今月の月名及び年齢）
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：両方正解
                <br />
                1：片方正解
                <br />
                2：両方不正解
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="consciousness_questions"
              value={0}
              currentScore={scores.consciousness_questions}
            />
            <ScoreButton
              name="consciousness_questions"
              value={1}
              currentScore={scores.consciousness_questions}
            />
            <ScoreButton
              name="consciousness_questions"
              value={2}
              currentScore={scores.consciousness_questions}
            />
          </div>
        </div>

        {/* 1c. 意識障害―従命 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            1c. 意識障害―従命（開閉眼、「手を握る・開く」）
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：両方可
                <br />
                1：片方可
                <br />
                2：両方不可
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="consciousness_commands"
              value={0}
              currentScore={scores.consciousness_commands}
            />
            <ScoreButton
              name="consciousness_commands"
              value={1}
              currentScore={scores.consciousness_commands}
            />
            <ScoreButton
              name="consciousness_commands"
              value={2}
              currentScore={scores.consciousness_commands}
            />
          </div>
        </div>

        {/* 2. 最良の注視 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            2. 最良の注視
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：正常
                <br />
                1：部分的注視麻痺
                <br />
                2：完全注視麻痺
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton name="gaze" value={0} currentScore={scores.gaze} />
            <ScoreButton name="gaze" value={1} currentScore={scores.gaze} />
            <ScoreButton name="gaze" value={2} currentScore={scores.gaze} />
          </div>
        </div>

        {/* 3. 視野 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            3. 視野
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：視野欠損なし
                <br />
                1：部分的半盲
                <br />
                2：完全半盲
                <br />
                3：両側性半盲
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="visual_fields"
              value={0}
              currentScore={scores.visual_fields}
            />
            <ScoreButton
              name="visual_fields"
              value={1}
              currentScore={scores.visual_fields}
            />
            <ScoreButton
              name="visual_fields"
              value={2}
              currentScore={scores.visual_fields}
            />
            <ScoreButton
              name="visual_fields"
              value={3}
              currentScore={scores.visual_fields}
            />
          </div>
        </div>

        {/* 4. 顔面麻痺 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            4. 顔面麻痺
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：正常
                <br />
                1：軽度の麻痺
                <br />
                2：部分的麻痺
                <br />
                3：完全麻痺
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="facial_palsy"
              value={0}
              currentScore={scores.facial_palsy}
            />
            <ScoreButton
              name="facial_palsy"
              value={1}
              currentScore={scores.facial_palsy}
            />
            <ScoreButton
              name="facial_palsy"
              value={2}
              currentScore={scores.facial_palsy}
            />
            <ScoreButton
              name="facial_palsy"
              value={3}
              currentScore={scores.facial_palsy}
            />
          </div>
        </div>

        {/* 5-1. 上肢の運動（左） */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            5-1. 上肢の運動（左）※仰臥位のときは45度挙上
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：90度を10秒間保持可能（下垂なし）
                <br />
                1：90度を保持できるが、10秒以内に下垂
                <br />
                2：90度の挙上または保持ができない
                <br />
                3：重力に抗して動かない
                <br />
                4：全く動きがみられない
                <br />
                N：切断、関節癒合
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="left_arm_motor"
              value={0}
              currentScore={scores.left_arm_motor}
              isN={true}
              label="N"
            />
            <ScoreButton
              name="left_arm_motor"
              value={0}
              currentScore={scores.left_arm_motor}
            />
            <ScoreButton
              name="left_arm_motor"
              value={1}
              currentScore={scores.left_arm_motor}
            />
            <ScoreButton
              name="left_arm_motor"
              value={2}
              currentScore={scores.left_arm_motor}
            />
            <ScoreButton
              name="left_arm_motor"
              value={3}
              currentScore={scores.left_arm_motor}
            />
            <ScoreButton
              name="left_arm_motor"
              value={4}
              currentScore={scores.left_arm_motor}
            />
          </div>
        </div>

        {/* 5-2. 上肢の運動（右） */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            5-2. 上肢の運動（右）※仰臥位のときは45度挙上
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：90度を10秒間保持可能（下垂なし）
                <br />
                1：90度を保持できるが、10秒以内に下垂
                <br />
                2：90度の挙上または保持ができない
                <br />
                3：重力に抗して動かない
                <br />
                4：全く動きがみられない
                <br />
                N：切断、関節癒合
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="right_arm_motor"
              value={0}
              currentScore={scores.right_arm_motor}
              isN={true}
              label="N"
            />
            <ScoreButton
              name="right_arm_motor"
              value={0}
              currentScore={scores.right_arm_motor}
            />
            <ScoreButton
              name="right_arm_motor"
              value={1}
              currentScore={scores.right_arm_motor}
            />
            <ScoreButton
              name="right_arm_motor"
              value={2}
              currentScore={scores.right_arm_motor}
            />
            <ScoreButton
              name="right_arm_motor"
              value={3}
              currentScore={scores.right_arm_motor}
            />
            <ScoreButton
              name="right_arm_motor"
              value={4}
              currentScore={scores.right_arm_motor}
            />
          </div>
        </div>

        {/* 6-1. 下肢の運動（左） */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            6-1. 下肢の運動（左）
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：30度を5秒間保持できる（下垂なし）
                <br />
                1：30度を保持できるが、5秒以内に下垂
                <br />
                2：重力に抗して動きがみられる
                <br />
                3：重力に抗して動かない
                <br />
                4：全く動きがみられない
                <br />
                N：切断、関節癒合
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="left_leg_motor"
              value={0}
              currentScore={scores.left_leg_motor}
              isN={true}
              label="N"
            />
            <ScoreButton
              name="left_leg_motor"
              value={0}
              currentScore={scores.left_leg_motor}
            />
            <ScoreButton
              name="left_leg_motor"
              value={1}
              currentScore={scores.left_leg_motor}
            />
            <ScoreButton
              name="left_leg_motor"
              value={2}
              currentScore={scores.left_leg_motor}
            />
            <ScoreButton
              name="left_leg_motor"
              value={3}
              currentScore={scores.left_leg_motor}
            />
            <ScoreButton
              name="left_leg_motor"
              value={4}
              currentScore={scores.left_leg_motor}
            />
          </div>
        </div>

        {/* 6-2. 下肢の運動（右） */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            6-2. 下肢の運動（右）
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：30度を5秒間保持できる（下垂なし）
                <br />
                1：30度を保持できるが、5秒以内に下垂
                <br />
                2：重力に抗して動きがみられる
                <br />
                3：重力に抗して動かない
                <br />
                4：全く動きがみられない
                <br />
                N：切断、関節癒合
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="right_leg_motor"
              value={0}
              currentScore={scores.right_leg_motor}
              isN={true}
              label="N"
            />
            <ScoreButton
              name="right_leg_motor"
              value={0}
              currentScore={scores.right_leg_motor}
            />
            <ScoreButton
              name="right_leg_motor"
              value={1}
              currentScore={scores.right_leg_motor}
            />
            <ScoreButton
              name="right_leg_motor"
              value={2}
              currentScore={scores.right_leg_motor}
            />
            <ScoreButton
              name="right_leg_motor"
              value={3}
              currentScore={scores.right_leg_motor}
            />
            <ScoreButton
              name="right_leg_motor"
              value={4}
              currentScore={scores.right_leg_motor}
            />
          </div>
        </div>

        {/* 7. 運動失調 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            7. 運動失調
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：なし
                <br />
                1：1肢
                <br />
                2：2肢
                <br />
                N：切断、関節癒合
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="limb_ataxia"
              value={0}
              currentScore={scores.limb_ataxia}
              isN={true}
              label="N"
            />
            <ScoreButton
              name="limb_ataxia"
              value={0}
              currentScore={scores.limb_ataxia}
            />
            <ScoreButton
              name="limb_ataxia"
              value={1}
              currentScore={scores.limb_ataxia}
            />
            <ScoreButton
              name="limb_ataxia"
              value={2}
              currentScore={scores.limb_ataxia}
            />
          </div>
        </div>

        {/* 8. 感覚 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            8. 感覚
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：障害なし
                <br />
                1：軽度から中等度
                <br />
                2：重度から完全
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="sensory"
              value={0}
              currentScore={scores.sensory}
            />
            <ScoreButton
              name="sensory"
              value={1}
              currentScore={scores.sensory}
            />
            <ScoreButton
              name="sensory"
              value={2}
              currentScore={scores.sensory}
            />
          </div>
        </div>

        {/* 9. 最良の言語 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            9. 最良の言語
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：失語なし
                <br />
                1：軽度から中等度
                <br />
                2：重度の失語
                <br />
                3：無言、全失語
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="language"
              value={0}
              currentScore={scores.language}
            />
            <ScoreButton
              name="language"
              value={1}
              currentScore={scores.language}
            />
            <ScoreButton
              name="language"
              value={2}
              currentScore={scores.language}
            />
            <ScoreButton
              name="language"
              value={3}
              currentScore={scores.language}
            />
          </div>
        </div>

        {/* 10. 構音障害 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            10. 構音障害
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：正常
                <br />
                1：軽度から中等度
                <br />
                2：重度
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="dysarthria"
              value={0}
              currentScore={scores.dysarthria}
            />
            <ScoreButton
              name="dysarthria"
              value={1}
              currentScore={scores.dysarthria}
            />
            <ScoreButton
              name="dysarthria"
              value={2}
              currentScore={scores.dysarthria}
            />
          </div>
        </div>

        {/* 11. 消去現象と注意障害 */}
        <div>
          <label className="block mb-2 text-gray-700 font-medium">
            11. 消去現象と注意障害
            <div className="ml-4 text-gray-700 font-normal">
              <div className="text-sm text-gray-500 mt-1">
                0：異常なし
                <br />
                1：視覚、触覚、聴覚、視空間、または自己身体に対する不注意、あるいは1つの感覚様式で2点同時刺激に対する消去現象
                <br />
                2：重度の半側不注意あるいは2つ以上の感覚様式に対する半側不注意
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2">
            <ScoreButton
              name="neglect"
              value={0}
              currentScore={scores.neglect}
            />
            <ScoreButton
              name="neglect"
              value={1}
              currentScore={scores.neglect}
            />
            <ScoreButton
              name="neglect"
              value={2}
              currentScore={scores.neglect}
            />
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
          <span className="font-medium">/42</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm">
            <span className="font-medium">{selectedItems}/15 項目選択済み</span>
          </div>
          <button
            onClick={handleReset}
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
      <div className="mt-8 space-y-4">
        {/* 重症度分類（上部に配置） */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-3 text-center">重症度分類</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div
              className={`p-3 rounded ${totalScore === 0 ? "bg-blue-100 text-blue-800 font-medium" : "bg-gray-50"}`}
            >
              <div className="font-semibold text-sm text-center">
                0点
                <br />
                No stroke symptoms
              </div>
              <div className="text-xs mt-1 text-center">（脳卒中症状なし）</div>
            </div>
            <div
              className={`p-3 rounded ${totalScore >= 1 && totalScore <= 4 ? "bg-green-100 text-green-800 font-medium" : "bg-gray-50"}`}
            >
              <div className="font-semibold text-sm text-center">
                1-4点
                <br />
                Minor stroke
              </div>
              <div className="text-xs mt-1 text-center">（軽症脳卒中）</div>
            </div>
            <div
              className={`p-3 rounded ${totalScore >= 5 && totalScore <= 15 ? "bg-yellow-100 text-yellow-800 font-medium" : "bg-gray-50"}`}
            >
              <div className="font-semibold text-sm text-center">
                5-15点
                <br />
                Moderate stroke
              </div>
              <div className="text-xs mt-1 text-center">（中等度脳卒中）</div>
            </div>
            <div
              className={`p-3 rounded ${totalScore >= 16 ? "bg-red-100 text-red-800 font-medium" : "bg-gray-50"}`}
            >
              <div className="font-semibold text-sm text-center">
                16点以上
                <br />
                Severe stroke
              </div>
              <div className="text-xs mt-1 text-center">（重症脳卒中）</div>
            </div>
          </div>
        </div>

        {/* カテゴリー別スコア */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-3 text-center">カテゴリー別スコア</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-0 gap-y-1 text-xs divide-x divide-gray-200">
            <div className="px-6">
              {[
                { key: "consciousness_level", label: "1a. 意識水準", max: 3 },
                {
                  key: "consciousness_questions",
                  label: "1b. 意識水準-質問",
                  max: 2,
                },
                {
                  key: "consciousness_commands",
                  label: "1c. 意識水準-従命",
                  max: 2,
                },
                { key: "gaze", label: "2. 最良の注視", max: 2 },
                { key: "visual_fields", label: "3. 視野", max: 3 },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center p-1 rounded ${getCategoryScoreBgClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                >
                  <span
                    className={`font-medium min-w-[7.5rem] ${getCategoryScoreColorClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`ml-auto tabular-nums ${getCategoryScoreColorClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                  >
                    {categoryScores[item.key as keyof typeof categoryScores]}/
                    {item.max}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-6">
              {[
                { key: "facial_palsy", label: "4. 顔面麻痺", max: 3 },
                {
                  key: "left_arm_motor",
                  label: "5-1. 上肢の運動（左）",
                  max: 4,
                },
                {
                  key: "right_arm_motor",
                  label: "5-2. 上肢の運動（右）",
                  max: 4,
                },
                {
                  key: "left_leg_motor",
                  label: "6-1. 下肢の運動（左）",
                  max: 4,
                },
                {
                  key: "right_leg_motor",
                  label: "6-2. 下肢の運動（右）",
                  max: 4,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center p-1 rounded ${getCategoryScoreBgClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                >
                  <span
                    className={`font-medium min-w-[7.5rem] ${getCategoryScoreColorClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`ml-auto tabular-nums ${getCategoryScoreColorClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                  >
                    {categoryScores[item.key as keyof typeof categoryScores]}/
                    {item.max}
                  </span>
                </div>
              ))}
            </div>
            <div className="px-6">
              {[
                { key: "limb_ataxia", label: "7. 運動失調", max: 2 },
                { key: "sensory", label: "8. 感覚", max: 2 },
                { key: "language", label: "9. 最良の言語", max: 3 },
                { key: "dysarthria", label: "10. 構音障害", max: 2 },
                { key: "neglect", label: "11. 消去現象と注意障害", max: 2 },
              ].map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center p-1 rounded ${getCategoryScoreBgClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                >
                  <span
                    className={`font-medium min-w-[7.5rem] ${getCategoryScoreColorClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                  >
                    {item.label}
                  </span>
                  <span
                    className={`ml-auto tabular-nums ${getCategoryScoreColorClass(categoryScores[item.key as keyof typeof categoryScores], item.max)}`}
                  >
                    {categoryScores[item.key as keyof typeof categoryScores]}/
                    {item.max}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
