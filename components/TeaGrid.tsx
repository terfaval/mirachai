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
        <TeaCard key={tea.id} tea={tea} />
      ))}
    </div>
  );
}