import styles from '../styles/TasteChart.module.css';
import { Tea } from '../utils/filter';

const N = (v: string | number | null | undefined) =>
  typeof v === 'number' ? v : v != null ? Number(v) : NaN;

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
      number
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
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <div className={styles.container}>
      {showLabels && (
        <div className={styles.labels} aria-label="ízprofil top értékek">
          {topEntries.map(([label, value]) => (
            <div key={label} className={styles.labelRow}>
              <span className={styles.value}>{value}</span>
              <span className={styles.sep}>&nbsp;</span>
              <span className={styles.name}>{label}</span>
            </div>
          ))}
        </div>
      )}

      <svg width={size} height={size} className={styles.chart} role="img" aria-label="ízprofil diagram">
        {[1, 2, 3].map((lvl) => (
          <circle
            key={lvl}
            cx={center}
            cy={center}
            r={(lvl / 3) * maxRadius}
            stroke="white"
            strokeWidth={1}
            fill="none"
            opacity={0.1 * lvl}
          />
        ))}
        <circle cx={center} cy={center} r={2} fill="white" />
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
    </div>
  );
}
