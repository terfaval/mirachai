import { CSSProperties, useEffect, useState } from 'react';
import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import HeaderPanel from '@/components/panels/HeaderPanel';
import DescPanel from '@/components/panels/DescPanel';
import MoreInfoPanel from '@/components/panels/MoreInfoPanel';
import TeaDashboard from '@/components/panels/TeaDashboard';
import PrepServePanel from '@/components/panels/PrepServePanel';
import { getCategoryColor, getAlternativeColor } from '../utils/colorMap';
import MandalaBackground from '@/components/panels/MandalaBackground';

type CubeFace = 'tea' | 'intro' | 'brew';

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
                <div className={styles.brandBadge}>mirāchai</div>
                <h1 className={styles.introTitle}>Tea, ami történetet mesél</h1>
                <p className={styles.introLead}>
                  Fedezd fel a mirāchai világát – a lassú teafőzés örömét, személyre szabva neked.
                </p>
                <div className={styles.introActions}>
                  <button
                    type="button"
                    className={styles.introPrimary}
                    onClick={() => handleFaceChange('brew')}
                  >
                    Lássuk a főzést
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
                <h2 className={styles.brewTitle}>Mirāchai főzési keret</h2>
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