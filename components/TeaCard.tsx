// components/TeaCard.tsx
import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import { getMandalaPath } from '../utils/mandala';
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
  const color = getCategoryColor(tea.category);                    // main
  const mandalaColor = getCategoryColor(tea.category, 'light');    // LIGHT – kérés szerint
  const mandalaUrl = getMandalaPath(tea.category);
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
            /* LIGHT szín beégetve a maszk kitöltéséhez */
            '--mandala-fill': mandalaColor,

            /* mozaik-paraméterek */
            '--tiles-x': tilesX,
            '--tiles-y': tilesY,
            '--tile-x': tileX,
            '--tile-y': tileY,

            /* nagyobb mandala */
            '--mandala-scale': 1,
            '--mandala-prezoom': 1.5,

            /* az aktuális kategória mandalája */
            '--mandala-url': `url(${mandalaUrl})`,
          } as React.CSSProperties
        }
      />
      <div className={styles.name}>{tea.name}</div>
      <div className={styles.mood}>{tea.mood_short}</div>

      <div className={styles.info}>
        <ul className={styles.flavorList}>
          {flavors.map((f) => (
            <li key={f.name}>
              <span className={styles.flavorValue}>{f.value}</span>
              <span className={styles.flavorName}>{f.name}</span>
            </li>
          ))}
        </ul>

        {showChart && <TasteChart tea={tea} size={50} showLabels={false} />}

        <div className={styles.intensity}>
          <div className={styles.dots}>
            {[1, 2, 3].map((i) => (
              <span
                key={`intensity-${i}`}
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
