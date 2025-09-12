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

  // ===== FINOMHANGOLHATÓ BEÁLLÍTÁSOK =====
  const CHART_SIZE = 300;     // ← növeld/csökkentsd, ha nagyobb/kisebb radart szeretnél (eredetileg 240)
  const INNER_ZERO_SCALE = 0.95; // ← a belső „0” kör mérete (0–1 * első lépcső sugara); 0.9-0.98 jellemzően biztonságos
  const ICON_SIZE = 28;       // ← a TasteChart ikon mérete px-ben
  const CENTER_BOX_MIN_H = 320; // ← min. magasság a középre igazításhoz (vizuális közép a panelBox-on belül)
  // =======================================

  // Központosító wrapper – mindkét chart dobozában ezt használjuk
  const centerWrap: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: CENTER_BOX_MIN_H,
  };

  return (
    <section className={styles.panelElement} data-panel="tea-dashboard">
      <div className={styles.caffeineLabel} style={{ background: colorDark }}>
        <CaffeineBar value={caffeine} color={colorDark} />
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        <div className={styles.panelBox}>
          <IngredientsStack ingredients={ingredients} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className={styles.panelBox}>
            {/* KÖZÉPRE IGAZÍTÁS + NAGYOBB CHART + NAGYOBB BELSŐ KÖR + IKON MÉRET */}
            <div style={centerWrap}>
              <TasteChart
                tea={tea}
                size={CHART_SIZE}
                innerZeroScale={INNER_ZERO_SCALE}
                iconSizePx={ICON_SIZE}
              />
            </div>
          </div>

          <div className={styles.panelBox}>
            {/* FocusChart is középre és kicsit nagyobbra véve a vizuális balansz miatt */}
            <div style={centerWrap}>
              <FocusChart
                data={focusData}
                size={CHART_SIZE}
                colorDark={colorDark}
              />
            </div>
          </div>
        </div>

        <div className={styles.panelBox}>
          <ServeModes tea={tea} />
        </div>
      </div>
    </section>
  );
}
