import React from 'react';
import { getTeaColor } from '../utils/colorMap';

interface Props {
  teaName?: string;
  color?: string;
}

export default function ColorCup({ teaName, color }: Props) {
  const cupColor = color ?? getTeaColor(teaName ?? '');
  return (
    <div className="relative w-32 h-32 mx-auto">
      <div
        className="absolute inset-1 rounded-full"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${cupColor}, ${cupColor}cc)`,
        }}
      />
      <img
        src="/colorCup.png"
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}