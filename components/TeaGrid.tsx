import { useEffect, useRef, useState } from 'react';
import TeaCard, { PanelKey } from './TeaCard';
import styles from '../styles/TeaGrid.module.css';
import { Tea } from '../utils/filter';
import InfoPanelSidebar from './InfoPanelSidebar';
import BrowseToolsSidebar from './BrowseToolsSidebar';
import { SortKey } from './sortOptions';

export type ActiveSelection = {
  id: string;
  label: string;
  onRemove: () => void;
  icon?: string;
  iconAlt?: string;
};

type Props = {
  items: Tea[];
  page: number;
  perPage?: number;
  onTeaClick?: (tea: Tea) => void;
  gridId?: string;
  onTileFocus?: (tea: Tea) => void;
  tilesX?: number;
  tilesY?: number;
  query: string;
  onQueryChange: (value: string) => void;
  sort: SortKey;
  onChangeSort: (key: SortKey) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  activeSelections?: ActiveSelection[];
};

function compareIdAsc(a: any, b: any) {
  const na = Number(a);
  const nb = Number(b);
  const aNum = Number.isFinite(na) ? na : null;
  const bNum = Number.isFinite(nb) ? nb : null;
  if (aNum !== null && bNum !== null) return aNum - bNum;
  return String(a).localeCompare(String(b), 'hu', { numeric: true });
}

export default function TeaGrid({
  items,
  page,
  perPage,
  onTeaClick,
  gridId = 'tea-grid',
  onTileFocus,
  tilesX = 3,
  tilesY = 3,
  query,
  onQueryChange,
  sort,
  onChangeSort,
  onOpenFilters,
  activeFilterCount,
  activeSelections = [], 
}: Props) {
  const effectivePerPage = perPage ?? tilesX * tilesY;
  const start = (page - 1) * effectivePerPage;
  const pageItems = [...items]
    .sort((a, b) => compareIdAsc(a.id, b.id))
    .slice(start, start + effectivePerPage);
  const [panel, setPanel] = useState<PanelKey>('consumption');
  const [renderTeas, setRenderTeas] = useState<Tea[]>(pageItems);
  const [incomingTeas, setIncomingTeas] = useState<Tea[] | null>(null);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [dir, setDir] = useState<1 | -1>(1);
  const timerRef = useRef<number | null>(null);

  const cells = Array.from({ length: tilesX * tilesY });

  useEffect(() => {
    const same =
      renderTeas.length === pageItems.length &&
      renderTeas.every((t, i) => t?.id === pageItems[i]?.id);
    if (same) return;

    const newDir =
      compareIdAsc(pageItems[0]?.id, renderTeas[0]?.id) >= 0 ? 1 : -1;
    setDir(newDir);
    setIncomingTeas(pageItems);
    setPhase('exit');

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setRenderTeas(pageItems);
      setIncomingTeas(null);
      setPhase('enter');
      timerRef.current = window.setTimeout(() => {
        setPhase('idle');
        timerRef.current = null;
      }, 320);
    }, 320);
  }, [pageItems, renderTeas]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className={styles.container}
      style={{ ['--tiles-x' as any]: tilesX, ['--tiles-y' as any]: tilesY }}
    >
      {activeSelections.length > 0 && (
        <div className={styles.activeSelectionBar}>
          {activeSelections.map((item) => (
            <div key={item.id} className={styles.activeSelectionCard}>
              {item.icon ? (
                <img
                  src={item.icon}
                  alt={item.iconAlt ?? ''}
                  className={styles.activeSelectionIcon}
                  aria-hidden={item.iconAlt ? undefined : true}
                />
              ) : null}
              <span className={styles.activeSelectionLabel}>{item.label}</span>
              <button
                type="button"
                className={styles.activeSelectionRemove}
                onClick={item.onRemove}
                aria-label={`\u201E${item.label}\u201D eltávolítása`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.gridWrap}>
        <InfoPanelSidebar panel={panel} onChange={setPanel} />
        <BrowseToolsSidebar
          query={query}
          onChangeQuery={onQueryChange}
          sort={sort}
          onChangeSort={onChangeSort}
          onOpenFilters={onOpenFilters}
          activeFilterCount={activeFilterCount}
        />

        <div
          id={gridId}
          role="grid"
          tabIndex={-1}
          className={[
            styles.grid,
            phase === 'exit' && (dir === 1 ? styles.slideOutLeft : styles.slideOutRight),
            phase === 'enter' && (dir === 1 ? styles.slideInRight : styles.slideInLeft),
          ]
            .filter(Boolean)
            .join(' ')}
          aria-live="polite"
        >
          {cells.map((_, idx) => {
            const tea = renderTeas[idx];
            const key = tea ? `tea-${tea.id}` : `empty-${idx}`;
            if (!tea) return <div key={key} className={styles.cell} />;
            const tileX = idx % tilesX;
            const tileY = Math.floor(idx / tilesX);
            return (
              <div key={key} className={styles.cell} onFocus={() => onTileFocus?.(tea)}>
                <TeaCard
                  tea={tea}
                  tileX={tileX}
                  tileY={tileY}
                  tilesX={tilesX}
                  tilesY={tilesY}
                  onClick={onTeaClick}
                  panel={panel}
                />
              </div>
            );
          })}
        </div>

        {incomingTeas && (
          <div
            className={[
              styles.grid,
              styles.ghost,
              dir === 1 ? styles.slideInRight : styles.slideInLeft,
            ].join(' ')}
          >
            {cells.map((_, idx) => {
              const tea = incomingTeas[idx];
              const key = tea ? `incoming-${tea.id}` : `incoming-empty-${idx}`;
              if (!tea) return <div key={key} className={styles.cell} />;
              const tileX = idx % tilesX;
              const tileY = Math.floor(idx / tilesX);
              return (
                <div key={key} className={styles.cell} onFocus={() => onTileFocus?.(tea)}>
                  <TeaCard
                    tea={tea}
                    tileX={tileX}
                    tileY={tileY}
                    tilesX={tilesX}
                    tilesY={tilesY}
                    onClick={onTeaClick}
                    panel={panel}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}