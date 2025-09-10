import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import HeaderPanel from '@/components/panels/HeaderPanel';
import DescPanel from '@/components/panels/DescPanel';
import TasteFocusPanel from '@/components/panels/TasteFocusPanel';
import IngredientCaffeinePanel from '@/components/panels/IngredientCaffeinePanel';
import PrepServePanel from '@/components/panels/PrepServePanel';
import { getCategoryColor } from '../utils/colorMap';
import MandalaBackground from '@/components/panels/MandalaBackground';

interface Props {
  tea: Tea;
  onClose: () => void;
}

export default function TeaModal({ tea, onClose }: Props) {
  const colorDark = getCategoryColor(tea.category, 'dark') ?? '#2D1E3E';
  const colorLight = getCategoryColor(tea.category, 'light') ?? 'rgba(0,0,0,0.05)';
  const colorMain = getCategoryColor(tea.category, 'main') ?? '#CCCCCC';
  
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
        <div
          className={styles.frontLayer}
          style={{ background: `linear-gradient(180deg, ${colorLight} 0%, #FFFFFF 65%)` }}
        />
        <button className={styles.close} onClick={onClose} aria-label="Bezárás">
          ×
        </button>
        {/*
          BEGIN MODAL CONTENT (replace the existing inner layout with this)
        */}
        <div className={styles.content}>
          <HeaderPanel tea={tea} colorDark={colorDark} />
          <div className={styles.spacer} />
          <DescPanel description={tea.description ?? ''} colorDark={colorDark} imageSrc="/tea-sample-1.png" />
          <div className={styles.spacer} />
          <TasteFocusPanel tea={tea} colorDark={colorDark} />
          <div className={styles.spacer} />
          <IngredientCaffeinePanel tea={tea} colorScale={{}} colorDark={colorDark} />
          <div className={styles.spacer} />
          <PrepServePanel tea={tea} colorScale={{}} />
        </div>
        {/*
          END MODAL CONTENT
        */}
      </div>
    </div>
  );
}