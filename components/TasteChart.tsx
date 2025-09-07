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
  const color = getCategoryColor(tea.category, 'dark');
  const entries = ORDER.map((k) => {
    const raw = N((tea as any)[k]);
    const value = Math.max(0, Math.min(raw, 3));
    return [k.replace('taste_', '').replace(/_/g, ' '), isNaN(value) ? 0 : value] as [
      string,
      number,
    ];
  });

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
  const segments =
    active.length > 1
      ? active.map((p, i) => {
          const next = active[(i + 1) % active.length];
          const width = 2 + Math.max(N(p.value), N(next.value));
          return { x1: p.x, y1: p.y, x2: next.x, y2: next.y, width };
        })
      : [];

  return (
    <div className={styles.container}>
      <svg width={size} height={size} className={styles.chart}>
        {segments.map((s, i) => (
          <line
            key={i}
            x1={s.x1}
            y1={s.y1}
            x2={s.x2}
            y2={s.y2}
            stroke={color}
            strokeWidth={s.width}
            strokeLinecap="round"
          />
        ))}
        {active.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2 + N(p.value)} fill={color} />
        ))}
      </svg>
      {showLabels && (
        <div className={styles.labels}>
          {entries.map(([label, value]) => (
            <div key={label}>{label}: {value}</div>
          ))}
        </div>
      )}
    </div>
  );
}