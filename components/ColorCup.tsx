import React from 'react';
import { getTeaColor } from '../utils/colorMap';

type Props = {
  teaName?: string;
  color?: string;             // címke vagy hex
  size?: number | string;     // <<< MÉRET: px vagy pl. '10rem'
  teaInsetPct?: number;       // belső perem (%)
  teaOpacity?: number;        // 0–1
  className?: string;
  'aria-label'?: string;
};

export default function ColorCup({
  teaName,
  color,
  size = '70%',
  teaInsetPct = 5,
  teaOpacity = 1,
  className,
  'aria-label': ariaLabel,
}: Props) {
  const cupColor = (color ?? getTeaColor(teaName ?? '') ?? '#C8B8DB').trim();
  const pxSize = typeof size === 'number' ? `${size}px` : size;
  const inset = Math.min(Math.max(teaInsetPct, 0), 1);

  return (
    <div
      // FONTOS: mindig legyen positioned wrapper!
      style={{ position: 'relative', width: pxSize, height: 'auto', aspectRatio: '1 / 1', }}
      className={className}
      role="img"
      aria-label={ariaLabel ?? (teaName ? `Tea color for ${teaName}` : 'Tea color')}
    >
      {/* SZÍNES TEA-KÖR */}
      <div
  style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `calc(100% - ${2 * inset}%)`,
    height: `calc(100% - ${2 * inset}%)`,
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    background: cupColor,
    opacity: teaOpacity,
    zIndex: 2,
  }}
/>
    </div>
  );
}