import React from 'react';

export type DaySegment = {
  value: number;          // 0..1
  color: string;
  active?: boolean;
};

type Props = {
  segments: DaySegment[];
  size?: number;
  strokeWidth?: number;
  inactiveColor?: string; // ÚJ
  max?: number;           // opcionális
};

export default function DayDonut({
  segments,
  size = 84,
  strokeWidth = 10,
  inactiveColor = 'rgba(255,255,255,0.2)',
}: Props) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r * 2;

  let offset = 0;
  const arcs = segments.map((seg, i) => {
    const len = circumference * seg.value;
    const dashArray = `${len} ${circumference - len}`;
    const dashOffset = circumference - offset;
    offset += len;

    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={seg.active ? seg.color : inactiveColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashArray}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        strokeLinecap="round"
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      {arcs}
    </svg>
  );
}
