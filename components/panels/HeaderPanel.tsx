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
  const { segments: seasonSegs, text: seasonText } = buildSeasonSegments(
    tea,
    colorDark,
  );
  const { segments: daySegs, text: dayText } = buildDaySegments(tea, colorDark);

  const intensity = Math.min(3, Math.max(1, Number(tea.intensity ?? 2))) as 1 | 2 | 3;

  return (
    <div className="headerPanel" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:24 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <h1 className={styles.titleTitan} style={{ margin:0 }}>{tea.name}</h1>
        <div style={{ display:'flex', gap:8, alignItems:'center', opacity:.9 }}>
          <span className={styles.pill} style={{ background: colorDark, color:'#fff' }}>{tea.category}</span>
          {tea.subcategory ? <span className={`${styles.pill} ${styles.light}`}>{tea.subcategory}</span> : null}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:24 }}>
        <IntensityDots intensity={intensity} color={colorDark} />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <QuarterDonut
            segments={seasonSegs}
            inactiveColor="rgba(0,0,0,0.08)"
          />
          <span style={{ fontSize:'0.8rem', lineHeight:1, color:colorDark }}>
            {seasonText || '—'}
          </span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
          <DayDonut segments={daySegs} inactiveColor="rgba(0,0,0,0.08)" />
          <span style={{ fontSize:'0.8rem', lineHeight:1, color:colorDark }}>
            {dayText || '—'}
          </span>
        </div>
      </div>
    </div>
  );
}