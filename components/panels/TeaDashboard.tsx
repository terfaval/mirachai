import React from 'react';
import styles from '../../styles/TeaModal.module.css';
import IngredientsStack from '@/components/ingredients/IngredientsStack';
import CaffeineBar from '@/components/ingredients/CaffeineBar';
import { buildIngredients, caffeineToPct } from '@/utils/teaTransforms';

interface Props {
  tea: any;
  colorDark: string;
}

export default function TeaDashboard({ tea, colorDark }: Props) {
  const ingredients = buildIngredients(tea);
  const caffeine = caffeineToPct(tea);

  const description = (tea.fullDescription ?? '').trim();

  return (
    <section className={styles.panelElement} data-panel="tea-dashboard">
      <div className={styles.dashboardLayout}>
        <div className={`${styles.panelBox} ${styles.panelCard} ${styles.dashboardIngredients}`}>
          <div className={styles.dashboardCaffeineCard}>
            <CaffeineBar value={caffeine} color={colorDark} />
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

      </div>
    </section>
  );
}