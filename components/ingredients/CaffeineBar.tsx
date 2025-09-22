import React from "react";

interface Props {
  value: number; // 0..100
  color?: string;
}

export default function CaffeineBar({ value, color }: Props) {
  const pct = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const barColor = color && typeof color === "string" ? color : "#000";

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div
      className="relative w-24 h-24"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Koffein tartalom"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="10"
          fill="none"
        />
        {pct > 0 && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={barColor}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        )}
      </svg>
      {pct === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 leading-tight">
          <div className="font-bold text-[1.5rem] leading-snug">koffein-</div>
          <div className="font-bold text-[1.5rem] leading-snug">mentes</div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 leading-tight">
          <div className="font-bold text-[1.5rem] leading-snug">{Math.round(pct)}%</div>
          <div className="text-sm leading-snug">koffein</div>
        </div>
      )}
    </div>
  );
}