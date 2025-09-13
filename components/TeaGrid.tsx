import { useEffect, useMemo, useRef, useState } from 'react';
import TeaCard, { PanelKey } from './TeaCard';
import styles from '../styles/TeaGrid.module.css';
import { Tea } from '../utils/filter';
import InfoPanelSidebar from './InfoPanelSidebar';

interface Props {
  teas: Tea[] | Record<string, Tea>;      // ← engedjük az objektumot is
  onTeaClick?: (tea: Tea) => void;
}

const TILES_X = 3;
const TILES_Y = 3;
const TILE_COUNT = TILES_X * TILES_Y;

function compareIdAsc(a: any, b: any) {
  const na = Number(a);
  const nb = Number(b);
  const aNum = Number.isFinite(na) ? na : null;
  const bNum = Number.isFinite(nb) ? nb : null;
  if (aNum !== null && bNum !== null) return aNum - bNum;
  return String(a).localeCompare(String(b), 'hu', { numeric: true });
}

export default function TeaGrid({ teas, onTeaClick }: Props) {
  const [panel, setPanel] = useState<PanelKey>('consumption');

  // 0) bemenet normalizálása TÖMBBÉ
  const teasArray: Tea[] = useMemo(() => {
    if (Array.isArray(teas)) return teas;
    if (teas && typeof teas === 'object') return Object.values(teas);
    return [];
  }, [teas]);

  // 1) stabil sorrend
  const orderedTeas = useMemo(() => {
    return [...teasArray].sort((a, b) => compareIdAsc(a?.id, b?.id));
  }, [teasArray]);

  // 2) paginációs állapot
  const totalPages = Math.max(1, Math.ceil(orderedTeas.length / TILE_COUNT));
  const [page, setPage] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [dir, setDir] = useState<1 | -1>(1);
  const timerRef = useRef<number | null>(null);

  const pageSlice = (p: number) => {
    const start = p * TILE_COUNT;
    return orderedTeas.slice(start, start + TILE_COUNT);
  };

  const [renderTeas, setRenderTeas] = useState<Tea[]>(pageSlice(0));
  const [incomingTeas, setIncomingTeas] = useState<Tea[] | null>(null);

  // 🔧 FONTOS: ha változik a lista hossza (pl. beérkeznek a többiek),
  // reseteljük az oldalt és újravesszük a szeletet → pontok száma is frissül.
  useEffect(() => {
    setPage(0);
    setRenderTeas(pageSlice(0));
    setIncomingTeas(null);
    setPhase('idle');
  }, [orderedTeas.length]); // csak a hosszra figyelünk (teljes újrarendezésnél is jó)

  const clearTimers = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const goTo = (nextPage: number, direction: 1 | -1) => {
    if (phase !== 'idle') return;
    if (nextPage === page) return;
    setDir(direction);
    setIncomingTeas(pageSlice(nextPage));
    setPhase('exit');

    clearTimers();
    timerRef.current = window.setTimeout(() => {
      setRenderTeas(pageSlice(nextPage));
      setIncomingTeas(null);
      setPage(nextPage);
      setPhase('enter');

      timerRef.current = window.setTimeout(() => {
        setPhase('idle');
        timerRef.current = null;
      }, 320);
    }, 320);
  };

  const next = () => goTo((page + 1) % totalPages, 1);
  const prev = () => goTo((page - 1 + totalPages) % totalPages, -1);

  const cells = Array.from({ length: TILE_COUNT });

  return (
    <div className={styles.container}>
      <div className={styles.gridWrap}>
        <InfoPanelSidebar panel={panel} onChange={setPanel} />

        <div
          className={[
            styles.grid,
            phase === 'exit' && (dir === 1 ? styles.slideOutLeft : styles.slideOutRight),
            phase === 'enter' && (dir === 1 ? styles.slideInRight : styles.slideInLeft),
          ].filter(Boolean).join(' ')}
          aria-live="polite"
        >
          {cells.map((_, idx) => {
            const tea = renderTeas[idx];
            const key = tea ? `tea-${tea.id}` : `empty-${idx}`;
            if (!tea) return <div key={key} className={styles.cell} />;
            const tileX = idx % TILES_X;
            const tileY = Math.floor(idx / TILES_X);
            return (
              <div key={key} className={styles.cell}>
                <TeaCard
                  tea={tea}
                  tileX={tileX}
                  tileY={tileY}
                  tilesX={TILES_X}
                  tilesY={TILES_Y}
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
              const tileX = idx % TILES_X;
              const tileY = Math.floor(idx / TILES_X);
              return (
                <div key={key} className={styles.cell}>
                  <TeaCard
                    tea={tea}
                    tileX={tileX}
                    tileY={tileY}
                    tilesX={TILES_X}
                    tilesY={TILES_Y}
                    onClick={onTeaClick}
                    panel={panel}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.pagerBar}>
        <button type="button" className={styles.navBtn} onClick={prev} aria-label="Előző oldal">‹</button>
        <div className={styles.dots} role="tablist" aria-label="Oldalak">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={`dot-${i}`}
              type="button"
              className={[styles.dot, i === page ? styles.dotActive : ''].join(' ')}
              onClick={() => goTo(i, i > page ? 1 : -1)}
              aria-label={`${i + 1}. oldal`}
              aria-current={i === page ? 'page' : undefined}
            />
          ))}
        </div>
        <button type="button" className={styles.navBtn} onClick={next} aria-label="Következő oldal">›</button>
      </div>
    </div>
  );
}
