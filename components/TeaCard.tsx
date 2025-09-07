import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import TasteChart from './TasteChart'

interface Props {
  tea: Tea;
}

export default function TeaCard({ tea }: Props) {
  const color = getCategoryColor(tea.category);
  const mandalaColor = getCategoryColor(tea.category, 'alternative');
  const dotActiveColor = getCategoryColor(tea.category, 'dark');
  const dotColor = getCategoryColor(tea.category, 'light');

  const flavorKeys = [
    'friss',
    'édeskés',
    'savanykás',
    'fűszeres',
    'virágos',
    'gyümölcsös',
    'földes',
    'kesernyés',
    'csípős',
    'umami',
  ];
  const flavors = flavorKeys
    .map((k) => ({ name: k, value: (tea as any)[`taste_${k}`] || 0 }))
    .filter((f) => f.value > 0);

  const showChart = flavors.length >= 3;
  let points = '';
  if (showChart) {
    const max = Math.max(...flavors.map((f) => f.value));
    const center = 50;
    const radius = 40;
    points = flavors
      .map((f, i) => {
        const angle = (2 * Math.PI * i) / flavors.length - Math.PI / 2;
        const r = (f.value / max) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');
  }

  const intensityMap: Record<string, number> = { enyhe: 1, közepes: 2, erős: 3 };
  const intensityLevel = intensityMap[tea.intensity ?? ''] ?? 0;

  return (
    <div className={styles.card} style={{ backgroundColor: color }}>
      <div className={styles.mandala} style={{ backgroundColor: mandalaColor }} />
      <div className={styles.name}>{tea.name}</div>
      <div className={styles.mood}>{tea.mood_short}</div>
      <div className={styles.info}>
        <div className={styles.flavor}>
          {showChart && (
            <svg viewBox="0 0 100 100" className={styles.chart}>
              <polygon points={points} />
            </svg>
          )}
          <ul className={styles.flavorList}>
            {flavors.map((f) => (
              <li key={f.name}>
                <span>{f.name}</span>
                <span>{f.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.intensity}>
          <div className={styles.dots}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={styles.dot}
                style={{ background: i <= intensityLevel ? dotActiveColor : dotColor }}
              />
            ))}
          </div>
          <div className={styles.intensityLabel}>{tea.intensity}</div>
        </div>
      </div>
    </div>
  );
}