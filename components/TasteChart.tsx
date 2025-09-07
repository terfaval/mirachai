import styles from '../styles/TasteChart.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';

interface Props {
  tea: Tea;
}

export default function TasteChart({ tea }: Props) {
  const color = getCategoryColor(tea.category, 'dark');
  const entries = Object.entries(tea)
    .filter(([k, v]) => k.startsWith('taste_') && typeof v === 'number')
    .map(([k, v]) => [
      k.replace('taste_', '').replace(/_/g, ' '),
      Math.max(0, Math.min(Number(v), 3)),
    ])
    .filter(([_, v]) => v > 0);

  const size = 60;
  const center = size / 2;
  const maxRadius = center - 5;

  const points = entries.map(([_, value], i) => {
    const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
    const r = (value / 3) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, value };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className={styles.container}>
      <svg width={size} height={size} className={styles.chart}>
        <polygon points={polygon} fill="none" stroke={color} />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2 + p.value} fill={color} />
        ))}
      </svg>
      <div className={styles.labels}>
        {entries.map(([label, value]) => (
          <div key={label}>{label}: {value}</div>
        ))}
      </div>
    </div>
  );
}