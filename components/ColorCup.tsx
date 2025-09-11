import React from 'react';
import { getTeaColor } from '../utils/colorMap';

type Props = {
  teaName?: string;
  color?: string;            // címke vagy hex
  size?: number | string;    // pl. 120 vagy '10rem'
  teaInsetPct?: number;      // a színes kör peremének belső margója (%), alap: 10
  cupScale?: number;         // PNG skálázás (1 = eredeti), alap: 0.95
  cupOffsetY?: number;       // PNG függőleges eltolás px-ben (negatív: fel)
  className?: string;
  'aria-label'?: string;
};

export default function ColorCup({
  teaName,
  color,
  size = 120,
  teaInsetPct = 10,
  cupScale = 0.95,
  cupOffsetY = 0,
  className,
  'aria-label': ariaLabel,
}: Props) {
  const cupColor = (color ?? getTeaColor(teaName ?? '') ?? '#C8B8DB').trim();
  const pxSize = typeof size === 'number' ? `${size}px` : size;
  const inset = Math.min(Math.max(teaInsetPct, 0), 30); // 0–30% között tartjuk biztonsági okból

  return (
    <div
      className={['relative mx-auto select-none', className].filter(Boolean).join(' ')}
      style={{
        width: pxSize,
        height: pxSize,
        overflow: 'hidden',          // ne lógjon ki
        borderRadius: '9999px',      // kerek kivágás
        position: 'relative',
      }}
      role="img"
      aria-label={ariaLabel ?? (teaName ? `Tea color for ${teaName}` : 'Tea color')}
    >
      {/* színes „pont” – enyhe highlight, folyadék hatás */}
      <div
        className="absolute rounded-full"
        style={{
          inset: `${inset}%`,
          background: `radial-gradient(circle at 50% 28%, ${cupColor}, ${cupColor}CC 60%, ${cupColor}E6 100%)`,
          boxShadow:
            'inset 0 8px 18px rgba(255,255,255,0.25), inset 0 -10px 22px rgba(0,0,0,0.15)',
          zIndex: 1,
        }}
      />

      {/* csésze overlay – mindig felül, skálázható és picit feljebb tolható */}
      <img
        src="/colorCup.png"
        alt=""
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `translateY(${cupOffsetY}px) scale(${cupScale})`,
          transformOrigin: 'center',
          zIndex: 2,
        }}
        draggable={false}
      />
    </div>
  );
}
