import React from 'react';

export interface DaySegment {
  key: string;
  start: number; // hour start, 0-24
  end: number; // hour end, can exceed 24 for wrap
  color: string;
  active: boolean;
}

interface Props {
  segments: DaySegment[];
  size?: number;
}

export default function DayDonut({ segments, size = 50 }: Props) {
  const center = size / 2;
  const radius = center - 4;
  const circumference = 2 * Math.PI * radius;
  const gap = 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg) => {
        const start = seg.start % 24;
        const end = seg.end <= seg.start ? seg.end + 24 : seg.end;
        const lengthHours = end - start;
        const arcLen = (lengthHours / 24) * circumference - gap;
        const dash = `${Math.max(0, arcLen)} ${circumference - Math.max(0, arcLen)}`;
        const offset = (start / 24) * circumference + gap / 2;
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