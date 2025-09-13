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
  const TASTE_SIZE = 360;
  const INNER_ZERO_SCALE = 0.95;
  const ICON_SIZE = 64;

  return (
    <section className={styles.panelElement} data-panel="tea-dashboard">
      <div style={{ display: 'grid', gap: 24 }}>
        <div className={styles.panelBox}>
          <IngredientsStack ingredients={ingredients} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24 }}>
          <div
            className={styles.panelBox}
            style={{
              borderRadius: '9999px',
              padding: 24,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              aspectRatio: '1 / 1',
            }}
          >
            <TasteChart
              tea={tea}
              size={TASTE_SIZE}
              innerZeroScale={INNER_ZERO_SCALE}
              iconSizePx={ICON_SIZE}
            />

            <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
              <div
                style={{
                  background: '#fff',
                  borderRadius: '9999px',
                  padding: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                }}
              >
                <CaffeineBar value={caffeine} color={colorDark} />
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: '9999px',
                  padding: 8,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                }}
              >
                <FocusChart data={focusData} size={160} colorDark={colorDark} />
              </div>
            </div>
          </div>

          <div className={styles.panelBox}>
            <ServeModes tea={tea} />
          </div>
        </div>
      </div>
    </section>
  );
}