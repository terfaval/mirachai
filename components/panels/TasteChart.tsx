import styles from '../../styles/TasteChart.module.css';
import { Tea } from '../../utils/filter';
import { getTasteColor } from '../../utils/colorMap';

const N = (v: string | number | null | undefined) =>
  typeof v === 'number' ? v : v != null ? Number(v) : NaN;

interface Props {
  tea: Tea;
  size?: number;
  showLabels?: boolean;
  minValue?: number;
  pointRadiusBase?: number; // unused, kept for compat
  connectByStrongest?: boolean; // unused, kept for compat
  strongColor?: string; // unused, kept for compat
  colorDark?: string;
}

const ORDER = [
  'taste_friss',
  'taste_gyümölcsös',
  'taste_virágos',
  'taste_savanykás',
  'taste_kesernyés',
  'taste_földes',
  'taste_umami',
  'taste_fűszeres',
  'taste_csípős',
  'taste_édeskés',
];

export default function TasteChart({
  tea,
  size = 40,
  showLabels = true,
  minValue = 1,
  pointRadiusBase: _pointRadiusBase = 15,
  connectByStrongest: _connectByStrongest = true,
  strongColor: _strongColor,
  colorDark = '#333',
}: Props) {
  const lineColor = '#ccc';
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.3; // leave room for labels
  const step = radius / 3;
  const wedge = (2 * Math.PI) / ORDER.length;
  const halfArc = wedge * 0.45; // leave space between petals

  const allEntries = ORDER.map((k, i) => {
    const raw = N((tea as any)[k]);
    const value = Math.max(0, Math.min(raw, 3));
    const label = k.replace('taste_', '').replace(/_/g, ' ');
    const color = getTasteColor(k);
    const angle = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
    return { key: k, label, value: isNaN(value) ? 0 : value, color, angle };
  });

  const entries = allEntries.filter((e) => e.value >= minValue);
  const labelRadius = radius + 30;

  const petalPath = (outer: number, start: number, end: number) => {
    const sx = cx + Math.cos(start) * outer;
    const sy = cy + Math.sin(start) * outer;
    const ex = cx + Math.cos(end) * outer;
    const ey = cy + Math.sin(end) * outer;
    const c1x = cx + Math.cos(start) * outer * 0.4;
    const c1y = cy + Math.sin(start) * outer * 0.4;
    const c2x = cx + Math.cos(end) * outer * 0.4;
    const c2y = cy + Math.sin(end) * outer * 0.4;
    return [
      `M ${cx} ${cy}`,
      `Q ${c1x} ${c1y} ${sx} ${sy}`,
      `A ${outer} ${outer} 0 0 1 ${ex} ${ey}`,
      `Q ${c2x} ${c2y} ${cx} ${cy}`,
      'Z',
    ].join(' ');
  };

  return (
    <div className={styles.container}>
      <svg
        width={size}
        height={size}
        className={styles.chart}
        role="img"
        aria-label="ízprofil diagram"
        style={{ background: 'transparent' }}
      >
        {[1, 2, 3].map((lvl) => (
          <circle
            key={`grid-${lvl}`}
            cx={cx}
            cy={cy}
            r={step * lvl}
            stroke={lineColor}
            strokeWidth={1}
            fill="none"
            opacity={0.1 * lvl}
          />
        ))}
        {allEntries.map((p) => (
          <line
            key={`axis-${p.key}`}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(p.angle) * radius}
            y2={cy + Math.sin(p.angle) * radius}
            stroke={lineColor}
            strokeWidth={1}
            opacity={0.2}
          />
        ))}
        {entries.map((p) => {
          if (p.value <= 0) return null;
          const outer = step * p.value;
          const start = p.angle - halfArc;
          const end = p.angle + halfArc;
          return (
            <path
              key={`petal-${p.key}`}
              d={petalPath(outer, start, end)}
              fill={p.color}
              fillOpacity={0.8}
            />
          );
        })}
        {showLabels &&
          entries.map((p) => {
            const lx = cx + Math.cos(p.angle) * labelRadius;
            const ly = cy + Math.sin(p.angle) * labelRadius;
            return (
              <text
                key={`label-${p.key}`}
                x={lx}
                y={ly}
                fontSize={12}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={colorDark}
              >
                {p.label}
              </text>
            );
          })}
      </svg>
    </div>
  );
}