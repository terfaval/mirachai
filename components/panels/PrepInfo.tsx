import React from 'react';

interface Props {
  tempC?: number;
  steepMin?: number;
}

export default function PrepInfo({ tempC, steepMin }: Props) {
  return (
    <div style={{ display:'grid', gap:16 }}>
      <div style={{ textAlign:'center' }}>
        <svg width={40} height={40} viewBox="0 0 24 24" aria-hidden style={{ margin:'0 auto 4px' }}>
          <path d="M12 2a2 2 0 0 0-2 2v9.17a3.001 3.001 0 1 0 4 0V4a2 2 0 0 0-2-2z" stroke="currentColor" fill="none" strokeWidth={2}/>
          <circle cx={12} cy={17} r={3} fill="currentColor" />
        </svg>
        <div style={{ fontWeight:700 }}>{tempC ?? '—'}°C</div>
        <div style={{ opacity:.8 }}>forrázási hőmérséklet</div>
      </div>
      <div style={{ textAlign:'center' }}>
        <svg width={40} height={40} viewBox="0 0 24 24" aria-hidden style={{ margin:'0 auto 4px' }}>
          <circle cx={12} cy={12} r={9} stroke="currentColor" fill="none" strokeWidth={2}/>
          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth={2} fill="none" strokeLinecap="round"/>
        </svg>
        <div style={{ fontWeight:700 }}>{steepMin ?? '—'} perc</div>
        <div style={{ opacity:.8 }}>áztatási idő</div>
      </div>
    </div>
  );
}