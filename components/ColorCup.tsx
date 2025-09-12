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
  size = 112,
  teaInsetPct = 12,
  teaOpacity = 1,
  className,
  'aria-label': ariaLabel,
}: Props) {
  const cupColor = (color ?? getTeaColor(teaName ?? '') ?? '#C8B8DB').trim();
  const pxSize = typeof size === 'number' ? `${size}px` : size;
  const inset = Math.min(Math.max(teaInsetPct, 0), 30);

  return (
    <div
      // FONTOS: mindig legyen positioned wrapper!
      style={{ position: 'relative', width: pxSize, height: pxSize }}
      className={className}
      role="img"
      aria-label={ariaLabel ?? (teaName ? `Tea color for ${teaName}` : 'Tea color')}
    >
      {/* SZÍNES TEA-KÖR */}
      <div
        style={{
          position: 'absolute',
          top: `${inset}%`,
          right: `${inset}%`,
          bottom: `${inset}%`,
          left: `${inset}%`,
          borderRadius: '50%',
          background: cupColor,
          opacity: teaOpacity,
          marginBottom: '2px',
          marginRight: '1px',
          zIndex: 2,
        }}
      />
    {/* COLOR LABEL */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: cupColor,
          color: '#fff',
          fontWeight: 'bold',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          zIndex: 3,
        }}
      >
        {cupColor}
      </div>
    </div>
  );
}