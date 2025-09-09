// components/TeaCard.tsx
import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import { getMandalaPath } from '../utils/mandala';
import TasteChart from './TasteChart';
import QuarterDonut, { Segment } from './QuarterDonut';
import DayDonut, { DaySegment } from './DayDonut';
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

const FLAVOR_KEYS = [
  'friss','édeskés','savanykás','fűszeres','virágos',
  'gyümölcsös','földes','kesernyés','csípős','umami',
] as const;

const INTENSITY_MAP: Record<string, number> = { enyhe: 1, közepes: 2, erős: 3 };

const SEASON_NAMES = ['tavasz', 'nyár', 'ősz', 'tél'] as const;

const DAY_NAMES = ['reggel', 'délelőtt', 'délután', 'este'] as const;

export default function TeaCard({
  tea,
  tileX, tileY, tilesX, tilesY,
  panel,
  onClick,
}: Props) {
  const color = getCategoryColor(tea.category); // main
  const mandalaColor = getCategoryColor(tea.category, 'light'); // LIGHT – kérés szerint
  const mandalaUrl = getMandalaPath(tea.category);
  const dotActiveColor = tea.intensity ? '#000' : getCategoryColor(tea.category, 'dark');
  const dotColor = getCategoryColor(tea.category, 'light');

  // ízek (top 3 lista + min. 3 esetén radar chart)
  const allFlavors = FLAVOR_KEYS
    .map((k) => {
      const v = (tea as any)[`taste_${k}`] as number | undefined;
      return { name: k as string, value: Number.isFinite(v) ? (v as number) : 0 };
    })
    .filter((f) => f.value > 0);

  const flavors = allFlavors.slice().sort((a, b) => b.value - a.value).slice(0, 3);
  const showChart = allFlavors.length >= 3;

  // intenzitás
  const intensityLevel = INTENSITY_MAP[tea.intensity ?? ''] ?? 0;

  // évszakok – negyed kördiagram
  const seasons = toStringArray(tea.season_recommended);
  const seasonSegments: Segment[] = SEASON_NAMES.map((s) => ({
    key: s,
    color: '#fff',
    active: seasons.includes(s),
  }));
  const seasonText = seasons.length === 4 ? 'egész évben' : seasons.join(', ');

  // napszakok – kördiagram + szövegezés + megjegyzések
  const rawDayparts = toStringArray(tea.daypart_recommended);
  let hasAfterMeal = false;
  let hasBeforeSleep = false;
  const daySet = new Set<string>();
  rawDayparts.forEach((d) => {
    if (d === 'kora_délután') {
      daySet.add('délután');
    } else if (d === 'étkezés_után') {
      hasAfterMeal = true;
    } else if (d === 'lefekvés_előtt') {
      hasBeforeSleep = true;
      daySet.add('este');
    } else if (d === 'bármikor') {
      DAY_NAMES.forEach((n) => daySet.add(n));
    } else {
      daySet.add(d);
    }
  });
  if (hasAfterMeal) DAY_NAMES.forEach((n) => daySet.add(n));

  const daySegments: DaySegment[] = [
    { key: 'reggel',   start: 4,  end: 10, color: '#fff', active: daySet.has('reggel') },
    { key: 'délelőtt', start: 10, end: 13, color: '#fff', active: daySet.has('délelőtt') },
    { key: 'délután',  start: 13, end: 19, color: '#fff', active: daySet.has('délután') },
    { key: 'este',     start: 19, end: 28, color: '#fff', active: daySet.has('este') },
  ];

  let dayText = '';
  if (hasAfterMeal) dayText = 'étkezés után';
  else if (hasBeforeSleep) dayText = 'lefekvés előtt';
  else if (daySet.size === 4) dayText = 'egész nap';
  else {
    const daytimeCount = ['reggel', 'délelőtt', 'délután'].filter((n) => daySet.has(n)).length;
    dayText = daytimeCount >= 2 ? 'napközben' : DAY_NAMES.filter((n) => daySet.has(n)).join(', ');
  }

  // ⬇️ HIÁNYZÓ dayNotes PÓTLÁSA (csak ha van extra info)
  const dayNotes: string[] = [];
  if (hasAfterMeal && !rawDayparts.includes('bármikor')) {
    dayNotes.push('Étkezés után különösen ajánlott.');
  }
  if (hasBeforeSleep) {
    dayNotes.push('Lefekvés előtt gyengédebben, kisebb adaggal.');
  }

  // előkészítés – hőfok / áztatás
  const temp = Number.isFinite(tea.tempC) ? (tea.tempC as number) : 0;
  const steep = Number.isFinite(tea.steepMin) ? (tea.steepMin as number) : 0;
  const steepPct = (Math.max(0, Math.min(steep, 10)) / 10) * 100;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.card}
        style={{ backgroundColor: color }}
        onClick={() => onClick?.(tea)}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : -1}
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
            <div className={`${styles.chartPanel} ${styles.seasonChart}`}>
              <QuarterDonut segments={seasonSegments} size={40} />
              <div className={styles.chartLabel}>{seasonText || '—'}</div>
            </div>
            <div className={styles.chartPanel}>
              <div className={styles.dayChart}>
                <DayDonut segments={daySegments} size={40} />
              </div>
              <div className={styles.chartLabel}>
                {dayText || '—'}
                {dayNotes.length > 0 &&
                  dayNotes.map((n) => (
                    <div key={n} className={styles.chartNote}>* {n}</div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {panel === 'prep' && (
          <div className={styles.prepPanel}>
            <div className={styles.tempBlock}>
              <div className={styles.thermo}>
                <div
                  className={styles.thermoFill}
                  style={{ width: `${Math.min(100, Math.max(0, temp))}%` }}
                />
              </div>
              <div className={styles.prepLabel}>
                <div>forrázás</div>
                <div className={styles.prepValue}>{temp} °C</div>
              </div>
            </div>
            <div className={styles.steepChart}>
              <svg width={40} height={40} viewBox="0 0 36 36" aria-hidden="true" focusable="false">
                <circle cx={18} cy={18} r={16} stroke="#fff" strokeWidth={4} fill="none" />
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
              <div className={styles.steepIcon} aria-hidden>⏱️</div>
            </div>
            <div className={styles.prepLabel}>
              <div>áztatás</div>
              <div className={styles.prepValue}>{steep} perc</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
