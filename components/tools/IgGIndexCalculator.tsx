"use client";

import { useState, useEffect } from "react";

const IgGIndexCalculator: React.FC = () => {
  const [csfIgG, setCsfIgG] = useState<string>("");
  const [csfAlb, setCsfAlb] = useState<string>("");
  const [serumIgG, setSerumIgG] = useState<string>("");
  const [serumAlb, setSerumAlb] = useState<string>("");
  const [iggIndex, setIggIndex] = useState<string>("");
  const [qAlb, setQAlb] = useState<string>("");

  useEffect(() => {
    if (csfIgG && csfAlb && serumIgG && serumAlb) {
      const serumAlbInMgDl = parseFloat(serumAlb) * 1000;
      const index =
        (parseFloat(csfIgG) * serumAlbInMgDl) /
        (parseFloat(csfAlb) * parseFloat(serumIgG));
      const qAlbValue = parseFloat(csfAlb) / serumAlbInMgDl;
      setIggIndex(index.toFixed(2));
      setQAlb((qAlbValue * 1000).toFixed(2)); // Q-Albを1000倍して表示
    } else {
      setIggIndex("");
      setQAlb("");
    }
  }, [csfIgG, csfAlb, serumIgG, serumAlb]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
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
            type="number"
            value={csfIgG}
            onChange={(e) => handleInputChange(e, setCsfIgG)}
            placeholder="0.5-4.0"
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-700">CSF-Alb (mg/dL):</label>
          <input
            type="number"
            value={csfAlb}
            onChange={(e) => handleInputChange(e, setCsfAlb)}
            placeholder="9-30"
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-700">血清-IgG (mg/dL):</label>
          <input
            type="number"
            value={serumIgG}
            onChange={(e) => handleInputChange(e, setSerumIgG)}
            placeholder="870-1700"
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-700">血清-Alb (g/dL):</label>
          <input
            type="number"
            value={serumAlb}
            onChange={(e) => handleInputChange(e, setSerumAlb)}
            placeholder="3.8-5.2"
            className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
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
};

export default IgGIndexCalculator;
