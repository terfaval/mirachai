import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import HeaderPanel from '@/components/panels/HeaderPanel';
import DescPanel from '@/components/panels/DescPanel';
import MoreInfoPanel from '@/components/panels/MoreInfoPanel';
import TeaDashboard from '@/components/panels/TeaDashboard';
import PrepServePanel from '@/components/panels/PrepServePanel';
import { getCategoryColor, getIngredientColorScale } from '../utils/colorMap';
import MandalaBackground from '@/components/panels/MandalaBackground';

interface Props {
  tea: Tea;
  onClose: () => void;
}

export default function TeaModal({ tea, onClose }: Props) {
  const colorDark = getCategoryColor(tea.category, 'dark') ?? '#2D1E3E';
  const colorLight = getCategoryColor(tea.category, 'light') ?? 'rgba(0,0,0,0.05)';
  const colorMain = getCategoryColor(tea.category, 'main') ?? '#CCCCCC';
  const ingredientColors = getIngredientColorScale();
  
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
        {/*
          BEGIN MODAL CONTENT (replace the existing inner layout with this)
        */}
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
          />
          <div className={styles.spacer} />
          <MoreInfoPanel colorDark={colorDark} />
            <div className={styles.spacer} />
            <TeaDashboard tea={tea} colorScale={ingredientColors} colorDark={colorDark} />
            <div className={styles.spacer} />
            <MoreInfoPanel colorDark={colorDark} />
          <div className={styles.spacer} />
          <PrepServePanel tea={tea} colorScale={ingredientColors} />
        </div>
        {/*
          END MODAL CONTENT
        */}
      </div>
    </div>
  );
}