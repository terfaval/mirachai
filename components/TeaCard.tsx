import styles from '../styles/TeaCard.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';

interface Props {
  tea: Tea;
}

export default function TeaCard({ tea }: Props) {
  const color = getCategoryColor(tea.category);
  return (
    <div className={styles.card} style={{ backgroundColor: color }}>
      <div className={styles.name}>{tea.name}</div>
      <div className={styles.mood}>{tea.mood_short}</div>
    </div>
  );
}