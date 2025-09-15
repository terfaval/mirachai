import React from 'react';
import { getTeaColor } from '../utils/colorMap';

type Props = {
  teaName?: string;
  color?: string;             // címke vagy hex
  size?: number | string;     // px vagy pl. '10rem'
  teaInsetPct?: number;       // belső perem (%)
  teaOpacity?: number;        // 0–1
  className?: string;
  'aria-label'?: string;
};

export default function ColorCup({
  teaName,
  color,
  size = '100%',
  teaInsetPct = 30,
  teaOpacity = 1,
  className,
  'aria-label': ariaLabel,
}: Props) {
  const cupColor = (color ?? getTeaColor(teaName ?? '') ?? '#C8B8DB').trim();
  const inset = Math.min(Math.max(teaInsetPct, 0), 2);

  // folyadék-gradiens
  const teaFluidBackground = [
    `linear-gradient(160deg,
      color-mix(in srgb, ${cupColor} 88%, white) 0%,
      color-mix(in srgb, ${cupColor} 86%, black) 100%)`,
    `radial-gradient(100% 100% at 50% 55%,
      transparent 58%,
      rgba(0,0,0,0.10) 72%,
      rgba(0,0,0,0.18) 86%,
      rgba(0,0,0,0.24) 100%)`,
    `radial-gradient(120% 80% at 50% 80%,
      color-mix(in srgb, ${cupColor} 88%, black) 0%,
      transparent 60%)`,
    `radial-gradient(55% 38% at 28% 24%,
      rgba(255,255,255,0.70) 0%,
      rgba(255,255,255,0.18) 35%,
      rgba(255,255,255,0.00) 70%)`,
  ].join(',');

  return (
    <div
      // FONTOS: megtartottuk az eredeti wrapper méretezést!
      style={{
        position: 'relative',
        width: '40%',
        height: 'auto',
        aspectRatio: '1 / 1',
      }}
      className={className}
      role="img"
      aria-label={ariaLabel ?? (teaName ? `Tea color for ${teaName}` : 'Tea color')}
    >
      {/* SZÍNES TEA-KÖR (folyadék hatással) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '52%',
          width: `calc(100% - ${2 * inset}%)`,
          height: `calc(100% - ${2 * inset}%)`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: teaFluidBackground,
          boxShadow: `
            inset 0 1.2% 2.4% rgba(255,255,255,0.35),
            inset 0 -1.2% 2.4% rgba(0,0,0,0.18)
          `,
          opacity: teaOpacity,
          zIndex: 2,
        }}
      />

      {/* MENISZKUSZ-gyűrű */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `calc(100% - ${2 * inset + 2}%)`,
          height: `calc(100% - ${2 * inset + 2}%)`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: `
            conic-gradient(from -90deg,
              rgba(255,255,255,0.65) 0deg,
              rgba(255,255,255,0.35) 70deg,
              rgba(255,255,255,0.00) 120deg,
              rgba(0,0,0,0.06) 220deg,
              rgba(0,0,0,0.10) 260deg,
              rgba(255,255,255,0.00) 320deg,
              rgba(255,255,255,0.65) 360deg)
          `,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      />

      {/* Felső csillanás */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '10%',
          width: '65%',
          height: '20%',
          transform: 'rotate(-25deg)',
          borderRadius: '9999px',
          background: 'linear-gradient(90deg, rgba(255,255,255,0.00), rgba(255,255,255,0.18), rgba(255,255,255,0.00))',
          filter: 'blur(1.5px)',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />
    </div>
  );
}
