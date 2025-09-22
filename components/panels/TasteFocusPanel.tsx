import React from 'react';
import styles from '../../styles/TeaModal.module.css';
import TasteChart from '../panels/TasteChart';
import FocusChart from '../panels/FocusChart';
import { getFocusOrdered } from '@/utils/teaTransforms';

type Props = { tea: any; colorDark: string };

export default function TasteFocusPanel({ tea, colorDark }: Props) {
  const focusData = getFocusOrdered(tea); // [{key,label,value}] in fixed order
  return (
    <section className={styles.panelElement} data-panel="taste-focus">
      <div className={styles.tasteFocusRow}>
        {/* Taste – left */}
        <div className={styles.panelBox}>
          <TasteChart
            tea={tea}
            size={240}
            minValue={1}
            pointRadiusBase={10}
            connectByStrongest
            colorDark={colorDark}
          />
        </div>

        {/* Focus – right */}
        <div className={styles.panelBox}>
          <FocusChart data={focusData} size={240} colorDark={colorDark} />
        </div>
      </div>
    </section>
  );
}

// Notes:
// - We rely on TasteChart extended props (minValue, pointRadiusBase, connectByStrongest, colorDark).
// - We render labels at points inside TasteChart itself (no side list).
