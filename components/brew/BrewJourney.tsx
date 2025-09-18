import React, {
  type MutableRefObject,
  type Ref,
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
// @ts-ignore framer-motion types may miss LayoutGroup
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import Intro from './Intro';
import Setup from './Setup';
import RecipeCard from './RecipeCard';
import Timer from './Timer';
import Finish from './Finish';
import type { BrewMethodPlan } from '../../lib/brew.integration';
import { FLIP_DUR, FLIP_EASE, HOLD_MS } from './constants';
import { lockSize } from '@/utils/lockSize';
import styles from '../../styles/TeaModal.module.css';

type BrewJourneyProps = {
  layoutId: string;
  tea: {
    slug?: string;
    id?: string;
    name: string;
    category?: string;
    colorMain?: string;
    colorDark?: string;
  };
  onClose: () => void;
  embedded?: boolean;
  titleRef?: Ref<HTMLHeadingElement>;
  containerRef?: Ref<HTMLDivElement>;
};

export default function BrewJourney({
  layoutId,
  tea,
  onClose,
  embedded = false,
  titleRef,
  containerRef,
}: BrewJourneyProps) {
  const normalizedTea = useMemo(
    () => ({
      ...tea,
      slug: tea.slug ?? String(tea.id ?? tea.name ?? 'tea'),
    }),
    [tea],
  );
  const [stage, setStage] = useState<'bridge' | 'setup' | 'plan' | 'timer' | 'finish'>(
    embedded ? 'setup' : 'bridge',
  );
  const [methodId, setMethodId] = useState<string | null>(null);
  const [volumeMl, setVolumeMl] = useState<number>(250);
  const [plan, setPlan] = useState<BrewMethodPlan | null>(null);
  const [animating, setAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [autoForward, setAutoForward] = useState(!embedded);
  const mergedTitleRef = useCallback(
    (node: HTMLHeadingElement | null) => {
      if (!titleRef) {
        return;
      }
      if (typeof titleRef === 'function') {
        titleRef(node);
        return;
      }
      (titleRef as MutableRefObject<HTMLHeadingElement | null>).current = node;
    },
    [titleRef],
  );

  useEffect(() => {
    if (embedded) {
      return undefined;
    }

    if (stage === 'bridge' && autoForward) {
      const t = setTimeout(() => {
        setStage('setup');
        setAutoForward(false);
      }, FLIP_DUR * 1000 + HOLD_MS);
      return () => clearTimeout(t);
    }

    return undefined;
  }, [stage, autoForward, embedded]);

  if (embedded) {
    const brewTitle = normalizedTea?.name
      ? `Mirachai ${normalizedTea.name} útmutató`
      : 'Mirachai tea útmutató';

    return (
      <div className={styles.brewFace} ref={containerRef}>
        <header className={styles.brewHeader}>
          <span className={styles.brewBadge}>Brew guide</span>
          <h2
            className={styles.brewTitle}
            tabIndex={-1}
            ref={titleRef ? mergedTitleRef : undefined}
          >
            {brewTitle}
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
          <button type="button" className={styles.brewBackButton} onClick={onClose}>
            Vissza a márka oldalra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div style={{ perspective: 1200 }}>
        <LayoutGroup>
          {(stage === 'bridge' || stage === 'setup') && (
            <motion.div
              ref={cardRef}
              layoutId={layoutId}
              data-animating={animating}
              className="relative overflow-hidden rounded-2xl shadow-xl"
              style={{
                width: 'var(--brew-w)',
                height: 'var(--brew-h)',
                backgroundColor: normalizedTea.colorMain,
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              initial={{ rotateY: 180 }}
              animate={{ rotateY: stage === 'bridge' ? 360 : 0 }}
              transition={{ duration: FLIP_DUR, ease: FLIP_EASE }}
              onAnimationStart={() => {
                setAnimating(true);
                lockSize(cardRef.current, true);
              }}
              onAnimationComplete={() => {
                lockSize(cardRef.current, false);
                setAnimating(false);
              }}
            >
              {stage === 'bridge' && <Intro tea={normalizedTea} />}
              {stage === 'setup' && !animating && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full w-full"
                >
                  <Setup
                    tea={normalizedTea}
                    value={{ methodId, volumeMl }}
                    onChange={(v) => {
                      setMethodId(v.methodId);
                      setVolumeMl(v.volumeMl);
                    }}
                    onNext={() => setStage('plan')}
                    onBack={() => setStage('bridge')}
                  />
                </motion.div>
              )}
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {stage === 'plan' && methodId && (
              <RecipeCard
                tea={normalizedTea}
                methodId={methodId}
                volumeMl={volumeMl}
                onBack={() => setStage('setup')}
                onStart={(p) => {
                  setPlan(p);
                  setStage('timer');
                }}
              />
            )}
            {stage === 'timer' && plan && (
              <Timer
                plan={plan}
                onBack={() => setStage('plan')}
                onDone={() => setStage('finish')}
              />
            )}
            {stage === 'finish' && (
              <Finish
                tea={normalizedTea}
                onClose={onClose}
                onRestart={() => {
                  setStage('setup');
                  setPlan(null);
                }}
              />
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  );
}