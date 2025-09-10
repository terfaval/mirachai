import React from 'react';

type Item = { key: string; label: string; value: number };
type Props = { data: Item[]; size?: number; colorDark?: string };

export default function FocusChart({ data, size=220, colorDark='#333' }: Props) {
  const cx = size/2, cy = size/2;
  const radius = size*0.32;
  const step = radius/3;
  const angleFor = (i:number) => (i*2*Math.PI/data.length) - Math.PI/2;

  const points = data.map((d,i) => {
    const a = angleFor(i);
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;
    return { ...d, a, x, y };
  });

  return (
    <div style={{ position:'relative' }}>
      <svg width={size} height={size} aria-hidden>
        {/* step rings */}
        {[1,2,3].map(k => (
          <circle key={k} cx={cx} cy={cy} r={k*step} fill="none" stroke="rgba(0,0,0,0.08)" />
        ))}

        {/* step points per axis */}
        {points.map((p,i) => (
          <g key={p.key}>
            {[1,2,3].map(level => {
              const r = step*level;
              const x = cx + Math.cos(p.a) * r;
              const y = cy + Math.sin(p.a) * r;
              const active = level <= p.value;
              return (
                <circle
                  key={level}
                  cx={x}
                  cy={y}
                  r={active ? 6 : 4}
                  fill={active ? colorDark : 'rgba(0,0,0,0.15)'}
                />
              );
            })}
          </g>
        ))}
      </svg>

      {/* labels under each axis */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        {points.map(p => {
          const lx = cx + Math.cos(p.a) * (radius + 16);
          const ly = cy + Math.sin(p.a) * (radius + 16);
          return (
            <div key={p.key} style={{
              position:'absolute', left: lx-24, top: ly-6, width:48, textAlign:'center'
            }}>
              <div style={{ fontWeight:700, lineHeight:1 }}>{p.value}</div>
              <div style={{ fontSize:12, opacity:.85, textTransform:'capitalize' }}>{p.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}