import React, {
  MutableRefObject,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Intro from './Intro';
import Setup from './Setup';
import RecipeCard from './RecipeCard';
import Timer from './Timer';
import Finish from './Finish';
import styles from '../../styles/TeaModal.module.css';
import { buildPlanFor, type BrewMethodPlan } from '../../lib/brew.integration';
import { slugify } from '@/lib/normalize';

type Phase = 'intro' | 'setup' | 'recipe' | 'timer' | 'finish';

type BrewJourneyProps = {
  layoutId?: string; // reserved for future motion layout sync
  tea: {
    slug?: string;
    id?: string;
    name: string;
    category?: string;
    colorMain?: string;
    colorDark?: string;
  };
  methodId: string;
  onExit: () => void;
  embedded?: boolean;
  titleRef?: Ref<HTMLHeadingElement>;
  containerRef?: Ref<HTMLDivElement>;
};

type BrewPlanState = {
  plan: BrewMethodPlan | null;
  loading: boolean;
  error: string | null;
};

const previousPhase: Record<Phase, Phase | null> = {
  intro: null,
  setup: 'intro',
  recipe: 'setup',
  timer: 'recipe',
  finish: 'timer',
};

const isPhase = (value: string | null): value is Phase =>
  value === 'intro' ||
  value === 'setup' ||
  value === 'recipe' ||
  value === 'timer' ||
  value === 'finish';

export default function BrewJourney({
  layoutId,
  tea,
  methodId,
  onExit,
  embedded = false,
  titleRef,
  containerRef,
}: BrewJourneyProps) {
  void layoutId; // reserved for future layout animations

  const normalizedTea = useMemo(
    () => ({
      ...tea,
      slug: tea.slug ?? (tea.id ? String(tea.id) : slugify(tea.name ?? 'tea')),
    }),
    [tea],
  );

  const teaSlug = useMemo(() => {
    if (normalizedTea.slug && normalizedTea.slug.trim().length > 0) {
      return normalizedTea.slug;
    }
    if (normalizedTea.name) {
      return slugify(normalizedTea.name);
    }
    if (normalizedTea.id) {
      return slugify(String(normalizedTea.id));
    }
    return '';
  }, [normalizedTea.id, normalizedTea.name, normalizedTea.slug]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [volumeMl, setVolumeMl] = useState<number>(250);
  const [planState, setPlanState] = useState<BrewPlanState>({ plan: null, loading: false, error: null });
  const [refreshToken, setRefreshToken] = useState(0);

  const hydratedFromQueryRef = useRef(false);

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

  const mergedContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!containerRef) {
        return;
      }
      if (typeof containerRef === 'function') {
        containerRef(node);
        return;
      }
      (containerRef as MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [containerRef],
  );

  useEffect(() => {
    if (typeof window === 'undefined' || hydratedFromQueryRef.current) {
      return;
    }
    hydratedFromQueryRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const volumeParam = params.get('volume');
    if (volumeParam) {
      const parsed = Number.parseInt(volumeParam, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        setVolumeMl(parsed);
      }
    }
    const phaseParam = params.get('phase');
    if (isPhase(phaseParam)) {
      setPhase(phaseParam);
    }
  }, []);

  useEffect(() => {
    setPhase('intro');
    setPlanState({ plan: null, loading: false, error: null });
    setRefreshToken(0);
  }, [methodId, teaSlug]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = new URL(window.location.href);
    if (methodId) {
      url.searchParams.set('method', methodId);
    }
    url.searchParams.set('phase', phase);
    url.searchParams.set('volume', String(volumeMl));
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [methodId, phase, volumeMl]);

  useEffect(() => {
    if (!methodId || !teaSlug) {
      setPlanState({ plan: null, loading: false, error: 'Ehhez a módszerhez nem találtunk receptet.' });
      return;
    }

    let active = true;
    setPlanState((prev) => ({ ...prev, loading: true, error: null }));

    (async () => {
      try {
        const plan = await buildPlanFor(teaSlug, methodId, volumeMl);
        if (!active) {
          return;
        }
        if (!plan) {
          setPlanState({ plan: null, loading: false, error: 'Ez a főzési módszer nem érhető el ehhez a teához.' });
          return;
        }
        setPlanState({ plan, loading: false, error: null });
      } catch (error) {
        if (!active) {
          return;
        }
        console.error('Failed to build brew plan', error);
        setPlanState({
          plan: null,
          loading: false,
          error: 'Nem sikerült betölteni a főzési tervet. Próbáld újra később.',
        });
      }
    })();

    return () => {
      active = false;
    };
  }, [methodId, teaSlug, volumeMl, refreshToken]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      if (phase === 'intro') {
        event.preventDefault();
        onExit();
        return;
      }
      const previous = previousPhase[phase];
      if (previous) {
        event.preventDefault();
        setPhase(previous);
      } else {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, onExit]);

  const brewTitle = normalizedTea?.name
    ? `Mirāchai ${normalizedTea.name} – Brew Journey`
    : 'Mirāchai Brew Journey';

  const handleIntroComplete = useCallback(() => {
    setPhase('setup');
  }, []);

  const handleRestart = useCallback(() => {
    setPhase('setup');
    setPlanState((prev) => ({ ...prev, plan: null }));
  }, []);

  const handlePlanRetry = useCallback(() => {
    setPlanState((prev) => ({ ...prev, error: null }));
    setRefreshToken((token) => token + 1);
  }, []);

  const renderPhase = () => {
    if (phase === 'intro') {
      return (
        <div className={styles.brewIntroWrapper}>
          <Intro tea={normalizedTea} onSetupEnter={handleIntroComplete} />
        </div>
      );
    }

    if (phase === 'setup') {
      return (
        <Setup
          tea={normalizedTea}
          value={{ methodId, volumeMl }}
          onChange={() => undefined}
          onNext={() => setPhase('recipe')}
          onBack={() => setPhase('intro')}
        />
      );
    }

    if (phase === 'recipe') {
      return (
        <RecipeCard
          plan={planState.plan}
          isLoading={planState.loading}
          error={planState.error}
          onBack={() => setPhase('setup')}
          onStart={(plan) => {
            setPlanState((prev) => ({ ...prev, plan }));
            setPhase('timer');
          }}
          onRetry={handlePlanRetry}
        />
      );
    }

    if (phase === 'timer' && planState.plan) {
      return (
        <Timer
          plan={planState.plan}
          onBack={() => setPhase('recipe')}
          onDone={() => setPhase('finish')}
        />
      );
    }

    return (
      <Finish
        tea={normalizedTea}
        message={planState.plan?.finish_message ?? null}
        onRestart={handleRestart}
        onClose={onExit}
      />
    );
  };

  const content = renderPhase();
  const bodyClassName = phase === 'intro' || phase === 'setup' ? styles.brewBodySingle : styles.brewBody;

  if (!embedded) {
    return (
      <div
        role="dialog"
        aria-modal
        data-allow-interaction="true"
        className="fixed inset-0 z-50 grid place-items-center bg-black/40"
      >
        <div className={styles.brewStandalone}>
          <div className={styles.brewFace}>
            <header className={styles.brewHeader}>
              <span className={styles.brewBadge}>Brew guide</span>
              <h2 className={styles.brewTitle}>{brewTitle}</h2>
              <p className={styles.brewLead}>
                Kövesd végig a Mirāchai lépéseit – az intro után jön az előkészítés, majd a részletes recept és az időzítő.
              </p>
            </header>
            <div className={bodyClassName}>{content}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.brewFace} ref={mergedContainerRef}>
      {phase !== 'intro' ? (
        <header className={styles.brewHeader}>
          <span className={styles.brewBadge}>Brew guide</span>
          <h2 className={styles.brewTitle} tabIndex={-1} ref={mergedTitleRef}>
            {brewTitle}
          </h2>
          <p className={styles.brewLead}>
            Lépésről lépésre vezetünk végig a főzésen – vissza is léphetsz bármikor, az Esc billentyűvel pedig gyorsan
            ugorhatsz az előző szakaszra.
          </p>
        </header>
      ) : null}
      <div className={bodyClassName}>{content}</div>
    </div>
  );
}