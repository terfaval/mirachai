// components/TeaCard.tsx
import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor, getTasteColor } from '../utils/colorMap';
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

const DAY_NAMES = ['reggel', 'délután', 'este'] as const;

export default function TeaCard({
  tea,
  tileX, tileY, tilesX, tilesY,
  panel,
  onClick,
}: Props) {
  const color = getCategoryColor(tea.category); // main
  const colorDark = getCategoryColor(tea.category, 'dark');
  const colorLight = getCategoryColor(tea.category, 'light');
  const mandalaUrl = getMandalaPath(tea.category);
  const dotActiveColor = colorDark;
  const dotColor = colorLight;
  const mandalaColor = colorLight;

  // ízek (top 3 lista + min. 3 esetén radar chart)
  const allFlavors = FLAVOR_KEYS
    .map((k) => {
      const v = (tea as any)[`taste_${k}`] as number | undefined;
      return { name: k as string, value: Number.isFinite(v) ? (v as number) : 0 };
    })
    .filter((f) => f.value > 0);

  const flavors = allFlavors.slice().sort((a, b) => b.value - a.value).slice(0, 3);
  const showChart = allFlavors.length > 0;

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
      } else if (d === 'délelőtt') {
      daySet.add('reggel');
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
    { key: 'reggel',  start: 1,  end: 3, color: '#fff', active: daySet.has('reggel') },
    { key: 'délután', start: 4, end: 6, color: '#fff', active: daySet.has('délután') },
    { key: 'este',    start: 7, end: 9, color: '#fff', active: daySet.has('este') },
  ];

  let dayText = '';
  if (hasAfterMeal) dayText = 'étkezés után';
  else if (hasBeforeSleep) dayText = 'lefekvés előtt';
  else if (daySet.size === 3) dayText = 'egész nap';
  else {
    const daytimeCount = ['reggel', 'délután'].filter((n) => daySet.has(n)).length;
    dayText = daytimeCount >= 2 ? 'napközben' : DAY_NAMES.filter((n) => daySet.has(n)).join(', ');
  }

  // előkészítés – hőfok / áztatás
  const temp = Number.isFinite(tea.tempC) ? (tea.tempC as number) : 0;
  const steep = Number.isFinite(tea.steepMin) ? (tea.steepMin as number) : 0;
  const steepPct = (Math.max(0, Math.min(steep, 10)) / 10) * 100;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.card}
        style={{
          backgroundColor: color,
          '--color-dark': colorDark,
          '--color-light': colorLight,
        } as React.CSSProperties}
        onClick={() => onClick?.(tea)}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : -1}
      >
        <div
          className={styles.mandala}
          style={
            {
              '--mandala-fill': colorLight,
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
            <div className={styles.tasteBox}>
              <ul className={styles.flavorList}>
                {flavors.map((f) => (
                  <li key={f.name}>
                    <span className={styles.flavorValue}>{f.value}</span>
                    <span
                      className={styles.flavorName}
                      style={{ color: getTasteColor(`taste_${f.name}`) }}
                    >
                      {f.name}
                    </span>
                  </li>
                ))}
              </ul>
              {showChart && <TasteChart tea={tea} size={50} showLabels={false} />}
            </div>
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
            <span className={styles.categoryPill} style={{ backgroundColor: colorDark }}>
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
              <div className={styles.chartLabel}>{dayText || '—'}</div>
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
                <circle cx={18} cy={18} r={16} stroke={colorLight} strokeWidth={4} fill="none" />
                <circle
                  cx={18}
                  cy={18}
                  r={16}
                  stroke={colorDark}
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
