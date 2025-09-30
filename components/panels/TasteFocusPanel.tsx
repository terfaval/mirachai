import React, { useMemo } from 'react';
import styles from '../../styles/TeaModal.module.css';
import TasteChart from '../panels/TasteChart';
import FocusChart from '../panels/FocusChart';
import { getFocusOrdered } from '@/utils/teaTransforms';
import { getTasteColor } from '../../utils/colorMap';

type Props = { tea: any; colorDark: string };

type TasteHighlight = {
  key: string;
  label: string;
  value: number;
  color: string;
  icon: string;
};

const TASTE_ORDER = [
  'taste_friss',
  'taste_gyümölcsös',
  'taste_virágos',
  'taste_savanykás',
  'taste_kesernyés',
  'taste_földes',
  'taste_umami',
  'taste_fűszeres',
  'taste_csípős',
  'taste_édeskés',
] as const;

const TASTE_STRENGTH_LABELS: Record<number, string> = {
  1: 'enyhe',
  2: 'közepes',
  3: 'erős',
};

const TASTE_ICON_FILE: Record<(typeof TASTE_ORDER)[number], string> = {
  taste_friss: 'friss',
  taste_gyümölcsös: 'gyumolcsos',
  taste_virágos: 'viragos',
  taste_savanykás: 'savanyu',
  taste_kesernyés: 'keseru',
  taste_földes: 'foldes',
  taste_umami: 'umami',
  taste_fűszeres: 'fuszeres',
  taste_csípős: 'csipos',
  taste_édeskés: 'edes',
};

const buildTasteHighlights = (tea: any): TasteHighlight[] => {
  const entries = TASTE_ORDER.map((key) => {
    const raw = Number((tea as any)?.[key] ?? 0);
    const value = Number.isFinite(raw) ? Math.max(0, Math.min(raw, 3)) : 0;
    const label = key.replace('taste_', '').replace(/_/g, ' ');
    const iconSlug = TASTE_ICON_FILE[key] ?? key.replace('taste_', '').replace(/_/g, '');
    return {
      key,
      label,
      value,
      color: getTasteColor(key),
      icon: `/tastes/icon_${iconSlug}.svg`,
    };
  });

  return entries
    .filter((entry) => entry.value > 0)
    .sort((a, b) => {
      if (b.value !== a.value) {
        return b.value - a.value;
      }
      return TASTE_ORDER.indexOf(a.key) - TASTE_ORDER.indexOf(b.key);
    });
};

export default function TasteFocusPanel({ tea, colorDark }: Props) {
  const focusData = getFocusOrdered(tea); // [{key,label,value}] in fixed order
  const tasteChartSize = 220;
  const focusChartSize = 160;

  const tasteHighlights = useMemo(() => buildTasteHighlights(tea), [tea]);

  return (
    <>
      <section className={styles.panelElement} data-panel="taste">
        <div className={`${styles.panelBox} ${styles.tastePanelBox}`}>
          <div className={styles.tastePanelContent}>
            <div className={styles.tasteChartColumn}>
              <TasteChart
                tea={tea}
                size={tasteChartSize}
                minValue={1}
                pointRadiusBase={9}
                connectByStrongest
                colorDark={colorDark}
                showLabels={false}
                disableTooltip
              />
            </div>
            <div className={styles.tasteHighlightsGrid}>
              {tasteHighlights.map((entry) => {
                const strength = TASTE_STRENGTH_LABELS[entry.value];
                const text = strength
                  ? `${strength} ${entry.label}`.trim()
                  : entry.label;
                return (
                  <div
                    key={entry.key}
                    className={styles.tasteHighlightCard}
                    style={{
                      '--taste-accent': entry.color,
                    } as React.CSSProperties}
                  >
                    <span
                      className={styles.tasteHighlightIcon}
                      style={{
                        WebkitMaskImage: `url(${entry.icon})`,
                        maskImage: `url(${entry.icon})`,
                      }}
                      aria-hidden
                    />
                    <span className={styles.tasteHighlightText}>{text}</span>
                  </div>
                );
              })}
            </div>
            <div className={styles.focusHighlightsRow}>
              {focusData.map((focus) => (
                <div
                  key={focus.key}
                  className={`${styles.tasteFocusCard} ${styles.focusChartCard} ${styles.focusHighlightCard}`}
                >
                  <FocusChart
                    data={[focus]}
                    size={focusChartSize}
                    colorDark={colorDark}
                    layout="row"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// Notes:
// - We rely on TasteChart extended props (minValue, pointRadiusBase, connectByStrongest, colorDark).
// - We render labels at points inside TasteChart itself (no side list).
