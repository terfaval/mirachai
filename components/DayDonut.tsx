import React from 'react';

export interface DaySegment {
  key: string;
  start: number; // unit start, 0-max
  end: number; // unit end, can exceed max for wrap
  color: string;
  active: boolean;
}

interface Props {
  segments: DaySegment[];
  size?: number;
  max?: number;
}

export default function DayDonut({ segments, size = 50, max = 10 }: Props) {
  const center = size / 2;
  const radius = center - 4;
  const circumference = 2 * Math.PI * radius;
  const gap = 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg) => {
        const start = seg.start % max;
        const end = seg.end <= seg.start ? seg.end + max : seg.end;
        const length = end - start;
        const arcLen = (length / max) * circumference - gap;
        const dash = `${Math.max(0, arcLen)} ${circumference - Math.max(0, arcLen)}`;
        const offset = (start / max) * circumference + gap / 2;
        return (
          <circle
            key={seg.key}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.active ? seg.color : 'rgba(255,255,255,0.2)'}
            strokeWidth={8}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
          />
        );
      })}
    </svg>
  );
}