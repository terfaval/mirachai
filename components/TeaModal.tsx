import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';
import { getMandalaPath } from '../utils/mandala';
import QuarterDonut, { Segment } from './QuarterDonut';
import DayDonut, { DaySegment } from './DayDonut';
import { toStringArray } from '../lib/toStringArray';

interface Props {
  tea: Tea;
  onClose: () => void;
}

const INTENSITY_MAP: Record<string, number> = {
  enyhe: 1,
  közepes: 2,
  erős: 3,
};

const SEASON_NAMES = ['tavasz', 'nyár', 'ősz', 'tél'] as const;
const DAY_NAMES = ['reggel', 'délután', 'este'] as const;

export default function TeaModal({ tea, onClose }: Props) {
  const color = getCategoryColor(tea.category);
  const colorDark = getCategoryColor(tea.category, 'dark');
  const light = getCategoryColor(tea.category, 'light');
  const mandala = getMandalaPath(tea.category);

  const intensityLevel = INTENSITY_MAP[tea.intensity ?? ''] ?? 0;

  const seasons = toStringArray(tea.season_recommended);
  const seasonSegments: Segment[] = SEASON_NAMES.map((s) => ({
    key: s,
    color: colorDark,
    active: seasons.includes(s),
  }));

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
    { key: 'reggel', start: 1, end: 3, color: colorDark, active: daySet.has('reggel') },
    { key: 'délután', start: 4, end: 6, color: colorDark, active: daySet.has('délután') },
    { key: 'este', start: 7, end: 9, color: colorDark, active: daySet.has('este') },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        style={{ backgroundColor: color }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={mandala} alt="" className={styles.mandala} />
        <button className={styles.close} onClick={onClose} aria-label="Bezárás">
          ×
        </button>
        <div
          className={styles.content}
          style={{ background: `linear-gradient(to bottom, ${light}, #fff)` }}
        >
          <div className={styles.topPanel}>
            <div>
              <h2 className={styles.title}>{tea.name}</h2>
              <div className={styles.pillsRow}>
                <span
                  className={styles.categoryPill}
                  style={{ backgroundColor: color }}
                  aria-label="kategória"
                >
                  {tea.category}
                </span>
                {tea.subcategory && (
                  <span className={styles.subcategoryPill} aria-label="alkategória">
                    {tea.subcategory}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.topCharts}>
              <div className={styles.intensityDots} aria-label="intenzitás">
                {[1, 2, 3].map((i) => (
                  <span
                    key={`intensity-${i}`}
                    className={i <= intensityLevel ? styles.dotOnBig : styles.dotOffBig}
                    style={i <= intensityLevel ? { backgroundColor: colorDark } : undefined}
                  />
                ))}
              </div>
              <QuarterDonut segments={seasonSegments} size={60} />
              <DayDonut segments={daySegments} size={60} />
            </div>
          </div>

          <div className={styles.descPanel}>
            {tea.description && (
              <div className={styles.descCol} style={{ backgroundColor: colorDark }}>
                <p className={styles.descText}>{tea.description}</p>
              </div>
            )}
            <div className={styles.imgCol}>
              <img src="/background.png" alt="" className={styles.descImage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}