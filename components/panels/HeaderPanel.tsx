import React from 'react';
import IntensityDots from '@/components/panels/IntensityDots';
import QuarterDonut from '@/components/QuarterDonut';
import DayDonut from '@/components/DayDonut';
import { buildSeasonSegments, buildDaySegments } from '@/utils/teaTransforms';
import styles from '../../styles/TeaModal.module.css';

type Props = {
  tea: any;
  colorDark: string;
};

export default function HeaderPanel({ tea, colorDark }: Props) {
  const { segments: seasonSegs, text: seasonText } = buildSeasonSegments(tea, colorDark);
  const { segments: daySegs, text: dayText } = buildDaySegments(tea, colorDark);

  const INTENSITY_MAP: Record<string, 1 | 2 | 3> = {
    enyhe: 1,
    kozepes: 2,
    eros: 3,
  };
  const intensityKey = String(tea.intensity || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const intensity = INTENSITY_MAP[intensityKey] ?? 2;

  return (
    <div className={styles.headerPanel}>
      <div className={styles.headerMeta}>
        <h1 className={`${styles.titleTitan} ${styles.headerTitle}`}>{tea.name}</h1>
        <div className={styles.headerPills}>
          <span className={styles.pill} style={{ background: colorDark, color: '#fff' }}>
            {tea.category}
          </span>
          {tea.subcategory ? <span className={`${styles.pill} ${styles.light}`}>{tea.subcategory}</span> : null}
        </div>
      </div>

      <div className={styles.headerCharts}>
        <div className={`${styles.headerChartCard} ${styles.headerIntensityCard}`}>
          <IntensityDots
            intensity={intensity}
            color={colorDark}
            orientation="column"
            dotSize={14}
            labelSize="0.95rem"
            dotGap={6}
          />
          <span className={styles.headerChartLabel}>intenzitas</span>
        </div>

        <div className={styles.headerChartCard}>
          <QuarterDonut
            segments={seasonSegs}
            size={64}
            strokeWidth={9}
            inactiveColor="rgba(0,0,0,0.08)"
            rotation={-45}
          />
          <span className={styles.headerChartValue} style={{ color: colorDark }}>
            {seasonText || '-'}
          </span>
        </div>

        <div className={styles.headerChartCard}>
          <DayDonut
            segments={daySegs}
            size={64}
            strokeWidth={9}
            inactiveColor="rgba(0,0,0,0.08)"
            max={5}
            rotation={-90}
          />
          <span className={styles.headerChartValue} style={{ color: colorDark }}>
            {dayText || '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
