import React from 'react';

interface Props {
  percent: number;
  color: string;
}

export default function DonutPercent({ percent, color }: Props) {
  const size = 100;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={`intenzitás ${Math.round(percent)}%`}
      className="mx-auto"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={stroke}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-sans text-lg"
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}