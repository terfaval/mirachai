import TeaCard from './TeaCard';
import styles from '../styles/TeaGrid.module.css';
import { Tea } from '../utils/filter';

interface Props {
  teas: Tea[];
  onTeaClick?: (tea: Tea) => void;
}

const TILES_X = 3;
const TILES_Y = 3;
const TILE_COUNT = TILES_X * TILES_Y;

function compareIdAsc(a: any, b: any) {
  // számszerű rendezés, ha lehet; különben “okos” string összehasonlítás
  const na = Number(a);
  const nb = Number(b);
  const aNum = Number.isFinite(na) ? na : null;
  const bNum = Number.isFinite(nb) ? nb : null;
  if (aNum !== null && bNum !== null) return aNum - bNum;
  return String(a).localeCompare(String(b), 'hu', { numeric: true });
}

export default function TeaGrid({ teas, onTeaClick }: Props) {
  // 1) kategóriánként ID szerint sorba rendezett teák
  const byCategory = new Map<string, Tea[]>();
  for (const t of teas) {
    const list = byCategory.get(t.category) ?? [];
    list.push(t);
    byCategory.set(t.category, list);
  }
  for (const [cat, list] of byCategory) {
    list.sort((a, b) => compareIdAsc(a.id, b.id));
  }

  // 2) (category::id) → rang
  const rankMap = new Map<string, number>();
  for (const [cat, list] of byCategory) {
    list.forEach((t, i) => {
      rankMap.set(`${cat}::${t.id}`, i);
    });
  }

  // 3) fix 3×3 rács; a mandala-szelet indexe a kategória-rang szerint
  const cells = Array.from({ length: TILE_COUNT });
  return (
    <div className={styles.grid}>
      {cells.map((_, idx) => {
        const tea = teas[idx];
        if (!tea) {
          // üres cellák, ha kevesebb, mint 9 tea van
          return <div key={idx} className={styles.cell} />;
        }

        const rank = rankMap.get(`${tea.category}::${tea.id}`) ?? 0;
        const tileIndex = rank % TILE_COUNT;
        const tileX = tileIndex % TILES_X;
        const tileY = Math.floor(tileIndex / TILES_X);

        return (
          <div key={idx} className={styles.cell}>
            <TeaCard
              tea={tea}
              tileX={tileX}
              tileY={tileY}
              tilesX={TILES_X}
              tilesY={TILES_Y}
              onClick={onTeaClick}
            />
          </div>
        );
      })}
    </div>
  );
}
