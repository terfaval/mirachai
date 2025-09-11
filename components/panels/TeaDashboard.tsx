import React from 'react';
import styles from '../../styles/TeaModal.module.css';
import IngredientsStack from '@/components/ingredients/IngredientsStack';
import TasteChart from './TasteChart';
import FocusChart from './FocusChart';
import CaffeineBar from '@/components/ingredients/CaffeineBar';
import ServeModes from '@/components/ServeModes';
import { buildIngredients, getFocusOrdered, caffeineToPct } from '@/utils/teaTransforms';

type Props = {
  tea: any;
  colorDark: string;
};

export default function TeaDashboard({ tea, colorDark }: Props) {
  const ingredients = buildIngredients(tea);
  const focusData = getFocusOrdered(tea);
  const caffeine = caffeineToPct(tea);

  return (
    <section className={styles.panelElement} data-panel="tea-dashboard">
      <div style={{ display:'grid', gap:24 }}>
        <div style={{ display:'grid', gridTemplateColumns:'3fr 1fr', gap:24 }}>
          <div className={styles.panelBox}>
            <IngredientsStack ingredients={ingredients} />
          </div>
          <div className={styles.panelBox}>
            <TasteChart tea={tea} size={240} />
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 2fr', gap:24 }}>
          <div className={styles.panelBox}>
            <CaffeineBar value={caffeine} color={colorDark} />
          </div>
          <div className={styles.panelBox}>
            <FocusChart data={focusData} size={240} colorDark={colorDark} />
          </div>
          <div className={styles.panelBox}>
            <ServeModes tea={tea} />
          </div>
        </div>
      </div>
    </section>
  );
}