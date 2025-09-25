import React from 'react';

export interface Segment {
  key?: string;
  color: string;
  active: boolean;
  value?: number;
}

interface Props {
  segments: Segment[];
  size?: number;
  inactiveColor?: string;
  rotation: number;
}

export default function QuarterDonut({ segments, size = 50, inactiveColor = 'rgba(255,255,255,0.2)' }: Props) {
  const center = size / 2;
  const radius = center - 4;
  const circumference = 2 * Math.PI * radius;
  const quarter = circumference / 4;
  const gap = 2;
  const segLen = quarter - gap;
  const dash = `${segLen} ${circumference - segLen}`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}> 
      {segments.map((seg, i) => (
        <circle
          key={seg.key ?? i}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={seg.active ? seg.color : inactiveColor}
          strokeWidth={8}
          strokeDasharray={dash}
          strokeDashoffset={-i * quarter}
        />
      ))}
    </svg>
  );
}