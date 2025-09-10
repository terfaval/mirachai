import React from 'react';

export type Segment = {
  value: number;          // 0..1 arány
  color: string;          // aktív szegmens színe
  active?: boolean;       // ha false, inaktív
};

type Props = {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  inactiveColor?: string; // ÚJ: inaktív ívek színe
};

export default function QuarterDonut({
  segments,
  size = 84,
  strokeWidth = 10,
  inactiveColor = 'rgba(255,255,255,0.2)',
}: Props) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r * 2;

  // 4 negyed: feltételezzük, hogy 0..1 arányban jönnek a szegmensek
  // és egymás után rajzoljuk őket.
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
