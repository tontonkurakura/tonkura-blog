"use client";

import { useState, useEffect } from "react";
import React from "react";

interface ValidationError {
  csfIgG?: string;
  csfAlb?: string;
  serumIgG?: string;
  serumAlb?: string;
}

export default function IgGIndexCalculator() {
  const [csfIgG, setCsfIgG] = useState<string>("");
  const [csfAlb, setCsfAlb] = useState<string>("");
  const [serumIgG, setSerumIgG] = useState<string>("");
  const [serumAlb, setSerumAlb] = useState<string>("");
  const [iggIndex, setIggIndex] = useState<string>("");
  const [qAlb, setQAlb] = useState<string>("");
  const [errors, setErrors] = useState<ValidationError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 入力値の検証
    const newErrors: ValidationError = {};

    if (touched.csfIgG && csfIgG) {
      const value = parseFloat(csfIgG);
      if (isNaN(value) || value < 0 || value > 100) {
        newErrors.csfIgG = "0〜100の範囲で入力してください";
      }
    }

    if (touched.csfAlb && csfAlb) {
      const value = parseFloat(csfAlb);
      if (isNaN(value) || value < 0 || value > 200) {
        newErrors.csfAlb = "0〜200の範囲で入力してください";
      }
    }

    if (touched.serumIgG && serumIgG) {
      const value = parseFloat(serumIgG);
      if (isNaN(value) || value < 0 || value > 5000) {
        newErrors.serumIgG = "0〜5000の範囲で入力してください";
      }
    }

    if (touched.serumAlb && serumAlb) {
      const value = parseFloat(serumAlb);
      if (isNaN(value) || value < 0 || value > 10) {
        newErrors.serumAlb = "0〜10の範囲で入力してください";
      }
    }

    setErrors(newErrors);

    // エラーがなく、すべての値が入力されている場合に計算
    const hasAllValues = csfIgG && csfAlb && serumIgG && serumAlb;
    const hasNoErrors = Object.keys(newErrors).length === 0;

    if (hasAllValues && hasNoErrors) {
      try {
        const serumAlbInMgDl = parseFloat(serumAlb) * 1000;
        const index =
          (parseFloat(csfIgG) * serumAlbInMgDl) /
          (parseFloat(csfAlb) * parseFloat(serumIgG));
        const qAlbValue = parseFloat(csfAlb) / serumAlbInMgDl;

        if (isNaN(index) || !isFinite(index)) {
          setIggIndex("計算エラー");
        } else {
          setIggIndex(index.toFixed(2));
        }

        if (isNaN(qAlbValue) || !isFinite(qAlbValue)) {
          setQAlb("計算エラー");
        } else {
          setQAlb((qAlbValue * 1000).toFixed(2)); // Q-Albを1000倍して表示
        }
      } catch (error) {
        console.error("計算エラー:", error);
        setIggIndex("計算エラー");
        setQAlb("計算エラー");
      }
    } else {
      setIggIndex("");
      setQAlb("");
    }
  }, [csfIgG, csfAlb, serumIgG, serumAlb, touched]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    field: string
  ) => {
    const value = e.target.value;
    // 数値と小数点のみを許可
    if (value === "" || /^(\d*\.?\d*)$/.test(value)) {
      setter(value);
      setTouched((prev) => ({ ...prev, [field]: true }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // スコアに基づいて色を決定する関数
  const getResultColorClass = () => {
    if (!iggIndex || iggIndex === "計算エラー") return "bg-gray-600";

    const index = parseFloat(iggIndex);
    if (index >= 0.3 && index <= 0.7) return "bg-green-600";
    if (index < 0.3) return "bg-blue-600";
    if (index > 0.7 && index <= 1.0) return "bg-yellow-600";
    return "bg-red-600";
  };

  // 結果のテキストを取得する関数
  const getResultText = () => {
    if (!iggIndex || iggIndex === "計算エラー") return "計算エラー";

    const index = parseFloat(iggIndex);
    if (index >= 0.3 && index <= 0.7) return "正常範囲";
    if (index < 0.3) return "正常下限以下";
    if (index > 0.7 && index <= 1.0) return "軽度上昇";
    return "明らかな上昇";
  };

  // 結果に基づいてテキスト色を決定する関数
  const getResultTextColorClass = (type: string) => {
    if (type === "iggIndex" && iggIndex && iggIndex !== "計算エラー") {
      const index = parseFloat(iggIndex);
      if (index >= 0.3 && index <= 0.7) return "";
      if (index < 0.3) return "text-blue-600";
      if (index > 0.7 && index <= 1.0) return "text-yellow-600";
      return "text-red-600";
    }

    if (type === "qAlb" && qAlb && qAlb !== "計算エラー") {
      const qAlbValue = parseFloat(qAlb);
      if (qAlbValue >= 2.0 && qAlbValue <= 9.0) return "";
      if (qAlbValue < 2.0) return "text-blue-600";
      return "text-red-600";
    }

    return "";
  };

  // 結果に基づいて背景色を決定する関数
  const getResultBgClass = (type: string) => {
    if (type === "iggIndex" && iggIndex && iggIndex !== "計算エラー") {
      const index = parseFloat(iggIndex);
      if (index >= 0.3 && index <= 0.7) return "";
      if (index < 0.3) return "bg-blue-50";
      if (index > 0.7 && index <= 1.0) return "bg-yellow-50";
      return "bg-red-50";
    }

    if (type === "qAlb" && qAlb && qAlb !== "計算エラー") {
      const qAlbValue = parseFloat(qAlb);
      if (qAlbValue >= 2.0 && qAlbValue <= 9.0) return "";
      if (qAlbValue < 2.0) return "bg-blue-50";
      return "bg-red-50";
    }

    return "";
  };

  return (
    <div className="bg-white rounded-lg p-6 relative">
      <h3 className="text-2xl font-bold mb-6 font-mplus">
        IgG Index Calculator
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-2 text-gray-700">CSF-IgG (mg/dL):</label>
          <input
            type="text"
            inputMode="decimal"
            value={csfIgG}
            onChange={(e) => handleInputChange(e, setCsfIgG, "csfIgG")}
            onBlur={() => handleBlur("csfIgG")}
            placeholder="0.5-4.0"
            className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.csfIgG ? "border-red-500" : ""
            }`}
            aria-invalid={!!errors.csfIgG}
            aria-describedby={errors.csfIgG ? "csfIgG-error" : undefined}
          />
          {errors.csfIgG && (
            <p id="csfIgG-error" className="text-red-500 text-sm mt-1">
              {errors.csfIgG}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-gray-700">CSF-Alb (mg/dL):</label>
          <input
            type="text"
            inputMode="decimal"
            value={csfAlb}
            onChange={(e) => handleInputChange(e, setCsfAlb, "csfAlb")}
            onBlur={() => handleBlur("csfAlb")}
            placeholder="9-30"
            className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.csfAlb ? "border-red-500" : ""
            }`}
            aria-invalid={!!errors.csfAlb}
            aria-describedby={errors.csfAlb ? "csfAlb-error" : undefined}
          />
          {errors.csfAlb && (
            <p id="csfAlb-error" className="text-red-500 text-sm mt-1">
              {errors.csfAlb}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-gray-700">血清-IgG (mg/dL):</label>
          <input
            type="text"
            inputMode="decimal"
            value={serumIgG}
            onChange={(e) => handleInputChange(e, setSerumIgG, "serumIgG")}
            onBlur={() => handleBlur("serumIgG")}
            placeholder="870-1700"
            className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.serumIgG ? "border-red-500" : ""
            }`}
            aria-invalid={!!errors.serumIgG}
            aria-describedby={errors.serumIgG ? "serumIgG-error" : undefined}
          />
          {errors.serumIgG && (
            <p id="serumIgG-error" className="text-red-500 text-sm mt-1">
              {errors.serumIgG}
            </p>
          )}
        </div>
        <div>
          <label className="block mb-2 text-gray-700">血清-Alb (g/dL):</label>
          <input
            type="text"
            inputMode="decimal"
            value={serumAlb}
            onChange={(e) => handleInputChange(e, setSerumAlb, "serumAlb")}
            onBlur={() => handleBlur("serumAlb")}
            placeholder="3.8-5.2"
            className={`border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.serumAlb ? "border-red-500" : ""
            }`}
            aria-invalid={!!errors.serumAlb}
            aria-describedby={errors.serumAlb ? "serumAlb-error" : undefined}
          />
          {errors.serumAlb && (
            <p id="serumAlb-error" className="text-red-500 text-sm mt-1">
              {errors.serumAlb}
            </p>
          )}
        </div>
      </div>

      {/* フローティングスコア表示 */}
      {iggIndex && qAlb && (
        <div
          className={`mt-8 sticky bottom-4 z-10 ${getResultColorClass()} bg-opacity-90 text-white p-4 rounded-xl shadow-xl mb-6 flex flex-col sm:flex-row sm:justify-between items-center gap-2`}
        >
          <div className="flex items-center text-xl">
            <span className="font-bold mr-2">IgG Index:</span>
            <span className="text-3xl font-extrabold mx-1">{iggIndex}</span>
            <span className="font-medium">(基準値: 0.3-0.7)</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm">
              <span className="font-medium">
                Q-Alb: {qAlb} ×10³ (基準値: 2.0-9.0)
              </span>
            </div>
            <button
              onClick={() => {
                setCsfIgG("");
                setCsfAlb("");
                setSerumIgG("");
                setSerumAlb("");
                setIggIndex("");
                setQAlb("");
                setErrors({});
                setTouched({});
              }}
              className="px-3 py-1 bg-white bg-opacity-30 hover:bg-opacity-40 rounded-lg text-sm font-medium transition-colors"
            >
              入力をクリア
            </button>
            <div className="sm:border-l sm:border-white sm:pl-4 font-semibold text-lg">
              {getResultText()}
            </div>
          </div>
        </div>
      )}

      {/* 結果表示 */}
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-3 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-2 text-center">計算結果</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div
                className={`flex justify-between p-1.5 rounded ${getResultBgClass("iggIndex")}`}
              >
                <span
                  className={`font-bold ${getResultTextColorClass("iggIndex")}`}
                >
                  IgG Index:
                </span>
                <span
                  className={`font-medium ${getResultTextColorClass("iggIndex")}`}
                >
                  {iggIndex || "-"}
                </span>
              </div>
              <div
                className={`flex justify-between p-1.5 rounded ${getResultBgClass("qAlb")}`}
              >
                <span
                  className={`font-bold ${getResultTextColorClass("qAlb")}`}
                >
                  Q-Alb (×10³):
                </span>
                <span
                  className={`font-medium ${getResultTextColorClass("qAlb")}`}
                >
                  {qAlb || "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm border md:col-span-2">
            <h3 className="font-semibold mb-2 text-center">評価基準</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div
                className={`p-2 rounded ${
                  iggIndex && parseFloat(iggIndex) < 0.3
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">IgG Index &lt; 0.3:</span>{" "}
                正常下限以下
              </div>
              <div
                className={`p-2 rounded ${
                  iggIndex &&
                  parseFloat(iggIndex) >= 0.3 &&
                  parseFloat(iggIndex) <= 0.7
                    ? "bg-green-100 text-green-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">IgG Index 0.3-0.7:</span>{" "}
                正常範囲
              </div>
              <div
                className={`p-2 rounded ${
                  iggIndex &&
                  parseFloat(iggIndex) > 0.7 &&
                  parseFloat(iggIndex) <= 1.0
                    ? "bg-yellow-100 text-yellow-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">IgG Index 0.7-1.0:</span>{" "}
                軽度上昇
              </div>
              <div
                className={`p-2 rounded ${
                  iggIndex && parseFloat(iggIndex) > 1.0
                    ? "bg-red-100 text-red-800 font-medium"
                    : "bg-gray-50"
                }`}
              >
                <span className="font-semibold">IgG Index &gt; 1.0:</span>{" "}
                明らかな上昇（髄腔内IgG産生亢進）
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600 mt-4">
          <p>
            ※注意事項
            <li className="ml-3 text-sm text-gray-600">
              本ツールは、臨床業務で使用されるスコアの計算補助を行うためのものです。
            </li>
            <li className="ml-3 text-sm text-gray-600">
              本ツールの利用により生じた如何なる結果についても、当サイトは責任を負いかねます。
            </li>
          </p>
        </div>
      </div>
    </div>
  );
}
