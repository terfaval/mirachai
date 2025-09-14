import { useMemo, useState } from 'react';
import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import HeaderPanel from '@/components/panels/HeaderPanel';
import DescPanel from '@/components/panels/DescPanel';
import MoreInfoPanel from '@/components/panels/MoreInfoPanel';
import TeaDashboard from '@/components/panels/TeaDashboard';
import PrepServePanel from '@/components/panels/PrepServePanel';
import { getCategoryColor, getAlternativeColor } from '../utils/colorMap';
import MandalaBackground from '@/components/panels/MandalaBackground';

// 👉 NEW: Brew Journey overlay
import BrewJourney from './brew/BrewJourney';

interface Props {
  tea: Tea;
  onClose: () => void;
}

export default function TeaModal({ tea, onClose }: Props) {
  const colorDark = getCategoryColor(tea.category, 'dark') ?? '#2D1E3E';
  const colorLight = getCategoryColor(tea.category, 'light') ?? 'rgba(0,0,0,0.05)';
  const colorMain = getCategoryColor(tea.category, 'main') ?? '#CCCCCC';
  const colorAlternative = getAlternativeColor(tea.category);

  // 👉 NEW: Brew Journey open state
  const [brewOpen, setBrewOpen] = useState(false);

  // 👉 Robust slug (falls back to slugified name if tea.slug absent)
  const teaSlug = useMemo(() => {
    const raw = (tea as any).slug ?? tea.name ?? '';
    return String(raw)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, [tea]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        style={{ backgroundColor: colorMain }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.backLayer} style={{ background: colorMain }}>
          <MandalaBackground color={colorDark} category={tea.category} />
        </div>
        <button className={styles.close} onClick={onClose} aria-label="Bezárás">
          ×
        </button>

        {/* CONTENT */}
        <div
          className={styles.content}
          style={{ background: `linear-gradient(180deg, ${colorLight} 0%, #FFFFFF 65%)` }}
        >
          <HeaderPanel tea={tea} colorDark={colorDark} />
          <div className={styles.spacer} />
          <DescPanel
            description={tea.description ?? ''}
            colorDark={colorDark}
            categoryColor={colorMain}
            imageSrc="/tea-sample-1.png"
            origin={tea.origin ?? ''}
          />
          <div className={styles.spacer} />
          <MoreInfoPanel text={tea.fullDescription ?? ''} colorDark={colorDark} />
          <div className={styles.spacer} />
          <TeaDashboard tea={tea} colorDark={colorDark} />
          <div className={styles.spacer} />
          <PrepServePanel tea={tea} infoText={tea.when ?? ''} />
          <div className={styles.spacer} />

          {/* 👉 UPDATED CTA: opens Brew Journey */}
          <button
            type="button"
            className={styles.helpButton}
            style={{ backgroundColor: colorAlternative }}
            onClick={() => setBrewOpen(true)}
          >
            Főzzük meg!
          </button>
        </div>

        {/* Brew Journey overlay (on top). It has its own fullscreen backdrop. */}
        {brewOpen && (
          <BrewJourney
            tea={{ slug: teaSlug, name: tea.name }}
            onClose={() => setBrewOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
