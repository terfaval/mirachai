import React from "react";

interface Props {
  value: number; // 0..100
  color?: string;
}

export default function CaffeineBar({ value, color }: Props) {
  const pct = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  const barColor = color && typeof color === "string" ? color : "#000";
  const showInside = pct >= 15; // ha túl kicsi, a felirat kerüljön kívülre

  return (
    <div
      className="relative w-full h-12 bg-gray-200 rounded-l-xl overflow-hidden"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Koffein tartalom"
    >
      {pct > 0 && (
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      )}
      {pct === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600">
          koffeinmentes
        </div>
      ) : (
        <div
          className="absolute top-1/2 -translate-y-1/2 text-xs font-bold whitespace-nowrap"
          style={{
            left: `${pct}%`,
            color: barColor,
            transform: showInside
              ? "translate(-100%, -50%)"
              : "translate(4px, -50%)",
          }}
        >
          {Math.round(pct)}%
        </div>
      )}
    </div>
  );
}