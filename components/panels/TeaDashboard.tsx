import React from 'react';
import styles from '../../styles/TeaModal.module.css';
import IngredientsStack from '@/components/ingredients/IngredientsStack';
import TasteChart from './TasteChart';
import FocusChart from './FocusChart';
import CaffeineBar from '@/components/ingredients/CaffeineBar';
import { buildIngredients, getFocusOrdered, caffeineToPct } from '@/utils/teaTransforms';

interface Props {
  tea: any;
  colorDark: string;
}

export default function TeaDashboard({ tea, colorDark }: Props) {
  const ingredients = buildIngredients(tea);
  const focusData = getFocusOrdered(tea);
  const caffeine = caffeineToPct(tea);

  const description = (tea.fullDescription ?? '').trim();

  const TASTE_SIZE = 300;
  const ICON_SIZE = 64;
  const TASTE_ROTATION_DEG = 0;

  return (
    <section className={styles.panelElement} data-panel="tea-dashboard">
      <div className={styles.dashboardGrid}>
        <div
          className={`${styles.panelBox} ${styles.panelCard}`}
          style={{ display: 'flex' }}
        >
          <IngredientsStack
            ingredients={ingredients}
            orientation="vertical"
          />
        </div>

        <div className={styles.dashboardColumn}>
          {description && (
            <div className={`${styles.panelBox} ${styles.panelCard}`}>
              <p className={styles.dashboardDescription}>{description}</p>
            </div>
          )}

          <div
            className={`${styles.panelBox} ${styles.panelCard} ${styles.dashboardTaste}`}
          >
            <div className={styles.dashboardCaffeine}>
              <CaffeineBar value={caffeine} color={colorDark} />
            </div>
            <div className={styles.dashboardTasteChart}>
              <TasteChart
                tea={tea}
                size={TASTE_SIZE}
                iconSizePx={ICON_SIZE}
                rotationDeg={TASTE_ROTATION_DEG}
              />
            </div>
          </div>

          <div className={`${styles.panelBox} ${styles.panelCard}`}>
            <FocusChart
              data={focusData}
              size={TASTE_SIZE}
              colorDark={colorDark}
              layout="grid"
            />
          </div>
        </div>
      </div>
    </section>
  );
}