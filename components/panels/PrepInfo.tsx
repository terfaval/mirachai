import React from 'react';

interface Props {
  tempC?: number;
  steepMin?: number;
  colorDark?: string;
}

export default function PrepInfo({ tempC, steepMin, colorDark = '#000' }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 12,
        fontSize: '.8rem',
        color: colorDark,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: '1.2rem' }} aria-hidden>🌡️</div>
        <div style={{ textAlign: 'center', lineHeight: 1.12 }}>
          <div>forrázás</div>
          <div style={{ fontWeight: 800 }}>{tempC ?? '—'} °C</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontSize: '1.2rem' }} aria-hidden>⏱️</div>
        <div style={{ textAlign: 'center', lineHeight: 1.12 }}>
          <div>áztatás</div>
          <div style={{ fontWeight: 800 }}>{steepMin ?? '—'} perc</div>
        </div>
      </div>
    </div>
  );
}