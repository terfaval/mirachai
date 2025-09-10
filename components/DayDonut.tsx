import React from 'react';

export interface DaySegment {
  key?: string;
  start?: number; // unit start, 0-max
  end?: number; // unit end, can exceed max for wrap
  value?: number; // fraction (0..1)
  color: string;
  active: boolean;
}

interface Props {
  segments: DaySegment[];
  size?: number;
  max?: number;
  inactiveColor?: string;
  rotation?: number;
}

export default function DayDonut({ segments, size = 50, max = 10, inactiveColor = 'rgba(255,255,255,0.2)', rotation = 0 }: Props) {
  const center = size / 2;
  const radius = center - 4;
  const circumference = 2 * Math.PI * radius;
  const gap = 2;
  let cursor = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(${rotation} ${center} ${center})`}>
      {segments.map((seg, i) => {
        let startFraction = 0;
        let lengthFraction = 0;
        if (typeof seg.start === 'number' && typeof seg.end === 'number') {
          const s = seg.start % max;
          const e = seg.end <= seg.start ? seg.end + max : seg.end;
          startFraction = s / max;
          lengthFraction = (e - s) / max;
        } else {
          startFraction = cursor;
          lengthFraction = seg.value ?? 0;
          cursor += lengthFraction;
        }
        const arcLen = lengthFraction * circumference - gap;
        const dash = `${Math.max(0, arcLen)} ${circumference - Math.max(0, arcLen)}`;
        const offset = startFraction * circumference + gap / 2;
        return (
          <circle
            key={seg.key ?? i}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={seg.active ? seg.color : inactiveColor}
            strokeWidth={8}
            strokeDasharray={dash}
            strokeDashoffset={-offset}
          />
        );
      })}
      </g>
    </svg>
  );
}