import { MutableRefObject, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Beaker, Droplet, Filter as FilterIcon } from 'lucide-react';
import MandalaBackground from '@/components/panels/MandalaBackground';
import StepFinish from './setup/StepFinish';
import StepGearFilter, { getFilterState, type FilterState, type GearInfo } from './setup/StepGearFilter';
import StepMethod from './setup/StepMethod';
import StepSteep from './setup/StepSteep';
import StepVolume from './setup/StepVolume';
import StepWaterAndLeaf from './setup/StepWaterAndLeaf';
import brewProfiles from '@/data/brew_profiles.json';
import styles from '@/styles/BrewJourney.module.css';
import { slugify } from '@/lib/normalize';
import type { Tea } from '@/utils/filter';
import { getBrewMethodsForTea, type BrewMethodSummary } from '@/utils/brewMethods';

type StepKey = 'method' | 'volume' | 'gear' | 'water' | 'steep' | 'finish';

const STEP_ORDER: StepKey[] = ['method', 'volume', 'gear', 'water', 'steep', 'finish'];
const DEFAULT_VOLUME = 250;

type BrewJourneyProps = {
  layoutId?: string;
  tea: Tea & { colorMain?: string; colorDark?: string };
  methodId?: string | null;
  onExit: () => void;
  titleRef?: Ref<HTMLHeadingElement>;
  containerRef?: Ref<HTMLDivElement>;
};

type TeaProfileDocument = (typeof brewProfiles)[number];
type BrewMethodProfile = TeaProfileDocument['methods'] extends Array<infer M>
  ? M extends Record<string, any>
    ? M
    : never
  : never;

type InitialParams = {
  method: string | null;
  volume: number | null;
  phase: 'setup' | 'steep' | 'finish' | null;
};

function isMutableRef<T>(ref: Ref<T> | undefined | null): ref is MutableRefObject<T> {
  return Boolean(ref && typeof ref === 'object' && 'current' in ref);
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>) {
  return (node: T) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (isMutableRef(ref)) {
        (ref as MutableRefObject<T>).current = node;
      }
    }
  };
}

function clampVolume(value: number | null | undefined): number {
  if (value == null || Number.isNaN(value)) {
    return DEFAULT_VOLUME;
  }
  return Math.min(2000, Math.max(30, value));
}

function readInitialParams(): InitialParams {
  if (typeof window === 'undefined') {
    return { method: null, volume: null, phase: null };
  }
  const params = new URLSearchParams(window.location.search);
  const method = params.get('method');
  const volumeRaw = params.get('ml');
  const phaseRaw = params.get('phase');
  const parsedVolume = volumeRaw != null ? Number.parseInt(volumeRaw, 10) : Number.NaN;
  const phase: InitialParams['phase'] =
    phaseRaw === 'setup' || phaseRaw === 'steep' || phaseRaw === 'finish' ? (phaseRaw as InitialParams['phase']) : null;

  return {
    method: method ?? null,
    volume: Number.isFinite(parsedVolume) ? parsedVolume : null,
    phase,
  };
}

function resolveInitialStep(phase: InitialParams['phase'], hasMethod: boolean): StepKey {
  if (phase === 'steep') {
    return hasMethod ? 'steep' : 'method';
  }
  if (phase === 'finish') {
    return hasMethod ? 'finish' : 'method';
  }
  return hasMethod ? 'volume' : 'method';
}

function findTeaProfile(tea: Tea): TeaProfileDocument | undefined {
  const candidates = [
    (tea as any)?.slug,
    tea.name,
    (tea as any)?.name,
    (tea as any)?.id,
    tea.id != null ? String(tea.id) : undefined,
  ]
    .map((value) => (value == null ? '' : slugify(String(value))))
    .filter((value) => value.length > 0);

  for (const candidate of candidates) {
    const profile = (brewProfiles as TeaProfileDocument[]).find((item) => {
      const profileSlug = slugify((item as any)?.slug ?? item.name ?? item.id ?? '');
      return profileSlug === candidate;
    });
    if (profile) {
      return profile;
    }
  }

  return undefined;
}

function findMethod(profile: TeaProfileDocument | undefined, methodId: string | null | undefined): BrewMethodProfile | null {
  if (!profile || !methodId) {
    return null;
  }
  return (
    (profile.methods as BrewMethodProfile[] | undefined)?.find((method) => String((method as any)?.method_id) === methodId) ??
    null
  );
}

function normalizeArray(value: unknown): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry : entry != null ? String(entry) : null))
      .filter((entry): entry is string => !!entry && entry.trim().length > 0);
  }
  if (typeof value === 'string') {
    return value.trim().length > 0 ? [value] : [];
  }
  return [];
}

function computePhase(step: StepKey): 'setup' | 'steep' | 'finish' {
  if (step === 'steep') {
    return 'steep';
  }
  if (step === 'finish') {
    return 'finish';
  }
  return 'setup';
}

export default function BrewJourney({ layoutId, tea, methodId: initialMethodId, onExit, titleRef, containerRef }: BrewJourneyProps) {
  void layoutId;
  const initialParams = useMemo(() => readInitialParams(), []);
  const initialMethodFromUrl = initialParams.method;
  const resolvedInitialMethod = initialMethodFromUrl ?? (initialMethodId ?? null);

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(() => resolvedInitialMethod);
  const [volumeMl, setVolumeMl] = useState<number>(() => clampVolume(initialParams.volume ?? DEFAULT_VOLUME));
  const [currentStep, setCurrentStep] = useState<StepKey>(() =>
    resolveInitialStep(initialParams.phase, resolvedInitialMethod != null),
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const profile = useMemo(() => findTeaProfile(tea), [tea]);
  const methodSummaries = useMemo<BrewMethodSummary[]>(() => getBrewMethodsForTea(tea), [tea]);
  const methodProfile = useMemo(() => findMethod(profile, selectedMethodId), [profile, selectedMethodId]);

  const mergedContainerRef = useMemo(() => mergeRefs<HTMLDivElement>(containerRef), [containerRef]);

  const ensureValidStep = useCallback(
    (step: StepKey) => {
      if (!selectedMethodId && step !== 'method') {
        return 'method';
      }
      return STEP_ORDER.includes(step) ? step : 'method';
    },
    [selectedMethodId],
  );

  useEffect(() => {
    setCurrentStep((prev) => ensureValidStep(prev));
  }, [ensureValidStep]);

  useEffect(() => {
    if (!selectedMethodId) {
      return;
    }
    const exists = methodSummaries.some((summary) => summary.id === selectedMethodId);
    if (!exists) {
      setSelectedMethodId(null);
      setCurrentStep('method');
      setToastMessage('Ez a módszer nem elérhető ehhez a teához');
    }
  }, [selectedMethodId, methodSummaries]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }
    const timeout = window.setTimeout(() => setToastMessage(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const url = new URL(window.location.href);
    if (selectedMethodId) {
      url.searchParams.set('method', selectedMethodId);
    } else {
      url.searchParams.delete('method');
    }
    url.searchParams.set('ml', String(volumeMl));
    url.searchParams.set('phase', computePhase(currentStep));
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, [selectedMethodId, volumeMl, currentStep]);

  const goToStep = useCallback(
    (step: StepKey) => {
      setCurrentStep(ensureValidStep(step));
    },
    [ensureValidStep],
  );

  const goBack = useCallback(() => {
    const index = STEP_ORDER.indexOf(currentStep);
    if (index > 0) {
      goToStep(STEP_ORDER[index - 1]);
      return;
    }
    onExit();
  }, [currentStep, goToStep, onExit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack]);

  const handleMethodSelect = useCallback((method: string) => {
    setSelectedMethodId(method);
    setCurrentStep('volume');
  }, []);

  const handleVolumeSubmit = useCallback(
    (volume: number) => {
      setVolumeMl(clampVolume(volume));
      goToStep('gear');
    },
    [goToStep],
  );

  const gearInfo = useMemo<GearInfo>(
    () => ({
      gear: normalizeArray(methodProfile?.gear),
      filterRequired: Boolean((methodProfile as any)?.filter_required),
      allowNoFilter: Boolean((methodProfile as any)?.allow_no_filter),
      hasProfile: Boolean(methodProfile),
    }),
    [methodProfile],
  );

  const methodLabel = useMemo(() => {
    if (!selectedMethodId) {
      return 'Még nincs kiválasztva';
    }
    if (!methodProfile) {
      return selectedMethodId
        .split(/[-_]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
    const title = (methodProfile as any)?.title;
    if (typeof title === 'string' && title.trim().length > 0) {
      return title.trim();
    }
    return selectedMethodId
      .split(/[-_]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, [methodProfile, selectedMethodId]);

  const methodSummary = useMemo(() => {
    if (!selectedMethodId) {
      return null;
    }
    return methodSummaries.find((entry) => entry.id === selectedMethodId) ?? null;
  }, [methodSummaries, selectedMethodId]);

  const notes = useMemo(() => normalizeArray((methodProfile as any)?.notes), [methodProfile]);
  const cautionNotes = useMemo(() => normalizeArray((methodProfile as any)?.caution_notes), [methodProfile]);

  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const mergedTitleRef = useMemo(() => mergeRefs<HTMLHeadingElement>(titleRef, headerRef), [titleRef]);

  useEffect(() => {
    headerRef.current?.focus();
  }, [currentStep]);

  const filterState = selectedMethodId && gearInfo.hasProfile ? getFilterState(gearInfo) : null;
  const filterLabelMap: Record<FilterState, string> = {
    required: 'Kötelező',
    optional: 'Választható',
    suggested: 'Javasolt',
  };
  const filterAssistMap: Record<FilterState, string> = {
    required: 'Szűrő nélkül nem ajánlott.',
    optional: 'Ha szeretnéd, elhagyható.',
    suggested: 'Javasolt a tiszta csészéhez.',
  };

  let filterTitle = 'Válassz módszert';
  let filterAssist = 'A módszer kiválasztása után jelenik meg.';
  let filterBadge: FilterState | null = null;
  if (selectedMethodId && gearInfo.hasProfile && filterState) {
    filterBadge = filterState;
    filterTitle = filterLabelMap[filterState];
    filterAssist = filterAssistMap[filterState];
  } else if (selectedMethodId && !gearInfo.hasProfile) {
    filterTitle = 'Nincs adat';
    filterAssist = 'Ehhez a módszerhez nem találtunk szűrő információt.';
  }

  const methodTitle = methodSummary?.name ?? methodLabel;
  const methodAssist =
    methodSummary?.oneLiner ?? methodSummary?.description ?? (selectedMethodId ? 'Módszer kiválasztva.' : 'Válaszd ki, hogyan főzzük.');
  const volumeAssist = currentStep === 'volume' ? 'Most állítod be.' : 'Bármikor módosíthatod a mennyiséget.';

  const prefersReducedMotion = useReducedMotion();
  const motionVariants = useMemo(
    () =>
      prefersReducedMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }
        : {
            initial: { opacity: 0, x: 24 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -24 },
          },
    [prefersReducedMotion],
  );
  const motionTransition = useMemo(
    () => ({
      duration: prefersReducedMotion ? 0.18 : 0.32,
      ease: prefersReducedMotion ? 'linear' : [0.16, 1, 0.3, 1],
    }),
    [prefersReducedMotion],
  );

  const mainColor = tea.colorMain ?? '#1f2937';
  const darkColor = tea.colorDark ?? '#0f172a';
  const category = ((tea as any)?.category ?? (tea as any)?.Category ?? tea.category ?? '') as string;
  const backdropStyle = useMemo(
    () => ({
      background: `radial-gradient(circle at 50% -20%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.16) 36%, rgba(0,0,0,0.5) 100%), ${mainColor}`,
    }),
    [mainColor],
  );

  let stepContent: JSX.Element | null = null;
  switch (currentStep) {
    case 'method':
      stepContent = (
        <StepMethod
          tea={tea}
          selectedMethodId={selectedMethodId}
          onSelect={setSelectedMethodId}
          onNext={handleMethodSelect}
          onBack={goBack}
        />
      );
      break;
    case 'volume':
      stepContent = <StepVolume defaultVolume={volumeMl} onSubmit={handleVolumeSubmit} onBack={goBack} />;
      break;
    case 'gear':
      stepContent = <StepGearFilter info={gearInfo} onBack={goBack} onNext={() => goToStep('water')} />;
      break;
    case 'water':
      stepContent = (
        <StepWaterAndLeaf
          volumeMl={volumeMl}
          ratio={(methodProfile as any)?.ratio}
          tempC={(methodProfile as any)?.tempC}
          preheat={Boolean((methodProfile as any)?.preheat_vessel)}
          notes={notes}
          onBack={goBack}
          onNext={() => {
            goToStep('steep');
          }}
        />
      );
      break;
    case 'steep':
      stepContent = (
        <StepSteep
          steep={(methodProfile as any)?.steepMin ?? null}
          steepSeconds={(methodProfile as any)?.time_s ?? null}
          timerHint={(methodProfile as any)?.timer_hint ?? null}
          caution={cautionNotes}
          onBack={goBack}
          onNext={() => goToStep('finish')}
        />
      );
      break;
    case 'finish':
      stepContent = (
        <StepFinish
          teaName={tea.name}
          methodLabel={methodLabel}
          finishMessage={(methodProfile as any)?.finish_message ?? null}
          notes={notes}
          onRestart={() => goToStep(selectedMethodId ? 'volume' : 'method')}
          onClose={onExit}
        />
      );
      break;
    default:
      stepContent = null;
  }

  const methodIcon = methodSummary?.icon ? (
    <img src={methodSummary.icon} alt="" className={styles.hudMethodIcon} />
  ) : (
    <Beaker aria-hidden="true" className={styles.hudIcon} />
  );

  return (
    <div className={styles.journeyRoot} ref={mergedContainerRef}>
      <div className={styles.journeyBackdrop} aria-hidden="true">
        <div className={styles.journeyBackdropImage} style={backdropStyle} />
        <MandalaBackground color={darkColor} category={category} className={styles.journeyMandala} />
        <div className={styles.journeyBackdropTint} />
      </div>

      <div className={styles.journeyContent}>
        <div className={styles.panelRoot}>
          <div className={styles.stepHeader}>
            <span className={styles.stepBadge}>Mirāchai Brew Journey</span>
            <h2 className={styles.stepTitle} tabIndex={-1} ref={mergedTitleRef}>
              {tea.name}
            </h2>
            <p className={styles.stepLead}>Lépésről lépésre vezetünk végig a kiválasztott módszeren.</p>
          </div>
          <div className={styles.stageArea}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                className={styles.stepMotion}
                variants={motionVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={motionTransition}
              >
                {stepContent}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <aside className={styles.hud} data-filter-state={filterBadge ?? undefined}>
          <div className={styles.hudItem}>
            <div className={styles.hudIconWrap}>{methodIcon}</div>
            <div className={styles.hudText}>
              <span className={styles.hudLabel}>Módszer</span>
              <span className={styles.hudValue}>{methodTitle}</span>
              <span className={styles.hudAssist}>{methodAssist}</span>
            </div>
          </div>
          <div className={styles.hudItem}>
            <div className={styles.hudIconWrap}>
              <Droplet aria-hidden="true" className={styles.hudIcon} />
            </div>
            <div className={styles.hudText}>
              <span className={styles.hudLabel}>Mennyiség</span>
              <span className={styles.hudValue}>{`${volumeMl} ml`}</span>
              <span className={styles.hudAssist}>{volumeAssist}</span>
            </div>
          </div>
          <div className={styles.hudItem} data-state={filterBadge ?? undefined}>
            <div className={styles.hudIconWrap}>
              <FilterIcon aria-hidden="true" className={styles.hudIcon} />
            </div>
            <div className={styles.hudText}>
              <span className={styles.hudLabel}>Szűrő</span>
              <span className={styles.hudValue}>{filterTitle}</span>
              <span className={styles.hudAssist}>{filterAssist}</span>
            </div>
          </div>
        </aside>
      </div>

      {toastMessage ? (
        <div className={styles.toast} role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}