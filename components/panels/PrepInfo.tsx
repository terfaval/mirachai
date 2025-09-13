import React from 'react';

interface Props {
  tempC?: number;
  steepMin?: number;
  colorDark?: string;
  colorLight?: string;
}

export default function PrepInfo({ tempC, steepMin, colorDark = '#000', colorLight = 'rgba(0,0,0,0.1)' }: Props) {
  const temp = Number.isFinite(tempC) ? (tempC as number) : 0;
  const tempPct = Math.max(0, Math.min(temp, 100));
  const steep = Number.isFinite(steepMin) ? (steepMin as number) : 0;
  const steepPct = (Math.max(0, Math.min(steep, 10)) / 10) * 100;

  return (
    <div
      style={{
        display: 'column',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 16,
        fontSize: '.8rem',
      }}
    >
      {/* Temperature */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: '100%',
            height: 8,
            background: 'rgba(0,0,0,0.1)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${tempPct}%`,
              height: '100%',
              background: colorDark,
              borderRadius: 999,
            }}
          />
        </div>
        <div style={{ textAlign: 'right', lineHeight: 1.12 }}>
          <div>forrázás</div>
          <div style={{ fontWeight: 800 }}>{tempC ?? '—'} °C</div>
        </div>
      </div>

      {/* Steep chart */}
      <div style={{ position: 'relative', width: 40, height: 40 }}>
        <svg
          width={40}
          height={40}
          viewBox="0 0 36 36"
          aria-hidden
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle cx={18} cy={18} r={16} stroke={colorLight} strokeWidth={4} fill="none" />
          <circle
            cx={18}
            cy={18}
            r={16}
            stroke={colorDark}
            strokeWidth={4}
            fill="none"
            strokeDasharray={100}
            strokeDashoffset={100 - steepPct}
            pathLength={100}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            fontSize: '.9rem',
            opacity: 0.7,
          }}
          aria-hidden
        >
          ⏱️
        </div>
      </div>

      <div style={{ textAlign: 'right', lineHeight: 1.12 }}>
        <div>áztatás</div>
        <div style={{ fontWeight: 800 }}>{steepMin ?? '—'} perc</div>
      </div>
    </div>
  );
}