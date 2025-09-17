import React from 'react';
import styles from '../../styles/TeaModal.module.css';
import IngredientsStack from '@/components/ingredients/IngredientsStack';
import TasteChart from './TasteChart';
import FocusChart from './FocusChart';
import CaffeineBar from '@/components/ingredients/CaffeineBar';
import ServeModes from '@/components/ServeModes';
import { buildIngredients, getFocusOrdered, caffeineToPct } from '@/utils/teaTransforms';

interface Props {
  tea: any;
  colorDark: string;
}

export default function TeaDashboard({ tea, colorDark }: Props) {
  const ingredients = buildIngredients(tea);
  const focusData = getFocusOrdered(tea);
  const caffeine = caffeineToPct(tea);

  // finomhangolás
  const TASTE_SIZE = 300;
  const ICON_SIZE = 64;
  const TASTE_ROTATION_DEG = 0; // ízdiagram elforgatása fokban
  
  return (
    <section className={styles.panelElement} data-panel="tea-dashboard">
      <div style={{ display: 'grid', gap: 24 }}>
        <div className={styles.panelBox}>
          <IngredientsStack ingredients={ingredients} />
        </div>

        <div
          className={styles.panelBox}
          style={{ padding: 24, display: 'grid', gap: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <CaffeineBar value={caffeine} color={colorDark} />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
              gap: 24,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <TasteChart
                tea={tea}
                size={TASTE_SIZE}
                iconSizePx={ICON_SIZE}
                rotationDeg={TASTE_ROTATION_DEG}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FocusChart data={focusData} size={TASTE_SIZE} colorDark={colorDark} />
            </div>
          </div>

          <div>
            <ServeModes tea={tea} />
          </div>
        </div>
      </div>
    </section>
  );
}