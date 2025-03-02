'use client';

import { ChangeEvent } from 'react';

interface SliceViewerProps {
  title: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export default function SliceViewer({
  title,
  value,
  min,
  max,
  onChange
}: SliceViewerProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{title}</label>
        <span className="text-sm">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
} 