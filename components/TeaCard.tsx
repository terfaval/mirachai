import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import TasteChart from './TasteChart';

type Props = {
  tea: Tea;
  tileX: number;   // 0..tilesX-1
  tileY: number;   // 0..tilesY-1
  tilesX: number;  // pl. 3
  tilesY: number;  // pl. 3
};

export default function TeaCard({ tea, tileX, tileY, tilesX, tilesY }: Props) {
  const color = getCategoryColor(tea.category);
  const mandalaColor = getCategoryColor(tea.category, 'white');
  const dotActiveColor = tea.intensity ? '#000' : getCategoryColor(tea.category, 'dark');
  const dotColor = getCategoryColor(tea.category, 'light');

  // (ha szeretnéd, felülírhatod a grid-indexet az egyedi tea.mandalaIndex-szel)
  // const idx = (tea.mandalaIndex ?? (tileY * tilesX + tileX)) % (tilesX * tilesY);
  // const tileXOverride = idx % tilesX;
  // const tileYOverride = Math.floor(idx / tilesX);

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
    <div className={styles.card} style={{ backgroundColor: color }}>
      {/* Mandala overlay: a teljes mandalakép 3×3-as rácsra osztva, a maszk pozícionálásával */}
      <div
        className={styles.mandala}
        style={
          {
            // szín, amit a maszk "kirajzol"
            backgroundColor: mandalaColor,
            // CSS változók a maszk méretezéséhez/pozicionálásához
            '--tiles-x': tilesX,
            '--tiles-y': tilesY,
            '--tile-x': tileX,
            '--tile-y': tileY,
          } as React.CSSProperties
        }
      />

      <div className={styles.name}>{tea.name}</div>
      <div className={styles.mood}>{tea.mood_short}</div>

      <div className={styles.info}>
        <div className={styles.flavor}>
          {showChart && (
            <TasteChart tea={tea} size={50} showLabels={false} />
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
