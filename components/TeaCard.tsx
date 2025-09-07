import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import TasteChart from './TasteChart'

const MANDALA_POSITIONS = [
  { top: '0%', left: '0%' },
  { top: '0%', left: '-350%' },
  { top: '0%', left: '-700%' },
  { top: '-350%', left: '0%' },
  { top: '-350%', left: '-350%' },
  { top: '-350%', left: '-700%' },
  { top: '-700%', left: '0%' },
  { top: '-700%', left: '-350%' },
  { top: '-700%', left: '-700%' },
];

interface Props {
  tea: Tea;
}

export default function TeaCard({ tea }: Props) {
  const color = getCategoryColor(tea.category);
  const mandalaColor = getCategoryColor(tea.category, 'alternative');
  const dotActiveColor = getCategoryColor(tea.category, 'dark');
  const dotColor = getCategoryColor(tea.category, 'light');

  const mandalaPos =
    MANDALA_POSITIONS[(tea.mandalaIndex ?? 0) % MANDALA_POSITIONS.length];

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

  const intensityMap: Record<string, number> = { enyhe: 1, közepes: 2, erős: 3 };
  const intensityLevel = intensityMap[tea.intensity ?? ''] ?? 0;

  return (
    <div className={styles.card} style={{ backgroundColor: color }}>
      <div
        className={styles.mandala}
        style={{
          backgroundColor: mandalaColor,
          top: mandalaPos.top,
          left: mandalaPos.left,
        }}
      />
      <div className={styles.name}>{tea.name}</div>
      <div className={styles.mood}>{tea.mood_short}</div>
      <div className={styles.info}>
        <div className={styles.flavor}>
          {showChart && (
            <TasteChart tea={tea} size={80} showLabels={false} />
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