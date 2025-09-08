import React from 'react';

interface Props {
  label: string;
  value: number;
  max: number;
  endLabel: string;
  color?: string;
}

export default function SimpleProgress({ label, value, max, endLabel, color = '#000' }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between mb-1 text-sm font-medium">
        <span>{label}</span>
        <span>{endLabel}</span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-2"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-2 rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}