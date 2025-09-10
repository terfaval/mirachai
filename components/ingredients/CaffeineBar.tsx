import React from 'react';

interface Props {
  value: number;
  color: string;
}

export default function CaffeineBar({ value, color }: Props) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-2">
      <div
        className="relative w-full h-16 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Koffein tartalom"
      >
        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <div className="text-center" style={{ color }}>
        <div className="text-lg font-bold leading-none">{Math.round(pct)}%</div>
        <div className="text-xs leading-none">koffein tartalom</div>
      </div>
    </div>
  );
}
