// components/TeaCard.tsx
import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import { getMandalaPath } from '../utils/mandala';
import TasteChart from './TasteChart';
import QuarterDonut, { Segment } from './QuarterDonut';
import { toStringArray } from '../lib/toStringArray';

export type PanelKey = 'consumption' | 'category' | 'timing' | 'prep';

interface Props {
  tea: Tea;
  tileX: number;
  tileY: number;
  tilesX: number;
  tilesY: number;
  panel: PanelKey;
  onClick?: (tea: Tea) => void;
}

export default function TeaCard({ tea, tileX, tileY, tilesX, tilesY, panel, onClick }: Props) {
  const color = getCategoryColor(tea.category); // main
  const mandalaColor = getCategoryColor(tea.category, 'light'); // LIGHT – kérés szerint
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

  const seasonNames = ['tavasz', 'nyár', 'ősz', 'tél'];
  const seasonColors: Record<string, string> = {
    tavasz: '#92D050',
    nyár: '#FFD966',
    ősz: '#F4B183',
    tél: '#9DC3E6',
  };
  const seasons = toStringArray(tea.season_recommended);
  const seasonSegments: Segment[] = seasonNames.map((s) => ({
    key: s,
    color: seasonColors[s],
    active: seasons.includes(s),
  }));
  const seasonText = seasons.length === 4 ? 'egész évben' : seasons.join(', ');

  const dayNames = ['reggel', 'délelőtt', 'délután', 'este'];
  const dayColors: Record<string, string> = {
    reggel: '#FFE57F',
    délelőtt: '#FFCA28',
    délután: '#FB8C00',
    este: '#8E24AA',
  };
  const rawDayparts = toStringArray(tea.daypart_recommended);
  let hasAfterMeal = false;
  let hasBeforeSleep = false;
  const daySet = new Set<string>();
  rawDayparts.forEach((d) => {
    if (d === 'kora_délután') daySet.add('délután');
    else if (d === 'étkezés_után') {
      hasAfterMeal = true;
    } else if (d === 'lefekvés_előtt') {
      hasBeforeSleep = true;
      daySet.add('este');
    } else if (d === 'bármikor') {
      dayNames.forEach((n) => daySet.add(n));
    } else {
      daySet.add(d);
    }
  });
  if (hasAfterMeal) dayNames.forEach((n) => daySet.add(n));
  const daySegments: Segment[] = dayNames.map((n) => ({
    key: n,
    color: dayColors[n],
    active: daySet.has(n),
  }));
  let dayText = '';
  if (hasAfterMeal) dayText = 'étkezés után';
  else if (hasBeforeSleep) dayText = 'lefekvés előtt';
  else if (daySet.size === 4) dayText = 'egész nap';
  else {
    const daytimeCount = ['reggel', 'délelőtt', 'délután'].filter((n) => daySet.has(n)).length;
    if (daytimeCount >= 2) dayText = 'napközben';
    else dayText = dayNames.filter((n) => daySet.has(n)).join(', ');
  }

  const temp = tea.tempC ?? 0;
  const steep = tea.steepMin ?? 0;
  const steepPct = Math.max(0, Math.min(steep, 10)) / 10 * 100;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.card}
        style={{ backgroundColor: color }}
        onClick={() => onClick?.(tea)}
      >
        <div
          className={styles.mandala}
          style={
            {
              '--mandala-fill': mandalaColor,
              '--tiles-x': tilesX,
              '--tiles-y': tilesY,
              '--tile-x': tileX,
              '--tile-y': tileY,
              '--mandala-scale': 1,
              '--mandala-prezoom': 1.5,
              '--mandala-url': `url(${mandalaUrl})`,
            } as React.CSSProperties
          }
        />
        <div className={styles.name}>{tea.name}</div>
        <div className={styles.mood}>{tea.mood_short}</div>

        {panel === 'consumption' && (
          <div className={styles.info}>
            <ul className={styles.flavorList}>
              {flavors.map((f) => (
                <li key={f.name}>
                  <span className={styles.flavorValue}>{f.value}</span>
                  <span className={styles.flavorName}>{f.name}</span>
                </li>
              ))}
            </ul>

            <div className={styles.infoRight}>
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
        )}

        {panel === 'category' && (
          <div className={styles.categoryPanel}>
            <span className={styles.categoryPill} style={{ backgroundColor: color }}>
              {tea.category}
            </span>
            {tea.subcategory && (
              <span className={styles.subcategoryPill}>{tea.subcategory}</span>
            )}
          </div>
        )}

        {panel === 'timing' && (
          <div className={styles.timingPanel}>
            <div className={styles.seasonPanel}>
              <div className={styles.seasonChart}>
                <QuarterDonut segments={seasonSegments} size={40} />
              </div>
              <div className={styles.seasonText}>{seasonText}</div>
            </div>
            <div className={styles.seasonPanel}>
              <QuarterDonut segments={daySegments} size={40} />
              <div className={styles.seasonText}>{dayText}</div>
            </div>
          </div>
        )}

        {panel === 'prep' && (
          <div className={styles.prepPanel}>
            <div className={styles.tempBlock}>
              <div className={styles.prepLabel}>forrázás {temp} °C-on</div>
              <div className={styles.thermo}>
                <div className={styles.thermoFill} style={{ width: `${Math.min(100, temp)}%` }} />
              </div>
            </div>
            <div className={styles.steepBlock}>
              <div className={styles.prepLabel}>áztatás {steep} percig</div>
              <div className={styles.steepChart}>
                <svg width={40} height={40} viewBox="0 0 36 36">
                  <circle
                    cx={18}
                    cy={18}
                    r={16}
                    stroke="#fff"
                    strokeWidth={4}
                    fill="none"
                  />
                  <circle
                    cx={18}
                    cy={18}
                    r={16}
                    stroke="#000"
                    strokeWidth={4}
                    fill="none"
                    strokeDasharray={100}
                    strokeDashoffset={100 - steepPct}
                    pathLength={100}
                  />
                </svg>
                <div className={styles.steepIcon}>⏱️</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}