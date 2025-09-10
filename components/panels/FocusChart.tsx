import React from 'react';

type Item = { key: string; label: string; value: number };
type Props = { data: Item[]; size?: number; colorDark?: string };

export default function FocusChart({ data, size = 240, colorDark = '#333' }: Props) {
  const cx = size / 2, cy = size / 2;
  const radius = size * 0.26; // shrink chart so labels keep room
  const labelRadius = size * 0.32 + 18; // original radius + padding for labels
  const step = radius / 3;
  const angleFor = (i: number) => (i * 2 * Math.PI / data.length) - Math.PI / 2;
  const wedge = (2 * Math.PI) / data.length;
  const halfArc = wedge * 0.4; // shrink sectors to leave space between axes

  const points = data.map((d, i) => {
    const a = angleFor(i);
    return { ...d, a };
  });

  const hasAnyValue = points.some(p => Number(p.value) > 0);
  const hasEmpty = points.some(p => !Number(p.value));

  const sectorPath = (inner: number, outer: number, start: number, end: number) => {
    const sx = cx + Math.cos(start) * outer;
    const sy = cy + Math.sin(start) * outer;
    const ex = cx + Math.cos(end) * outer;
    const ey = cy + Math.sin(end) * outer;
    if (inner === 0) {
      return `M ${cx} ${cy} L ${sx} ${sy} A ${outer} ${outer} 0 0 1 ${ex} ${ey} Z`;
    }
    const isx = cx + Math.cos(start) * inner;
    const isy = cy + Math.sin(start) * inner;
    const iex = cx + Math.cos(end) * inner;
    const iey = cy + Math.sin(end) * inner;
    return [
      `M ${isx} ${isy}`,
      `L ${sx} ${sy}`,
      `A ${outer} ${outer} 0 0 1 ${ex} ${ey}`,
      `L ${iex} ${iey}`,
      `A ${inner} ${inner} 0 0 0 ${isx} ${isy}`,
      'Z',
    ].join(' ');
  };

  if (!hasAnyValue) {
    return (
      <div style={{ position: 'relative' }}>
        <svg width={size} height={size} aria-hidden>
          <circle cx={cx} cy={cy} r={4} fill={colorDark} fillOpacity={0.15} />
        </svg>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <svg width={size} height={size} aria-hidden>
        {/* grid rings */}
        {[1, 2, 3].map(k => (
          <circle key={k} cx={cx} cy={cy} r={k * step} fill="none" stroke="rgba(0,0,0,0.08)" />
        ))}

        {/* step points per axis */}
        {points.filter(p => Number(p.value) > 0).map((p) => (
          <g key={p.key}>
            {[1, 2, 3].map(level => {
              const outer = step * level;
              const inner = step * (level - 1);
              const start = p.a - halfArc;
              const end = p.a + halfArc;
              const active = level <= Number(p.value);
              const opacity = active ? 0.25 * level : 0.05;
              return (
                <path
                  key={level}
                  d={sectorPath(inner, outer, start, end)}
                  fill={colorDark}
                  fillOpacity={opacity}
                />
              );
            })}
          </g>
        ))}

        {hasEmpty && (
          <circle cx={cx} cy={cy} r={4} fill={colorDark} fillOpacity={0.15} />
        )}
      </svg>

      {/* two-line labels under each axis */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {points.map((p) => {
          const lx = cx + Math.cos(p.a) * labelRadius;
          const ly = cy + Math.sin(p.a) * labelRadius;
          return (
            <div key={p.key} style={{
              position: 'absolute', left: lx - 28, top: ly - 8, width: 56, textAlign: 'center'
            }}>
              <div style={{ fontWeight: 700, lineHeight: 1 }}>{p.value}</div>
              <div style={{ fontSize: 12, opacity: .85, textTransform: 'capitalize' }}>{p.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
