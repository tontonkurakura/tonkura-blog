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

  return (
    <div className="bg-white border rounded-lg p-6 shadow-md">
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
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-700">IgG Index</h4>
            <p className="text-2xl font-bold text-blue-600">
              {iggIndex || "-"}
            </p>
            <p className="text-sm text-gray-500">基準値: 0.3-0.7</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-700">
              Q-Alb (×10³)
            </h4>
            <p className="text-2xl font-bold text-blue-600">{qAlb || "-"}</p>
            <p className="text-sm text-gray-500">基準値: 2.0-9.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
