import {
  MutableRefObject,
  ReactNode,
  Ref,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import MandalaBackground from '@/components/panels/MandalaBackground';
import StepFinish from './setup/StepFinish';
import StepGearFilter, { type GearInfo } from './setup/StepGearFilter';
import { getFilterState, type FilterState } from '@/lib/brew.filter';
import StepMethod from './setup/StepMethod';
import StepSteep from './setup/StepSteep';
import StepVolume from './setup/StepVolume';
import StepWaterAndLeaf from './setup/StepWaterAndLeaf';
import brewProfiles from '@/data/brew_profiles.json';
import styles from '@/styles/BrewJourney.module.css';
import { slugify } from '@/lib/normalize';
import type { Tea } from '@/utils/filter';
import { getBrewMethodsForTea, type BrewMethodSummary } from '@/utils/brewMethods';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { buildIngredients } from '@/utils/teaTransforms';
import { normalizeInstructionSteps } from './normalizeSteps';

type StepKey = 'method' | 'volume' | 'gear' | 'water' | 'steep' | 'finish';

const STEP_ORDER: StepKey[] = ['method', 'volume', 'gear', 'water', 'steep', 'finish'];
const DEFAULT_VOLUME = 250;

const JOURNEY_LEAD_COPY: Record<StepKey, string> = {
  method: 'Válaszd ki a hozzád illő elkészítési módot, hogy személyre szabott útmutatót kapj.',
  volume: 'Add meg, mennyi teát készítesz, így minden arány pontos lesz.',
  gear: 'Ellenőrizd, milyen eszközökre lesz szükséged ehhez a főzési módszerhez.',
  water: 'Állítsd be a víz- és levélarányokat, majd készítsd elő a teát.',
  steep: 'Kövesd az áztatási időt és a tippeket a tökéletes eredményért.',
  finish: 'Nézd át az összefoglalót, és élvezd a frissen elkészült teát.',
};

const STEP_SHORT_TITLES: Record<StepKey, string> = {
  method: 'Módszer',
  volume: 'Mennyiség',
  gear: 'Kellékek',
  water: 'Forralás',
  steep: 'Áztatás',
  finish: 'Kész',
};

export type BrewHudInfo = {
  methodIconSrc: string;
  methodIconVariant: 'method' | 'default';
  methodTitle: string;
  stepsIconSrc: string;
  steps: string[];
  stepsSummary: string | null;
  volumeIconSrc: string;
  volumeValue: string;
  filterIconSrc: string;
  filterState: FilterState | null;
  filterTitle: string;
  showMethod: boolean;
  showSteps: boolean;
  showVolume: boolean;
  showFilter: boolean;
};

export type BrewReviewRequest = {
  teaId: string | number;
  teaName: string;
  methodId: string | null;
  methodLabel: string;
  methodTitle: string;
};

const StepFooterContext = createContext<(content: ReactNode | null) => void>(() => {});

export function useStepFooter(content: ReactNode | null) {
  const setFooter = useContext(StepFooterContext);

  useEffect(() => {
    setFooter(content);
    return () => {
      setFooter(null);
    };
  }, [content, setFooter]);
}

type BrewJourneyProps = {
  layoutId?: string;
  tea: Tea & { colorMain?: string; colorDark?: string };
  methodId?: string | null;
  onExit: () => void;
  onReview?: (request: BrewReviewRequest) => void;
  titleRef?: Ref<HTMLHeadingElement>;
  containerRef?: Ref<HTMLDivElement>;
  onHudChange?: (info: BrewHudInfo | null) => void;
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

function methodFallbackIconSrc(): string {
  return '/teasets/icon_teapot.svg';
}

function stepsIconSrc(): string {
  return '/teasets/icon_teaready.svg';
}

function volumeIconSrc(volumeMl: number, selectedMethodId?: string | null): string {
  const method = selectedMethodId ?? '';
  if (/coldbrew|bottle|snap|infused|ferment/i.test(method)) return '/teasets/icon_bottle.svg';
  if (volumeMl <= 200) return '/teasets/icon_tinycup.svg';
  if (volumeMl <= 300) return '/teasets/icon_cup.svg';
  if (volumeMl <= 600) return '/teasets/icon_mug.svg';
  if (volumeMl <= 900) return '/teasets/icon_jug.svg';
  return '/teasets/icon_teapot.svg';
}

function filterIconSrc(state: FilterState | null): string {
  if (state === 'required') return '/teasets/icon_filter_ok.svg';
  if (state === 'not_needed') return '/teasets/icon_filter_no.svg';
  return '/teasets/icon_filter_ok.svg'; // optional
}

export function BrewHud({
  info,
  variant = 'default',
  className,
}: {
  info: BrewHudInfo;
  variant?: 'default' | 'external';
  className?: string;
}) {
  const items: ReactNode[] = [];

  if (info.showMethod) {
    items.push(
      <div className={styles.hudItem} key="method">
        <div className={styles.hudIconWrap}>
          <img
            src={info.methodIconSrc}
            alt=""
            className={info.methodIconVariant === 'method' ? styles.hudMethodIcon : styles.hudIcon}
          />
        </div>
        <div className={styles.hudText}>
          <span className={styles.hudLabel}>Módszer</span>
          <span className={styles.hudValue}>{info.methodTitle}</span>
          </div>
      </div>,
    );
  }

  if (info.showVolume) {
    items.push(
      <div className={styles.hudItem} key="volume">
        <div className={styles.hudIconWrap}>
          <img src={info.volumeIconSrc} alt="" className={styles.hudIcon} />
        </div>
        <div className={styles.hudText}>
          <span className={styles.hudLabel}>Mennyiség</span>
          <span className={styles.hudValue}>{info.volumeValue}</span>
        </div>
      </div>,
    );
  }

  if (info.showSteps) {
    items.push(
      <div className={styles.hudItem} key="steps">
        <div className={styles.hudIconWrap}>
          <img src={info.stepsIconSrc} alt="" className={styles.hudIcon} />
        </div>
        <div className={styles.hudText}>
          <span className={styles.hudLabel}>Lépések</span>
          {info.steps.length ? (
            <ol className={styles.hudStepsList}>
              {info.steps.map((step, index) => (
                <li key={index} className={styles.hudStepsListItem}>
                  {step}
                </li>
              ))}
            </ol>
          ) : info.stepsSummary ? (
            <span className={styles.hudValue}>{info.stepsSummary}</span>
          ) : null}
        </div>
      </div>,
    );
  }

  if (info.showFilter) {
    items.push(
      <div
        className={styles.hudItem}
        data-state={info.filterState ?? undefined}
        data-filter="true"
        key="filter"
      >
        <div className={styles.hudIconWrap}>
          <img src={info.filterIconSrc} alt="" className={styles.hudIcon} />
        </div>
        <div className={styles.hudText}>
          <span className={styles.hudLabel}>Szűrő</span>
          <span className={styles.hudValue}>{info.filterTitle}</span>
        </div>
      </div>,
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <aside
      className={clsx(styles.hud, className)}
      data-filter-state={info.showFilter ? info.filterState ?? undefined : undefined}
      data-variant={variant}
    >
      {items}
    </aside>
  );
}

export default function BrewJourney({
  layoutId,
  tea,
  methodId: initialMethodId,
  onExit,
  onReview,
  titleRef,
  containerRef,
  onHudChange,
}: BrewJourneyProps) {
  void layoutId;
  const initialParams = useMemo(() => readInitialParams(), []);
  const initialMethodFromUrl = initialParams.method;
  const resolvedInitialMethod = initialMethodFromUrl ?? (initialMethodId ?? null);
  const initialStep = useMemo(
    () => resolveInitialStep(initialParams.phase, resolvedInitialMethod != null),
    [initialParams, resolvedInitialMethod],
  );

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(() => resolvedInitialMethod);
  const [volumeMl, setVolumeMl] = useState<number>(() => clampVolume(initialParams.volume ?? DEFAULT_VOLUME));
  const [hasConfirmedVolume, setHasConfirmedVolume] = useState<boolean>(() => initialParams.volume != null);
  const [hasUnlockedSteps, setHasUnlockedSteps] = useState<boolean>(
    () => STEP_ORDER.indexOf(initialStep) > STEP_ORDER.indexOf('gear'),
  );
  const [currentStep, setCurrentStep] = useState<StepKey>(initialStep);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lastMethodIdRef = useRef<string | null>(resolvedInitialMethod);

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
    if (lastMethodIdRef.current !== selectedMethodId) {
      lastMethodIdRef.current = selectedMethodId;
      setHasUnlockedSteps(false);
    }
  }, [selectedMethodId]);

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
    setHasConfirmedVolume(false);
    setHasUnlockedSteps(false);
    setCurrentStep('volume');
  }, []);

  const handleVolumeSubmit = useCallback(
    (volume: number) => {
      setVolumeMl(clampVolume(volume));
      setHasConfirmedVolume(true);
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

  const stepsFromDescription = useMemo(() => {
    if (!methodSummary?.stepsText) {
      return [] as string[];
    }
    return methodSummary.stepsText
      .split(/→/g)
      .map((step) => step.replace(/\s+/g, ' ').trim())
      .filter((step) => step.length > 0);
  }, [methodSummary]);

  const methodSteps = useMemo(() => {
    if (stepsFromDescription.length > 0) {
      return stepsFromDescription;
    }
    return normalizeArray((methodProfile as any)?.steps);
  }, [methodProfile, stepsFromDescription]);

  const normalizedSteps = useMemo(() => normalizeInstructionSteps(methodSteps), [methodSteps]);

  const methodStepsSummary = useMemo(() => {
    if (!normalizedSteps.length) {
      return null;
    }
    const preview = normalizedSteps.slice(0, 3);
    const summary = preview.join(' → ');
    return normalizedSteps.length > preview.length ? `${summary}…` : summary;
  }, [normalizedSteps]);

  const notes = useMemo(() => normalizeArray((methodProfile as any)?.notes), [methodProfile]);
  const teaIngredients = useMemo(() => buildIngredients(tea), [tea]);
  const cautionNotes = useMemo(() => normalizeArray((methodProfile as any)?.caution_notes), [methodProfile]);

  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const mergedTitleRef = useMemo(() => mergeRefs<HTMLHeadingElement>(titleRef, headerRef), [titleRef]);

  useEffect(() => {
    headerRef.current?.focus();
  }, [currentStep]);

  const filterState = selectedMethodId && methodProfile ? getFilterState(methodProfile as any) : null;
  const filterLabelMap: Record<FilterState, string> = {
    required: 'Kötelező',
    optional: 'Választható',
    not_needed: 'Nem szükséges',
  };

  let filterTitle = 'Válassz módszert';
  let filterBadge: FilterState | null = null;
  if (selectedMethodId && gearInfo.hasProfile && filterState) {
    filterBadge = filterState;
    filterTitle = filterLabelMap[filterState];
  } else if (selectedMethodId && !gearInfo.hasProfile) {
    filterTitle = 'Nincs adat';
  }

  const methodTitle = methodSummary?.name ?? methodLabel;
  const teaIdentifier = useMemo<string | number>(() => {
    const rawId = (tea as any)?.id;
    if (rawId == null) {
      return tea.name;
    }
    return rawId as string | number;
  }, [tea]);
  useEffect(() => {
    if (STEP_ORDER.indexOf(currentStep) > STEP_ORDER.indexOf('volume')) {
      setHasConfirmedVolume(true);
    }
    if (STEP_ORDER.indexOf(currentStep) > STEP_ORDER.indexOf('gear')) {
      setHasUnlockedSteps(true);
    }
  }, [currentStep]);

  const prefersReducedMotion = usePrefersReducedMotion();
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
      stepContent = (
        <StepGearFilter
          info={gearInfo}
          methodTitle={methodTitle}
          methodDescription={methodSummary?.oneLiner ?? methodSummary?.description ?? null}
          steps={methodSteps}
          onBack={goBack}
          onNext={() => goToStep('water')}
        />
      );
      break;
    case 'water':
      stepContent = (
        <StepWaterAndLeaf
          volumeMl={volumeMl}
          ratio={(methodProfile as any)?.ratio}
          tempC={(methodProfile as any)?.tempC}
          preheat={Boolean((methodProfile as any)?.preheat_vessel)}
          notes={notes}
          ingredients={teaIngredients}
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
          onReview={() => {
            onReview?.({
              teaId: teaIdentifier,
              teaName: tea.name,
              methodId: selectedMethodId ?? null,
              methodLabel,
              methodTitle,
            });
          }}
          onClose={onExit}
        />
      );
      break;
    default:
      stepContent = null;
  }

  const methodIconSrc = methodSummary?.icon ?? methodFallbackIconSrc();
  const methodIconVariant: BrewHudInfo['methodIconVariant'] = methodSummary?.icon ? 'method' : 'default';
  const stepsIcon = stepsIconSrc();
  const volumeIcon = volumeIconSrc(volumeMl, selectedMethodId);
  const volumeValue = `${volumeMl} ml`;
  const filterIcon = filterIconSrc(filterBadge);
  const journeyLead = JOURNEY_LEAD_COPY[currentStep] ?? JOURNEY_LEAD_COPY.method;

  const hudInfo = useMemo<BrewHudInfo>(
    () => ({
      methodIconSrc,
      methodIconVariant,
      methodTitle,
      stepsIconSrc: stepsIcon,
      steps: normalizedSteps,
      stepsSummary: methodStepsSummary,
      volumeIconSrc: volumeIcon,
      volumeValue,
      filterIconSrc: filterIcon,
      filterState: filterBadge,
      filterTitle,
      showMethod: Boolean(selectedMethodId),
      showSteps: currentStep !== 'gear' && hasUnlockedSteps && normalizedSteps.length > 0,
      showVolume: hasConfirmedVolume,
      showFilter: filterBadge != null,
    }),
    [
      filterBadge,
      filterIcon,
      filterTitle,
      hasConfirmedVolume,
      currentStep,
      hasUnlockedSteps,
      methodIconSrc,
      methodIconVariant,
      methodStepsSummary,
      methodTitle,
      normalizedSteps,
      selectedMethodId,
      stepsIcon,
      volumeIcon,
      volumeValue,
    ],
  );

  useEffect(() => {
    if (!onHudChange) {
      return;
    }
    onHudChange(hudInfo);
  }, [hudInfo, onHudChange]);

  useEffect(() => {
    if (!onHudChange) {
      return;
    }
    return () => {
      onHudChange(null);
    };
  }, [onHudChange]);

  const totalSteps = STEP_ORDER.length;
  const stepIndex = Math.max(0, STEP_ORDER.indexOf(currentStep));

  const stepDots = useMemo(
    () =>
      STEP_ORDER.map((step, index) => (
        <span
          key={step}
          className={clsx(
            styles.stepDot,
            index < stepIndex ? styles.stepDotCompleted : undefined,
            index === stepIndex ? styles.stepDotCurrent : undefined,
          )}
          aria-hidden="true"
        />
      )),
    [stepIndex],
  );

  const stepTitle = STEP_SHORT_TITLES[currentStep];
  
  const [footerContent, setFooterContent] = useState<ReactNode | null>(null);

  return (
    <div className={styles.journeyRoot} ref={mergedContainerRef}>
      <div className={styles.journeyBackdrop} aria-hidden="true">
        <div className={styles.journeyBackdropImage} style={backdropStyle} />
        <MandalaBackground color={darkColor} category={category} className={styles.journeyMandala} />
        <div className={styles.journeyBackdropTint} />
      </div>

      <div
        className={styles.journeyContent}
        data-external-hud={onHudChange ? 'true' : undefined}
      >
        <div className={styles.panelColumn}>
          <div className={styles.panelRoot}>
            <div className={styles.stepHeader}>
              <div className={styles.stepHeaderRow}>
                <span className={styles.stepBadge}>Brew Journey</span>
                <div className={styles.stepTitleWrap}>
                  <h2 className={styles.journeyTitle} tabIndex={-1} ref={mergedTitleRef}>
                    {stepTitle}
                  </h2>
                </div>
                <div className={styles.stepProgress} aria-label={`Lépés ${stepIndex + 1} / ${totalSteps}`}>
                  <span className={styles.stepProgressCount}>
                    {stepIndex + 1} / {totalSteps}
                  </span>
                  <div className={styles.stepProgressDots}>{stepDots}</div>
                </div>
              </div>
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
                  <StepFooterContext.Provider value={setFooterContent}>
                    {stepContent}
                  </StepFooterContext.Provider>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {footerContent}
        </div>

        {onHudChange ? null : <BrewHud info={hudInfo} />}
      </div>

      {toastMessage ? (
        <div className={styles.toast} role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}
    </div>
  );
}