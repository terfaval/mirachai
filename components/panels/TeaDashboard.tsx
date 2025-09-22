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

  const TASTE_SIZE = 220;
  const TASTE_ROTATION_DEG = 0;

  return (
    <section className={styles.panelElement} data-panel="tea-dashboard">
      <div className={styles.dashboardLayout}>
        <div className={`${styles.panelBox} ${styles.panelCard} ${styles.dashboardIngredients}`}>
          <div className={styles.dashboardCaffeineOverlay}>
            <div className={styles.dashboardCaffeineCard}>
              <CaffeineBar value={caffeine} color={colorDark} />
            </div>
          </div>

          <div className={styles.dashboardIngredientsBar}>
            <IngredientsStack ingredients={ingredients} orientation="horizontal" />
          </div>
        </div>

        {description && (
          <div className={`${styles.panelBox} ${styles.panelCard}`}>
            <p className={styles.dashboardDescription}>{description}</p>
          </div>
        )}

        <div className={styles.dashboardRow}>
          <div className={`${styles.panelBox} ${styles.panelCard} ${styles.dashboardTasteCard}`}>
            <TasteChart
              tea={tea}
              size={TASTE_SIZE}
              rotationDeg={TASTE_ROTATION_DEG}
              showLabels={false}
            />
          </div>

          <div className={`${styles.panelBox} ${styles.panelCard} ${styles.dashboardFocusCard}`}>
            <FocusChart
              data={focusData}
              size={TASTE_SIZE}
              colorDark={colorDark}
              layout="row"
            />
          </div>
        </div>
      </div>
    </section>
  );
}