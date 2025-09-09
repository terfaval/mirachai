import styles from './../styles/TasteChart.module.css';
import { Tea } from '../utils/filter';
import { getTasteColor } from '../utils/colorMap';

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
  const lineColor = '#ccc';

  const entries = ORDER.map((k) => {
    const raw = N((tea as any)[k]);
    const value = Math.max(0, Math.min(raw, 3));
    const label = k.replace('taste_', '').replace(/_/g, ' ');
    const color = getTasteColor(k);
    return { key: k, label, value: isNaN(value) ? 0 : value, color };
  });

  const topEntries = [...entries]
    .sort((a, b) => b.value - a.value)
    .filter((e) => e.value > 0)
    .slice(0, 3);

  const center = size / 2;
  const maxRadius = center - 5;

  const points = entries.map((entry, i) => {
    const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
    const r = (entry.value / 3) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { ...entry, x, y };
  });

  const active = points.filter((p) => p.value > 0);
  
  return (
    <div className={styles.container}>
      {showLabels && (
        <div className={styles.labels} aria-label="ízprofil top értékek">
          {topEntries.map((e) => (
            <div key={e.key} className={styles.labelRow} style={{ color: e.color }}>
              <span className={styles.value}>{e.value}</span>
              <span className={styles.sep}>&nbsp;</span>
              <span className={styles.name}>{e.label}</span>
            </div>
          ))}
        </div>
      )}

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
        {active.map((p) => (
          <circle key={p.key} cx={p.x} cy={p.y} r={4 + N(p.value)} fill={p.color} />
        ))}
      </svg>
    </div>
  );
}