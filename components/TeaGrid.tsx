import { useState } from 'react';
import TeaCard from './TeaCard';
import styles from '../styles/TeaGrid.module.css';
import { Tea } from '../utils/filter';

export type SortKey =
  | 'default'
  | 'nameAsc'
  | 'nameDesc'
  | 'relevanceDesc'
  | 'relevanceAsc'
  | 'intensityAsc'
  | 'intensityDesc'
  | 'steepMinAsc'
  | 'steepMinDesc';

interface Props {
  teas: Tea[];
  onTeaClick?: (tea: Tea) => void;
  sort: SortKey;
  onChangeSort: (key: SortKey) => void;
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

export default function TeaGrid({ teas, onTeaClick, sort, onChangeSort }: Props) {
  const [open, setOpen] = useState(false);
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
      <div className={styles.sortButton} onClick={() => setOpen(!open)}>
        <img src="/sort.svg" className={styles.sortIcon} alt="Rendezés" />
      </div>
      {open && (
        <table className={styles.sortPanel}>
          <tbody>
            <tr>
              <td>
                <button
                  onClick={() => {
                    onChangeSort('nameAsc');
                    setOpen(false);
                  }}
                  className={sort === 'nameAsc' ? styles.active : ''}
                >
                  Teák A-tól Z-ig
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={() => {
                    onChangeSort('nameDesc');
                    setOpen(false);
                  }}
                  className={sort === 'nameDesc' ? styles.active : ''}
                >
                  Teák Z-től A-ig
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={() => {
                    onChangeSort('relevanceDesc');
                    setOpen(false);
                  }}
                  className={sort === 'relevanceDesc' ? styles.active : ''}
                >
                  A leginkább releváns teák elől
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={() => {
                    onChangeSort('relevanceAsc');
                    setOpen(false);
                  }}
                  className={sort === 'relevanceAsc' ? styles.active : ''}
                >
                  A legkevésbé releváns teák elől
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={() => {
                    onChangeSort('intensityAsc');
                    setOpen(false);
                  }}
                  className={sort === 'intensityAsc' ? styles.active : ''}
                >
                  A legkevésbé intenzív teák elől
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={() => {
                    onChangeSort('intensityDesc');
                    setOpen(false);
                  }}
                  className={sort === 'intensityDesc' ? styles.active : ''}
                >
                  A leginkább intenzív teák elől
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={() => {
                    onChangeSort('steepMinAsc');
                    setOpen(false);
                  }}
                  className={sort === 'steepMinAsc' ? styles.active : ''}
                >
                  A leggyorsabb teák elől
                </button>
              </td>
            </tr>
            <tr>
              <td>
                <button
                  onClick={() => {
                    onChangeSort('steepMinDesc');
                    setOpen(false);
                  }}
                  className={sort === 'steepMinDesc' ? styles.active : ''}
                >
                  A leglassabb teák elől
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {cells.map((_, idx) => {
        const tea = teas[idx];
        const key = tea ? `tea-${tea.id}` : `empty-${idx}`;
        if (!tea) {
          // üres cellák, ha kevesebb, mint 9 tea van
          return <div key={key} className={styles.cell} />;
        }

        const rank = rankMap.get(`${tea.category}::${tea.id}`) ?? 0;
        const tileIndex = rank % TILE_COUNT;
        const tileX = tileIndex % TILES_X;
        const tileY = Math.floor(tileIndex / TILES_X);

        return (
          <div key={key} className={styles.cell}>
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
