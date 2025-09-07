import styles from '../styles/TasteChart.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';

const N = (v: string | number | null | undefined) =>
  typeof v === "number" ? v : v != null ? Number(v) : NaN;

interface Props {
  tea: Tea;
  size?: number;
  showLabels?: boolean;
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

export default function TasteChart({ tea, size = 40, showLabels = true }: Props) {
  const color = '#000';
  const entries = ORDER.map((k) => {
    const raw = N((tea as any)[k]);
    const value = Math.max(0, Math.min(raw, 3));
    return [k.replace('taste_', '').replace(/_/g, ' '), isNaN(value) ? 0 : value] as [
      string,
      number,
    ];
  });

  const topEntries = [...entries]
    .sort((a, b) => b[1] - a[1])
    .filter(([, value]) => value > 0)
    .slice(0, 3);

  const center = size / 2;
  const maxRadius = center - 5;

  const points = entries.map(([_, value], i) => {
    const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
    const r = (value / 3) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, value };
  });

  const active = points.filter((p) => p.value > 0);
  const pathData =
    points
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
      .join(' ') + ' Z';

  return (
    <div className={styles.container}>
      <svg width={size} height={size} className={styles.chart}>
        <circle
          cx={center}
          cy={center}
          r={maxRadius}
          stroke="white"
          strokeWidth={1}
          fill="none"
          opacity={0.3}
        />
        <path
          d={pathData}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {active.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2 + N(p.value)} fill={color} />
        ))}
      </svg>
      {showLabels && (
        <div className={styles.labels}>
          {topEntries.map(([label, value]) => (
            <div key={label}>{label}: {value}</div>
          ))}
        </div>
      )}
    </div>
  );
}