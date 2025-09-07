import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import TasteChart from './TasteChart';

interface Props {
  tea: Tea;
  tileX: number;
  tileY: number;
  tilesX: number;
  tilesY: number;
  onClick?: (tea: Tea) => void;
}

export default function TeaCard({ tea, tileX, tileY, tilesX, tilesY, onClick }: Props) {
  const color = getCategoryColor(tea.category);
  const mandalaColor = getCategoryColor(tea.category, 'light');
  const dotActiveColor = tea.intensity ? '#000' : getCategoryColor(tea.category, 'dark');
  const dotColor = getCategoryColor(tea.category, 'light');

  const flavorKeys = [
    'friss','édeskés','savanykás','fűszeres','virágos',
    'gyümölcsös','földes','kesernyés','csípős','umami',
  ];
  const allFlavors = flavorKeys
    .map((k) => ({ name: k, value: (tea as any)[`taste_${k}`] || 0 }))
    .filter((f) => f.value > 0);
  const flavors = allFlavors.sort((a, b) => b.value - a.value).slice(0, 3);
  const showChart = allFlavors.length >= 3;

  const intensityMap: Record<string, number> = { enyhe: 1, közepes: 2, erős: 3 };
  const intensityLevel = intensityMap[tea.intensity ?? ''] ?? 0;

  return (
    <div
      className={styles.card}
      style={{ backgroundColor: color }}
      onClick={() => onClick?.(tea)}
    >
      <div
        className={styles.mandala}
        style={
          {
            backgroundColor: mandalaColor,
            '--tiles-x': tilesX,
            '--tiles-y': tilesY,
            '--tile-x': tileX,
            '--tile-y': tileY,
            '--mandala-scale': 1.5, // nagyítás mértéke
          } as React.CSSProperties
        }
      />
      <div className={styles.name}>{tea.name}</div>
      <div className={styles.mood}>{tea.mood_short}</div>

      <div className={styles.info}>
        <div className={styles.flavor}>
          {/* ⬅︎ előbb a labelek */}
          <ul className={styles.flavorList}>
            {flavors.map((f) => (
              <li key={f.name}>
                <span className={styles.flavorValue}>{f.value}</span>
                <span className={styles.flavorName}>{f.name}</span>
              </li>
            ))}
          </ul>

          {/* ➜ utána a chart */}
          {showChart && (
            <TasteChart tea={tea} size={50} showLabels={false} />
          )}
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
