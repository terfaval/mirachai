import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import HeaderPanel from '@/components/panels/HeaderPanel';
import DescPanel from '@/components/panels/DescPanel';
import MoreInfoPanel from '@/components/panels/MoreInfoPanel';
import TeaDashboard from '@/components/panels/TeaDashboard';
import PrepServePanel from '@/components/panels/PrepServePanel';
import { getCategoryColor, getAlternativeColor } from '../utils/colorMap';
import MandalaBackground from '@/components/panels/MandalaBackground';
import uiTexts from '../data/ui_texts.json';

type CubeFace = 'tea' | 'intro' | 'brew';

const fallbackIntroCopy = {
  h1: [
    'Tea, ami történetet mesél',
    'Mirāchai – a te szertartásod',
    'Fedezd fel a Mirāchai világát',
  ],
  lead: [
    'Lépj be a lassú teafőzés univerzumába – minden csészéhez személyre szabott útmutatóval.',
    'Ismerd meg a Mirāchai teákat, és készítsd el őket pont úgy, ahogy neked jó.',
    'Kapcsolódj a történetekhez és színekhez – mi végigkísérünk az első kortytól az utolsóig.',
  ],
};

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

interface Props {
  tea: Tea;
  onClose: () => void;
}

export default function TeaModal({ tea, onClose }: Props) {
  const colorDark = getCategoryColor(tea.category, 'dark') ?? '#2D1E3E';
  const colorLight = getCategoryColor(tea.category, 'light') ?? 'rgba(0,0,0,0.05)';
  const colorMain = getCategoryColor(tea.category, 'main') ?? '#CCCCCC';
  const colorAlternative = getAlternativeColor(tea.category);

  const [activeFace, setActiveFace] = useState<CubeFace>('tea');
  const [isRotating, setIsRotating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cubeSceneRef = useRef<HTMLDivElement | null>(null);
  const introTitleRef = useRef<HTMLHeadingElement | null>(null);
  const brewTitleRef = useRef<HTMLHeadingElement | null>(null);

  const introCopy = useMemo(() => {
    const introTexts = uiTexts?.brewJourney?.intro;
    const headlineSource = Array.isArray(introTexts?.h1) && introTexts.h1.length
      ? introTexts.h1
      : fallbackIntroCopy.h1;
    const leadSource = Array.isArray(introTexts?.lead) && introTexts.lead.length
      ? introTexts.lead
      : fallbackIntroCopy.lead;

    const seed = Number.isFinite(tea.id) ? tea.id : 0;
    const rng = mulberry32(seed);
    const pick = (list: string[]) => {
      if (!list.length) {
        return '';
      }
      const index = Math.floor(rng() * list.length);
      return list[index] ?? list[0]!;
    };

    const title = pick(headlineSource) || fallbackIntroCopy.h1[0]!;
    const lead = pick(leadSource) || fallbackIntroCopy.lead[0]!;

    return { title, lead };
  }, [tea.id]);

  useEffect(() => {
    setActiveFace('tea');
    setIsRotating(false);
  }, [tea]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(query.matches);
    updatePreference();
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!prefersReducedMotion || !isRotating) return;
    const timeout = window.setTimeout(() => setIsRotating(false), 400);
    return () => window.clearTimeout(timeout);
  }, [prefersReducedMotion, isRotating]);

  useEffect(() => {
    if (isRotating) {
      return;
    }

    if (activeFace === 'intro') {
      introTitleRef.current?.focus();
    } else if (activeFace === 'brew') {
      brewTitleRef.current?.focus();
    }
  }, [activeFace, isRotating]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const sceneEl = cubeSceneRef.current;
    if (!sceneEl) {
      return;
    }

    const faceSelector = `.${styles.cubeFace}[data-active="true"] .${styles.content}`;
    const getActiveContent = () =>
      sceneEl.querySelector<HTMLElement>(faceSelector) ?? null;

    const eventTargetsContent = (event: Event, contentEl: HTMLElement) => {
      const path = 'composedPath' in event ? event.composedPath() : undefined;
      if (Array.isArray(path) && path.length > 0) {
        return path.includes(contentEl);
      }
      const targetNode = event.target as Node | null;
      return targetNode ? contentEl.contains(targetNode) : false;
    };

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const normalizeDeltaY = (event: WheelEvent, content: HTMLElement) => {
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
        return event.deltaY * 16;
      }
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        return event.deltaY * content.clientHeight;
      }
      return event.deltaY;
    };

    const handleWheel = (event: WheelEvent) => {
      const contentEl = getActiveContent();
      if (!contentEl) {
        return;
      }

      if (!eventTargetsContent(event, contentEl)) {
        return;
      }

      const maxScroll = contentEl.scrollHeight - contentEl.clientHeight;
      if (maxScroll <= 0) {
        return;
      }

      const deltaY = normalizeDeltaY(event, contentEl);
      if (deltaY === 0) {
        return;
      }

      const nextScroll = clamp(
        contentEl.scrollTop + deltaY,
        0,
        maxScroll,
      );

      if (nextScroll !== contentEl.scrollTop) {
        event.preventDefault();
        contentEl.scrollTop = nextScroll;
      }
    };

    let touchStartY: number | null = null;
    let touchContent: HTMLElement | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      const contentEl = getActiveContent();
      if (!contentEl) {
        touchStartY = null;
        touchContent = null;
        return;
      }

      if (!eventTargetsContent(event, contentEl)) {
        touchStartY = null;
        touchContent = null;
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        touchStartY = null;
        touchContent = null;
        return;
      }

      touchStartY = touch.clientY;
      touchContent = contentEl;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchContent || touchStartY === null) {
        return;
      }

      const maxScroll = touchContent.scrollHeight - touchContent.clientHeight;
      if (maxScroll <= 0) {
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      const deltaY = touchStartY - touch.clientY;
      if (deltaY === 0) {
        return;
      }

      event.preventDefault();
      const nextScroll = clamp(
        touchContent.scrollTop + deltaY,
        0,
        maxScroll,
      );
      touchContent.scrollTop = nextScroll;
      touchStartY = touch.clientY;
    };

    const resetTouch = () => {
      touchStartY = null;
      touchContent = null;
    };

    sceneEl.addEventListener('wheel', handleWheel, { passive: false });
    sceneEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    sceneEl.addEventListener('touchmove', handleTouchMove, { passive: false });
    sceneEl.addEventListener('touchend', resetTouch);
    sceneEl.addEventListener('touchcancel', resetTouch);

    return () => {
      sceneEl.removeEventListener('wheel', handleWheel);
      sceneEl.removeEventListener('touchstart', handleTouchStart);
      sceneEl.removeEventListener('touchmove', handleTouchMove);
      sceneEl.removeEventListener('touchend', resetTouch);
      sceneEl.removeEventListener('touchcancel', resetTouch);
    };
  }, [activeFace]);
  
  const handleFaceChange = (face: CubeFace) => {
    if (face === activeFace) return;
    setIsRotating(true);
    setActiveFace(face);
  };

  const rotation = activeFace === 'tea' ? 0 : activeFace === 'intro' ? -90 : -180;

  // ---- FIX: bővített típus a custom CSS változókhoz
  type CubeSceneStyle = CSSProperties & {
    ['--card-w']?: string;
    ['--card-h']?: string;
  };

  const cubeSceneStyle: CubeSceneStyle = {
    perspective: '1200px',
    '--card-w': '60vw',
    '--card-h': '90vh',
  };
  // ----

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.cubeScene}
        style={cubeSceneStyle}
        onClick={(event) => event.stopPropagation()}
        ref={cubeSceneRef}
        >
        <div
          className={styles.cubeShell}
          data-rotating={isRotating ? 'true' : 'false'}
          data-reduced={prefersReducedMotion ? 'true' : 'false'}
          style={{
            transform: prefersReducedMotion
              ? undefined
              : `translateZ(calc(var(--card-w) / -2)) rotateY(${rotation}deg)`,
            pointerEvents: isRotating ? 'none' : undefined,
          }}
          onTransitionEnd={(event) => {
            if (prefersReducedMotion) {
              if (event.propertyName === 'opacity') {
                setIsRotating(false);
              }
              return;
            }
            if (event.propertyName === 'transform') {
              setIsRotating(false);
            }
          }}
        >
          <div
            className={`${styles.cubeFace} ${styles.faceFront}`}
            data-active={activeFace === 'tea' ? 'true' : 'false'}
          >
            <div
              className={styles.panel}
              style={{
                backgroundColor: colorMain,
              }}
            >
              <div className={styles.backLayer} style={{ background: colorMain }}>
                <MandalaBackground color={colorDark} category={tea.category} />
              </div>
              <button className={styles.close} onClick={onClose} aria-label="Bezárás">
                ×
              </button>

              <div
                className={styles.content}
                style={{
                  background: `linear-gradient(180deg, ${colorLight} 0%, #FFFFFF 65%)`,
                }}
              >
                <HeaderPanel tea={tea} colorDark={colorDark} />
                <div className={styles.spacer} />
                <DescPanel
                  description={tea.description ?? ''}
                  colorDark={colorDark}
                  categoryColor={colorMain}
                  imageSrc="/tea-sample-1.png"
                  origin={tea.origin ?? ''}
                />
                <div className={styles.spacer} />
                <MoreInfoPanel text={tea.fullDescription ?? ''} colorDark={colorDark} />
                <div className={styles.spacer} />
                <TeaDashboard tea={tea} colorDark={colorDark} />
                <div className={styles.spacer} />
                <PrepServePanel tea={tea} infoText={tea.when ?? ''} />
                <div className={styles.spacer} />

                <button
                  type="button"
                  className={styles.helpButton}
                  style={{ backgroundColor: colorAlternative }}
                  onClick={() => handleFaceChange('intro')}
                  aria-label="Segítünk elkészíteni"
                >
                  Főzzük meg!
                </button>
              </div>
            </div>
          </div>

          <div
            className={`${styles.cubeFace} ${styles.faceRight}`}
            data-active={activeFace === 'intro' ? 'true' : 'false'}
          >
            <div className={styles.introFace} style={{ backgroundColor: colorMain }}>
              <div className={`${styles.backLayer} ${styles.introBackdrop}`}>
                <MandalaBackground color={colorDark} category={tea.category} />
              </div>
              <div className={styles.introContent}>
                <div className={styles.brandBadge}>
                  <img
                    src="/mirachai_logo.svg"
                    alt="Mirachai"
                    style={{
                      width: 'clamp(72px, 10vw, 120px)',
                      height: 'auto',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
                      fill: 'white',
                    }}
                  />
                </div>
                <h1
                  className={styles.introTitle}
                  tabIndex={-1}
                  ref={introTitleRef}
                >
                  {introCopy.title}
                </h1>
                <p className={styles.introLead}>{introCopy.lead}</p>
                <div className={styles.introActions}>
                  <button
                    type="button"
                    className={styles.introPrimary}
                    onClick={() => handleFaceChange('brew')}
                  >
                    Kezdjük a főzést
                  </button>
                  <button
                    type="button"
                    className={styles.introGhost}
                    onClick={() => handleFaceChange('tea')}
                  >
                    Vissza a teához
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${styles.cubeFace} ${styles.faceBack}`}
            data-active={activeFace === 'brew' ? 'true' : 'false'}
          >
            <div className={styles.brewFace}>
              <header className={styles.brewHeader}>
                <span className={styles.brewBadge}>Brew guide</span>
                <h2
                  className={styles.brewTitle}
                  tabIndex={-1}
                  ref={brewTitleRef}
                >
                  Mirachai tea útmutató
                </h2>
                <p className={styles.brewLead}>
                  Kövesd végig a folyamatot lépésről lépésre – hamarosan részletes időzítővel és recepttel.
                </p>
              </header>
              <div className={styles.brewBody}>
                <div className={styles.brewCard}>
                  <h3 className={styles.brewCardTitle}>1. Előkészítés</h3>
                  <p className={styles.brewCardText}>
                    Válaszd ki a főzési módot és az adagot. Hamarosan automatikus ajánlásokat kapsz.
                  </p>
                </div>
                <div className={styles.brewCard}>
                  <h3 className={styles.brewCardTitle}>2. Recept &amp; időzítés</h3>
                  <p className={styles.brewCardText}>
                    A Mirāchai lépései végig vezetnek a hőmérséklettől az áztatási időkig.
                  </p>
                </div>
                <div className={styles.brewCard}>
                  <h3 className={styles.brewCardTitle}>3. Élvezd</h3>
                  <p className={styles.brewCardText}>
                    Visszajelzéseddel még pontosabbá tesszük a következő csészét.
                  </p>
                </div>
              </div>
              <div className={styles.brewFooter}>
                <button
                  type="button"
                  className={styles.brewBackButton}
                  onClick={() => handleFaceChange('intro')}
                >
                  Vissza a márka oldalra
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}