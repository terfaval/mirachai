import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import HeaderPanel from '@/components/panels/HeaderPanel';
import DescPanel from '@/components/panels/DescPanel';
import MoreInfoPanel from '@/components/panels/MoreInfoPanel';
import TeaDashboard from '@/components/panels/TeaDashboard';
import PrepServePanel from '@/components/panels/PrepServePanel';
import TasteFocusPanel from '@/components/panels/TasteFocusPanel';
import BrewMethodsPanel from '@/components/panels/BrewMethodsPanel';
import { getCategoryColor, getAlternativeColor } from '../utils/colorMap';
import MandalaBackground from '@/components/panels/MandalaBackground';
import uiTexts from '../data/ui_texts.json';
import { pickIntroCopy, type IntroCopy } from '../utils/introCopy';
import BrewJourney from './brew/BrewJourney';
import { getBrewMethodsForTea } from '@/utils/brewMethods';
import { slugify } from '@/lib/normalize';

type CubeFace = 'tea' | 'intro' | 'brew';

type IntroTextSource = {
  h1?: unknown;
  lead?: unknown;
};

const createIntroCopyOptions = (source?: IntroTextSource | null): IntroCopy[] | undefined => {
  if (!source) {
    return undefined;
  }

  const headlines = Array.isArray(source.h1)
    ? source.h1.filter((text): text is string => typeof text === 'string' && text.trim().length > 0)
    : [];
  const leads = Array.isArray(source.lead)
    ? source.lead.filter((text): text is string => typeof text === 'string' && text.trim().length > 0)
    : [];

  if (!headlines.length || !leads.length) {
    return undefined;
  }

  const copies: IntroCopy[] = [];
  for (const h1 of headlines) {
    for (const lead of leads) {
      copies.push({ h1, lead });
    }
  }

  return copies.length ? copies : undefined;
};

const introCopyOptions = createIntroCopyOptions(uiTexts?.brewJourney?.intro);

interface Props {
  tea: Tea;
  onClose: () => void;
}

export default function TeaModal({ tea, onClose }: Props) {
  const colorDark = getCategoryColor(tea.category, 'dark') ?? '#2D1E3E';
  const colorLight = getCategoryColor(tea.category, 'light') ?? 'rgba(0,0,0,0.05)';
  const colorMain = getCategoryColor(tea.category, 'main') ?? '#CCCCCC';
  const colorAlternative = getAlternativeColor(tea.category);

  // ⟵ MOBIL LOGIKA a modal méretezéshez
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
  
  const [activeFace, setActiveFace] = useState<CubeFace>('tea');
  const [isRotating, setIsRotating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [brew, setBrew] = useState<{ methodId: string | null } | null>(null);
  const cubeSceneRef = useRef<HTMLDivElement | null>(null);
  const cubeShellRef = useRef<HTMLDivElement | null>(null);
  const teaContentRef = useRef<HTMLDivElement | null>(null);
  const brewContentRef = useRef<HTMLDivElement | null>(null);
  const [brewHudPortalNode, setBrewHudPortalNode] = useState<HTMLDivElement | null>(null);
  const assignBrewHudPortal = useCallback((node: HTMLDivElement | null) => {
    setBrewHudPortalNode(node);
  }, []);
  const introTitleRef = useRef<HTMLHeadingElement | null>(null);
  const brewTitleRef = useRef<HTMLHeadingElement | null>(null);
  const rotationTimeoutRef = useRef<number | null>(null);
  const rotationFailsafeTimeoutRef = useRef<number | null>(null);

  const clearRotationTimeout = useCallback(() => {
    if (rotationTimeoutRef.current !== null) {
      window.clearTimeout(rotationTimeoutRef.current);
      rotationTimeoutRef.current = null;
    }
  }, []);

  const clearRotationFailsafeTimeout = useCallback(() => {
    if (rotationFailsafeTimeoutRef.current !== null) {
      window.clearTimeout(rotationFailsafeTimeoutRef.current);
      rotationFailsafeTimeoutRef.current = null;
    }
  }, []);

  const finishRotation = useCallback(() => {
    clearRotationTimeout();
    clearRotationFailsafeTimeout();
    if (cubeShellRef.current) {
      cubeShellRef.current.setAttribute('data-rotating', 'false');
    }
    setIsRotating(false);
  }, [clearRotationTimeout, clearRotationFailsafeTimeout]);

  const scheduleRotationFallback = useCallback(
    (duration: number) => {
      clearRotationTimeout();
      rotationTimeoutRef.current = window.setTimeout(() => {
        rotationTimeoutRef.current = null;
        finishRotation();
      }, duration);
    },
    [clearRotationTimeout, finishRotation],
  );

  const introCopy = useMemo(() => pickIntroCopy(tea.id, introCopyOptions), [tea.id]);
  const brewMethods = useMemo(() => getBrewMethodsForTea(tea), [tea]);
  const brewTea = useMemo(
    () => ({
      ...tea,
      colorMain,
      colorDark,
    }),
    [tea, colorMain, colorDark],
  );

  const brewLayoutId = useMemo(() => {
    const base = (tea as any).slug ?? tea.id ?? tea.name ?? 'tea';
    return `brew-${String(base)}`;
  }, [tea]);

  const categoryStillLifeImage = useMemo(() => {
    if (!tea?.category) {
      return undefined;
    }

    const slug = slugify(String(tea.category));
    if (!slug) {
      return undefined;
    }

    const underscored = slug.replace(/-/g, '_');
    return `/still_life/stilllife_${underscored}.png`;
  }, [tea?.category]);
  
  useEffect(() => {
    setActiveFace('tea');
    setSelectedMethodId(null);
    setBrew(null);
    finishRotation();
  }, [tea, finishRotation]);

  useEffect(() => {
    if (selectedMethodId || !brewMethods.length) {
      return;
    }
    setSelectedMethodId(brewMethods[0]?.id ?? null);
  }, [brewMethods, selectedMethodId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(query.matches);
    updatePreference();
    query.addEventListener('change', updatePreference);
    return () => query.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!isRotating) {
      clearRotationTimeout();
      return;
    }

    const fallbackDuration = prefersReducedMotion ? 350 : 1100;
    scheduleRotationFallback(fallbackDuration);

    return clearRotationTimeout;
  }, [
    isRotating,
    prefersReducedMotion,
    clearRotationTimeout,
    scheduleRotationFallback,
  ]);

  useEffect(
    () => () => {
      clearRotationTimeout();
      clearRotationFailsafeTimeout();
    },
    [clearRotationTimeout, clearRotationFailsafeTimeout],
  );

  const scrollToTop = useCallback(
    (element: HTMLElement | null) => {
      if (!element) {
        return;
      }

      const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

      try {
        element.scrollTo({ top: 0, behavior });
      } catch {
        element.scrollTop = 0;
      }
    },
    [prefersReducedMotion],
  );

  useEffect(() => {
    if (activeFace === 'tea') {
      scrollToTop(teaContentRef.current);
      return;
    }

    if (activeFace === 'brew') {
      scrollToTop(brewContentRef.current);
    }
  }, [activeFace, scrollToTop]);
  
  useEffect(() => {
    if (isRotating) {
      return;
    }

    if (activeFace === 'intro') {
      introTitleRef.current?.focus();
      return;
    }

    if (activeFace !== 'brew') {
      return;
    }

    if (brewTitleRef.current) {
      brewTitleRef.current.focus();
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const timer = window.setTimeout(() => {
      brewTitleRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeFace, isRotating]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const sceneEl = cubeSceneRef.current;
    if (!sceneEl) {
      return;
    }

    const faceSelector =
      `.${styles.cubeFace}[data-active="true"] .${styles.content}, ` +
      `.${styles.cubeFace}[data-active="true"] .${styles.introContent}`;
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
  
  const handleFaceChange = useCallback(
    (face: CubeFace) => {
      console.log(
        'face change requested:',
        face,
        'activeFace:',
        activeFace,
        'isRotating:',
        isRotating,
      );
      if (isRotating || face === activeFace) {
        console.log('early return');
        return;
      }

      clearRotationTimeout();
      clearRotationFailsafeTimeout();

      if (prefersReducedMotion) {
        setActiveFace(face);
        cubeShellRef.current?.setAttribute('data-rotating', 'false');
        setIsRotating(false);
        return;
      }

      cubeShellRef.current?.setAttribute('data-rotating', 'true');
      setIsRotating(true);
      setActiveFace(face);

      if (typeof window !== 'undefined') {
        // Failsafe: 1,5 másodperc múlva biztosan feloldjuk a forgást
        rotationFailsafeTimeoutRef.current = window.setTimeout(() => {
          rotationFailsafeTimeoutRef.current = null;
          finishRotation();
        }, 1500);
      }
    },
    [
      activeFace,
      isRotating,
      clearRotationFailsafeTimeout,
      clearRotationTimeout,
      prefersReducedMotion,
      finishRotation,
    ],
  );

  const handleMethodSelect = useCallback((methodId: string) => {
    setSelectedMethodId(methodId);
  }, []);

  const handleBrewStart = useCallback(
    (methodId: string | null | undefined) => {
      if (methodId) {
        setSelectedMethodId(methodId);
      }
      setBrew({ methodId: methodId ?? null });
      handleFaceChange('brew');
    },
    [handleFaceChange],
  );

  const handleBrewExit = useCallback(() => {
    setBrew(null);
    handleFaceChange('tea');
  }, [handleFaceChange]);

  const rotation = activeFace === 'tea' ? 0 : activeFace === 'intro' ? -90 : -180;

  const brewActive = brew != null;

  // ---- FIX: bővített típus a custom CSS változókhoz
  type CubeSceneStyle = CSSProperties & {
    ['--card-w']?: string;
    ['--card-h']?: string;
  };

  const cubeSceneStyle: CubeSceneStyle = {
    perspective: '1200px',
    // Desktopon marad “kártya” méret, mobilon full-bleed (safe-area nélkül),
    // a CSS még finomít (padding, radius, stb.)
    '--card-w': isMobile ? '80vw' : '60vw',
    '--card-h': isMobile ? '90dvh' : '90vh',
  };
  // ----

  return (
    <div
      className={`${styles.overlay} ${brewActive ? styles.overlayBrewActive : ''}`}
      onClick={onClose}
      data-allow-interaction="true"
    >
      <div
        className={`${styles.cubeScene} ${brewActive ? styles.brewActive : ''}`}
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
            }}
          onClick={(event) => event.stopPropagation()}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) {
              return;
            }
            if (
              event.propertyName !== 'transform' &&
              event.propertyName !== '-webkit-transform'
            ) {
              return;
            }
            finishRotation();
          }}
          ref={cubeShellRef}
        >
          <div
            className={`${styles.cubeFace} ${styles.faceFront}`}
            data-active={activeFace === 'tea' ? 'true' : undefined}
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
                ref={teaContentRef}
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
                  imageSrc={categoryStillLifeImage}
                  origin={tea.origin ?? ''}
                />
                <div className={styles.spacer} />
                <TeaDashboard tea={tea} colorDark={colorDark} />
                <div className={styles.spacer} />
                <TasteFocusPanel tea={tea} colorDark={colorDark} />
                <div className={styles.spacer} />
                {brewMethods.length > 0 ? (
                  <>
                    <BrewMethodsPanel
                      methods={brewMethods}
                      onSelect={handleMethodSelect}
                      selectedId={selectedMethodId}
                      onStart={handleBrewStart}
                    />
                    <div className={styles.spacer} />
                  </>
                ) : null}
                <div className={styles.spacer} />
                <PrepServePanel tea={tea} infoText={tea.when ?? ''} />
                <div className={styles.spacer} />

              </div>
            </div>
          </div>

          <div
            className={`${styles.cubeFace} ${styles.faceRight}`}
            data-active={activeFace === 'intro' ? 'true' : undefined}
          >
            <div className={styles.introFace} style={{ backgroundColor: colorMain }}>
              <div className={`${styles.backLayer} ${styles.introBackdrop}`}>
                <MandalaBackground color={colorDark} category={tea.category} />
              </div>
              <div
                className={styles.introContent}
                onClick={(event) => event.stopPropagation()}
                >
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
                  {introCopy.h1}
                </h1>
                <p className={styles.introLead}>{introCopy.lead}</p>
                <div
                  className={styles.introActions}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <button
                    type="button"
                    className={styles.introGhost}
                    onClick={() => {
                      handleFaceChange('tea');
                    }}
                  >
                    Vissza a teához
                  </button>
                  <button
                    type="button"
                    className={styles.introPrimary}
                    onClick={() => {
                      handleBrewStart(undefined);
                    }}
                  >
                    Kezdjük a főzést
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`${styles.cubeFace} ${styles.faceBack}`}
            data-active={activeFace === 'brew' ? 'true' : undefined}
          >
            {brew ? (
              <BrewJourney
                layoutId={brewLayoutId}
                tea={brewTea}
                methodId={brew.methodId ?? undefined}
                onExit={handleBrewExit}
                titleRef={brewTitleRef}
                containerRef={brewContentRef}
              />
            ) : (
              <div className={styles.brewFace} ref={brewContentRef}>
                <header className={styles.brewHeader}>
                  <span className={styles.brewBadge}>Brew guide</span>
                  <h2 className={styles.brewTitle} tabIndex={-1} ref={brewTitleRef}>
                    Válassz főzési módot a kezdéshez
                  </h2>
                  <p className={styles.brewLead}>
                    Jelöld ki a kedvenc elkészítési módszert, majd indítsd el a Mirāchai Brew Journey-t a részletes útmutatóhoz.
                  </p>
                </header>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}