import React from 'react';
import { Functions } from '../../src/types/tea';

interface Props {
  functions: Functions;
  color: string;
}

const QUADRANTS: { key: keyof Functions; label: string }[] = [
  { key: 'immun', label: 'Immun' },
  { key: 'relax', label: 'Relax' },
  { key: 'focus', label: 'Fókusz' },
  { key: 'detox', label: 'Detox' },
];

export default function FunctionRadialSteps({ functions, color }: Props) {
  const size = 120;
  const center = size / 2;
  const barWidth = 14;
  const step = 12;
  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label="funkciók"
      className="mx-auto"
    >
      {QUADRANTS.map((q, idx) => {
        const val = functions[q.key];
        const rotation = idx * 90;
        return (
          <g key={q.key} transform={`rotate(${rotation} ${center} ${center})`}>
            {[1, 2, 3].map((lvl) => (
              <rect
                key={lvl}
                x={center - barWidth / 2}
                y={center - lvl * step}
                width={barWidth}
                height={step - 2}
                rx={barWidth / 2}
                fill={color}
                fillOpacity={lvl <= val ? 1 : 0.2}
              />
            ))}
            <text
              x={center}
              y={center - 3 * step - 6}
              textAnchor="middle"
              className="font-sans text-xs"
              transform={`rotate(${-rotation} ${center} ${center - 3 * step - 6})`}
            >
              {q.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}