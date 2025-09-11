import React from 'react';
import { getTeaColor } from '../utils/colorMap';

type Props = {
  teaName?: string;
  color?: string;            // címke vagy hex
  size?: number | string;    // <<< MÉRET: itt adható px vagy pl. '10rem'
  teaInsetPct?: number;      // belső perem (%)
  teaOpacity?: number;       // 0–1 között: a színes „tea” áttetszősége
  showImage?: boolean;       // belső PNG megjelenítése (most: kikapcsoljuk)
  className?: string;
  'aria-label'?: string;
};

export default function ColorCup({
  teaName,
  color,
  size = 112,
  teaInsetPct = 12,
  teaOpacity = 1,
  showImage = true,
  className,
  'aria-label': ariaLabel,
}: Props) {
  const cupColor = (color ?? getTeaColor(teaName ?? '') ?? '#C8B8DB').trim();
  const pxSize = typeof size === 'number' ? `${size}px` : size;
  const inset = Math.min(Math.max(teaInsetPct, 0), 30);

  return (
    <div
      className={['relative mx-auto select-none', className].filter(Boolean).join(' ')}
      style={{ width: pxSize, height: pxSize }}
      role="img"
      aria-label={ariaLabel ?? (teaName ? `Tea color for ${teaName}` : 'Tea color')}
    >
      {/* SZÍNES TEA – csak kör (áttetsző is lehet) */}
      <div
        className="absolute rounded-full z-10"
        style={{
          inset: `${inset}%`,
          background: cupColor,
          opacity: teaOpacity,
        }}
      />

      {/* (opcionális) CSÉSZE PNG – ha külön akarod kezelni, kapcsold ki showImage-gel */}
      {showImage && (
        <img
          src="/colorCup.png"
          alt=""
          className="absolute inset-0 h-full w-full object-contain pointer-events-none z-0"
          draggable={false}
        />
      )}
    </div>
  );
}
