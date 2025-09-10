import styles from './../styles/TasteChart.module.css';
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
  minValue = 1,
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

  const strongest = entries.reduce((a, b) => (b.value > (a?.value ?? -1) ? b : a), undefined as any);
  const polyColor = strongColor ?? (strongest ? getTasteColor(strongest.key) : undefined) ?? colorDark;
  const labelOffset = 12;

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
        <circle cx={center} cy={center} r={2} fill={lineColor} />
        {connectByStrongest && showLabels && points.length > 1 && (
          <polyline
            points={points
              .slice()
              .sort((a, b) => a.angle - b.angle)
              .map((p) => `${p.x},${p.y}`)
              .join(' ')}
            fill="none"
            stroke={polyColor}
            strokeWidth={2}
          />
        )}
        {points.map((p) => (
          <g key={p.key}>
            <circle
              cx={p.x}
              cy={p.y}
              r={pointRadiusBase + p.value * 2}
              fill={colorDark}
            />
            {showLabels && (
              <text
                x={p.x + Math.cos(p.angle) * labelOffset}
                y={p.y + Math.sin(p.angle) * labelOffset}
                fontSize={12}
                textAnchor="middle"
                alignmentBaseline="middle"
                fill={colorDark}
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}