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
  pointRadiusBase?: number;
  connectByStrongest?: boolean;
  strongColor?: string;
  colorDark?: string;
}

const ORDER = [
  'taste_friss',
  'taste_kesernyés',
  'taste_savanykás',
  'taste_édeskés',
  'taste_csípős',
  'taste_umami',
  'taste_fűszeres',
  'taste_földes',
  'taste_virágos',
  'taste_gyümölcsös',
];

export default function TasteChart({
  tea,
  size = 40,
  showLabels = true,
  minValue = 0,
  pointRadiusBase = 5,
  connectByStrongest = true,
  strongColor,
  colorDark = '#333',
}: Props) {
  const lineColor = '#ccc';

  const entries = ORDER.map((k) => {
    const raw = N((tea as any)[k]);
    const value = Math.max(0, Math.min(raw, 3));
    const label = k.replace('taste_', '').replace(/_/g, ' ');
    const color = getTasteColor(k);
    return { key: k, label, value: isNaN(value) ? 0 : value, color };
  }).filter((e) => e.value >= minValue);

  const center = size / 2;
  const maxRadius = center - 5;

  const points = entries.map((entry, i) => {
    const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
    const r = (entry.value / 3) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { ...entry, x, y, angle };
  });

  const sorted = points.slice().sort((a, b) => a.angle - b.angle);
  const strongest = entries.reduce((a, b) => (b.value > (a?.value ?? -1) ? b : a), undefined as any);
  const polyStroke =
    strongColor ?? (strongest ? getTasteColor(strongest.key) : undefined) ?? colorDark;
  const polyFill =
    strongest ? getTasteColor(strongest.key, 'alternative') ?? polyStroke : polyStroke;
  const labelRadius = (4 / 3) * maxRadius;

  const curvePath = sorted
    .map((p, i) => {
      const next = sorted[(i + 1) % sorted.length];
      const midX = (p.x + next.x) / 2;
      const midY = (p.y + next.y) / 2;
      return `${i === 0 ? `M${midX},${midY}` : ''} Q${p.x},${p.y} ${midX},${midY}`;
    })
    .join(' ');

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
            cx={center}
            cy={center}
            r={(lvl / 3) * maxRadius}
            stroke={lineColor}
            strokeWidth={1}
            fill="none"
            opacity={0.1 * lvl}
          />
        ))}
        {points.map((p) => (
          <line
            key={`axis-${p.key}`}
            x1={center}
            y1={center}
            x2={center + Math.cos(p.angle) * maxRadius}
            y2={center + Math.sin(p.angle) * maxRadius}
            stroke={lineColor}
            strokeWidth={1}
            opacity={0.2}
          />
        ))}
        <circle cx={center} cy={center} r={2} fill={lineColor} />
        {connectByStrongest && points.length > 1 && (
          <path
            d={curvePath}
            fill={polyFill}
            fillOpacity={0.2}
            stroke={polyStroke}
            strokeWidth={2}
          />
        )}
        {points.map((p) => {
          const lx = center + Math.cos(p.angle) * labelRadius;
          const ly = center + Math.sin(p.angle) * labelRadius;
          return (
            <g key={p.key}>
              <circle
                cx={p.x}
                cy={p.y}
                r={pointRadiusBase + p.value * 3}
                fill={p.color}
              />
              {showLabels && p.value > 0 && (
                <text
                  x={lx}
                  y={ly}
                  fontSize={12}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={colorDark}
                >
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}