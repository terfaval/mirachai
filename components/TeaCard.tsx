// components/TeaCard.tsx
import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import { getMandalaPath } from '../utils/mandala';
import TasteChart from './panels/TasteChart';
import QuarterDonut, { Segment } from './QuarterDonut';
import DayDonut from './DayDonut';
import { toStringArray } from '../lib/toStringArray';
import { buildDaySegments } from '@/utils/teaTransforms';

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

const FOCUS_KEYS = [
  { key: 'immunity', label: 'immunitás', color: '#58BFA4' },
  { key: 'relax', label: 'relaxáció', color: '#B5A4F5' },
  { key: 'focus', label: 'fókusz', color: '#F2A86C' },
  { key: 'detox', label: 'detox', color: '#6CC6E5' },
] as const;

const SEASON_NAMES = ['tavasz', 'nyár', 'ősz', 'tél'] as const;

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
  const tileRatioX = tilesX > 1 ? tileX / (tilesX - 1) : 0.5;
  const tileRatioY = tilesY > 1 ? tileY / (tilesY - 1) : 0.5;
  const dotActiveColor = colorDark;
  const dotColor = colorLight;

  // ízek (top 3 lista + min. 3 esetén radar chart)
  const allFlavors = FLAVOR_KEYS
    .map((k) => {
      const v = (tea as any)[`taste_${k}`] as number | undefined;
      return { name: k as string, value: Number.isFinite(v) ? (v as number) : 0 };
    })
    .filter((f) => f.value > 0);

  const showChart = allFlavors.length > 0;

  const focusEntries = FOCUS_KEYS.map(({ key, label, color }) => {
    const value = Number((tea as any)[`focus_${key}`]) || 0;
    return { key: `focus_${key}`, label, value: Math.max(0, Math.min(3, value)), color };
  });

  const hasFocusData = focusEntries.some((entry) => entry.value > 0);

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
  const { segments: daySegments, text: dayText } = buildDaySegments(tea, '#fff');

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
              '--tile-ratio-x': tileRatioX,
              '--tile-ratio-y': tileRatioY,
              '--mandala-scale': 1,
              '--mandala-prezoom': 2.3,
              '--mandala-url': `url(${mandalaUrl})`,
            } as React.CSSProperties
          }
        />
        <div className={styles.name}>{tea.name}</div>
        <div className={styles.mood}>{tea.mood_short}</div>

        {panel === 'consumption' && (
          <div className={styles.info}>
            <div className={styles.chartRow}>
              <div className={styles.chartCard}>
                {showChart ? (
                  <TasteChart
                    tea={tea}
                    size={64}
                    minValue={1}
                    pointRadiusBase={6}
                    showLabels={false}
                    rotationDeg={-90}
                    fullWidth
                  />
                ) : (
                  <div className={styles.chartPlaceholder}>—</div>
                )}
              </div>
              <div className={`${styles.chartCard} ${styles.intensityCard}`}>
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
              <div className={`${styles.chartCard} ${styles.focusCard}`}>
                <TasteChart
                  tea={tea}
                  size={64}
                  minValue={0}
                  pointRadiusBase={6}
                  showLabels={false}
                  rotationDeg={-90}
                  dataOverride={focusEntries}
                  tooltipLabelSuffix="hatás"
                  includeZeroValues
                  fullWidth
                />
                {!hasFocusData && (
                  <div className={styles.chartHint}>nincs fókusz adat</div>
                )}
              </div>
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
              <QuarterDonut segments={seasonSegments} size={40} rotation={-45} />
              <div className={styles.chartLabel}>{seasonText || '—'}</div>
            </div>
            <div className={styles.chartPanel}>
              <div className={styles.dayChart}>
                <DayDonut segments={daySegments} size={40} max={5} rotation={-90} />
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
