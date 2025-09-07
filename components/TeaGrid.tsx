import TeaCard from './TeaCard';
import styles from '../styles/TeaGrid.module.css';
import { Tea } from '../utils/filter';

interface Props {
  teas: Tea[];
}

export default function TeaGrid({ teas }: Props) {
  const cells = Array.from({ length: 9 });
  return (
    <div className={styles.grid}>
      {cells.map((_, idx) => (
        <div key={idx} className={styles.cell}>
          {teas[idx] && <TeaCard tea={teas[idx]} />}
        </div>
      ))}
    </div>
  );
}