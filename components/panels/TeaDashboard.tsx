import React from 'react';
import styles from '../../styles/TeaModal.module.css';
import IngredientsStack from '@/components/ingredients/IngredientsStack';
import AlternativeTasteChart from './AlternativeTasteChart';
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
  const ALT_TASTE_WIDTH = 360;
  const ALT_ICON_SIZE = 56;
  const ALT_BAR_HEIGHT = 32;

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
              <AlternativeTasteChart
                tea={tea}
                width={ALT_TASTE_WIDTH}
                iconSize={ALT_ICON_SIZE}
                barHeight={ALT_BAR_HEIGHT}
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