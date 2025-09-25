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
  onEnterFullscreen: () => void;
  isFullscreen: boolean;
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
  onEnterFullscreen,
  isFullscreen,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 768px)');
    const apply = (e: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile('matches' in e ? e.matches : (e as MediaQueryList).matches);
    };
    apply(mq);
    mq.addEventListener?.('change', apply);
    // @ts-ignore
    mq.addListener?.(apply);
    return () => {
      mq.removeEventListener?.('change', apply);
      // @ts-ignore
      mq.removeListener?.(apply);
    };
  }, []);

  const basePerPage = perPage ?? tilesX * tilesY;
  const effectivePerPage = isMobile ? 2 : basePerPage;
  const start = (page - 1) * effectivePerPage;
  const pageItems = items.slice(start, start + effectivePerPage);
  const [panel, setPanel] = useState<PanelKey>('category');
  const [renderTeas, setRenderTeas] = useState<Tea[]>(pageItems);
  const [incomingTeas, setIncomingTeas] = useState<Tea[] | null>(null);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [dir, setDir] = useState<1 | -1>(1);
  const timerRef = useRef<number | null>(null);

  // ⚠️ Mobilon 1×2-es rács, hogy a két kártya kitöltse a dobozt
  const layoutTilesX = isMobile ? 1 : tilesX;
  const layoutTilesY = isMobile ? 2 : tilesY;
  const cells = Array.from({ length: layoutTilesX * layoutTilesY });

  // dísz / maszk méretezéséhez ugyanazok a számok
  const decorativeTilesX = layoutTilesX;
  const decorativeTilesY = layoutTilesY;

  const displayTeas = isMobile ? pageItems : renderTeas;

  // ⚠️ Mobil slotok: 1/1 és 1/2 (felső és alsó fél)
  const mobileSlots = [
    { col: 1, row: 1 },
    { col: 1, row: 2 },
  ];

  useEffect(() => {
    if (isMobile) {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      setRenderTeas(pageItems);
      setIncomingTeas(null);
      setPhase('idle');
      return;
    }

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
  }, [isMobile, pageItems, renderTeas]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !isMobile) return;
    const visibleCount = displayTeas.filter(Boolean).length;
    console.assert(
      visibleCount <= 2,
      `TeaGrid: mobil nézetben legfeljebb 2 tea jelenhet meg, most ${visibleCount} darab érkezett.`,
    );
    if (incomingTeas) {
      const incomingCount = incomingTeas.filter(Boolean).length;
      console.assert(
        incomingCount <= 2,
        `TeaGrid: mobil animáció közben legfeljebb 2 új tea érkezhet, most ${incomingCount} darab érkezett.`,
      );
    }
  }, [displayTeas, incomingTeas, isMobile]);

  return (
    <div
      className={styles.container}
      style={{
        ['--tiles-x' as any]: decorativeTilesX,
        ['--tiles-y' as any]: decorativeTilesY,
      }}
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
          onEnterFullscreen={onEnterFullscreen}
          isFullscreen={isFullscreen}
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
        />

        <div className={styles.gridContent} aria-hidden={false}>
          {isMobile
            ? displayTeas.map((tea, idx) => {
                if (!tea) return null;
                const slot = mobileSlots[idx];
                if (!slot) return null;
                const key = `tea-${tea.id}`;
                const gridColumn = '1 / -1';            // ⟵ teljes szélesség
                const gridRow = `${slot.row} / ${slot.row + 1}`;
                return (
                  <div
                    key={key}
                    className={styles.cell}
                    style={{ gridColumn, gridRow }}
                    onFocus={() => onTileFocus?.(tea)}
                  >
                    <TeaCard
                      tea={tea}
                      tileX={slot.col - 1}
                      tileY={slot.row - 1}
                      tilesX={layoutTilesX}
                      tilesY={layoutTilesY}
                      onClick={onTeaClick}
                      panel={panel}
                    />
                  </div>
                );
              })
            : cells.map((_, idx) => {
                const tea = displayTeas[idx];
                const key = tea ? `tea-${tea.id}` : `empty-${idx}`;
                if (!tea) return <div key={key} className={styles.cell} />;
                const tileX = layoutTilesX > 0 ? idx % layoutTilesX : 0;
                const tileY = layoutTilesX > 0 ? Math.floor(idx / layoutTilesX) : 0;
                return (
                  <div key={key} className={styles.cell} onFocus={() => onTileFocus?.(tea)}>
                    <TeaCard
                      tea={tea}
                      tileX={tileX}
                      tileY={tileY}
                      tilesX={layoutTilesX}
                      tilesY={layoutTilesY}
                      onClick={onTeaClick}
                      panel={panel}
                    />
                  </div>
                );
              })}
        </div>

        {!isMobile && incomingTeas && (
          <div
            className={[
              styles.gridContent,
              styles.ghost,
              dir === 1 ? styles.slideInRight : styles.slideInLeft,
            ].join(' ')}
            aria-hidden
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
