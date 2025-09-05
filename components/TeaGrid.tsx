import TeaCard from './TeaCard';
import styles from '../styles/TeaGrid.module.css';
import { Tea } from '../utils/filter';

interface Props {
  teas: Tea[];
}

export default function TeaGrid({ teas }: Props) {
  return (
    <div className={styles.grid}>
      {teas.map((tea) => (
        <div key={tea.id} className={styles.cell}>
          <TeaCard tea={tea} />
        </div>
      ))}
    </div>
  );
}