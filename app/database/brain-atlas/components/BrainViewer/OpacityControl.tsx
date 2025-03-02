'use client';

import { ChangeEvent } from 'react';

interface OpacityControlProps {
  value: number;
  onChange: (value: number) => void;
}

export default function OpacityControl({ value, onChange }: OpacityControlProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium">背景の不透明度</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={value}
        onChange={handleChange}
        className="flex-1"
      />
      <span className="text-sm">{Math.round(value * 100)}%</span>
    </div>
  );
} 