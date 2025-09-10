import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import HeaderPanel from '@/components/panels/HeaderPanel';
import DescPanel from '@/components/panels/DescPanel';
import TasteFocusPanel from '@/components/panels/TasteFocusPanel';
import IngredientCaffeinePanel from '@/components/panels/IngredientCaffeinePanel';
import PrepServePanel from '@/components/panels/PrepServePanel';
import { getCategoryColor } from '@/utils/colorMap';
import { getMandalaPath } from '@/utils/mandala';

interface Props {
  tea: Tea;
  onClose: () => void;
}

export default function TeaModal({ tea, onClose }: Props) {
  const colors = getCategoryColor(tea.category);
  const colorDark = colors?.dark ?? '#2D1E3E';
  const color = colors?.main ?? '#ffffff';
  const mandala = getMandalaPath(tea.category);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        style={{ backgroundColor: color }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={mandala} alt="" className={styles.mandala} />
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