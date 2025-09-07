import TeaCard from './TeaCard';
import styles from '../styles/TeaGrid.module.css';
import { Tea } from '../utils/filter';

interface Props {
  teas: Tea[];
}

const TILES_X = 3;
const TILES_Y = 3;

export default function TeaGrid({ teas }: Props) {
  const cells = Array.from({ length: TILES_X * TILES_Y });

  return (
    <div className={styles.grid}>
      {cells.map((_, idx) => {
        const tileX = idx % TILES_X;
        const tileY = Math.floor(idx / TILES_X);

        return (
          <div key={idx} className={styles.cell}>
            {teas[idx] && (
              <TeaCard
                tea={teas[idx]}
                tileX={tileX}
                tileY={tileY}
                tilesX={TILES_X}
                tilesY={TILES_Y}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
