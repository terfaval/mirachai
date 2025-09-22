import React from 'react';
import styles from '../../styles/TeaModal.module.css';
import TasteChart from '../panels/TasteChart';
import FocusChart from '../panels/FocusChart';
import { getFocusOrdered } from '@/utils/teaTransforms';

type Props = { tea: any; colorDark: string };

type TasteFocusRowStyle = React.CSSProperties & {
  '--tf-col'?: string;
};

export default function TasteFocusPanel({ tea, colorDark }: Props) {
  const focusData = getFocusOrdered(tea); // [{key,label,value}] in fixed order
  const tasteChartSize = 220;
  const focusChartSize = 200;
  const columnCount = focusData.length + 1;
  const rowStyle: TasteFocusRowStyle = {
    '--tf-col': String(columnCount),
  };
  return (
    <section className={styles.panelElement} data-panel="taste-focus">
      <div className={styles.tasteFocusRow} style={rowStyle}>
        {/* Taste – left */}
        <div className={`${styles.panelBox} ${styles.tasteFocusCard}`}>
          <TasteChart
            tea={tea}
            size={tasteChartSize}
            minValue={1}
            pointRadiusBase={9}
            connectByStrongest
            colorDark={colorDark}
            showLabels={false}
          />
        </div>

        {/* Focus – right */}
        {focusData.map((focus) => (
          <div
            key={focus.key}
            className={`${styles.panelBox} ${styles.tasteFocusCard} ${styles.focusChartCard}`}
          >
            <FocusChart
              data={[focus]}
              size={focusChartSize}
              colorDark={colorDark}
              layout="row"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// Notes:
// - We rely on TasteChart extended props (minValue, pointRadiusBase, connectByStrongest, colorDark).
// - We render labels at points inside TasteChart itself (no side list).
