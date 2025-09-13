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
  const INNER_ZERO_SCALE = 0.95;
  const ICON_SIZE = 64;
  const TASTE_ROTATION_DEG = 0; // ízdiagram elforgatása fokban
  const CAFFEINE_Y_OFFSET = -120;  // kávéinfó függőleges eltolása px-ben
  const FOCUS_Y_OFFSET = 120;     // fókuszdiagram függőleges eltolása px-ben

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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                justifySelf: 'start',
                transform: `translateY(${CAFFEINE_Y_OFFSET}px)`,
              }}
            >
              <CaffeineBar value={caffeine} color={colorDark} />
            </div>

            <div style={{ justifySelf: 'center' }}>
              <TasteChart
                tea={tea}
                size={TASTE_SIZE}
                iconSizePx={ICON_SIZE}
                rotationDeg={TASTE_ROTATION_DEG}
              />
            </div>

            <div
              style={{
                justifySelf: 'end',
                transform: `translateY(${FOCUS_Y_OFFSET}px)`,
              }}
            >
              <FocusChart data={focusData} size={120} colorDark={colorDark} />
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