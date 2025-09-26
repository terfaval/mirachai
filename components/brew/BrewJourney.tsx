import { MutableRefObject, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StepFinish from './setup/StepFinish';
import StepGearFilter from './setup/StepGearFilter';
import StepMethod from './setup/StepMethod';
import StepSteep from './setup/StepSteep';
import StepVolume from './setup/StepVolume';
import StepWaterAndLeaf from './setup/StepWaterAndLeaf';
import brewProfiles from '@/data/brew_profiles.json';
import styles from '@/styles/BrewJourney.module.css';
import { slugify } from '@/lib/normalize';
import type { Tea } from '@/utils/filter';

type StepKey = 'method' | 'volume' | 'gear' | 'water' | 'steep' | 'finish';

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
        ref.current = node;
      }
    }
  };
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
  const profile = useMemo(() => findTeaProfile(tea), [tea]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(initialMethodId ?? null);
  const [volumeMl, setVolumeMl] = useState<number>(250);
  const [currentStep, setCurrentStep] = useState<StepKey>(initialMethodId ? 'volume' : 'method');

  const containerNodeRef = useRef<HTMLDivElement | null>(null);
  const mergedContainerRef = mergeRefs<HTMLDivElement>(containerRef, containerNodeRef);

  const methodProfile = useMemo(() => findMethod(profile, selectedMethodId), [profile, selectedMethodId]);

  const steps: StepKey[] = useMemo(() => {
    if (!selectedMethodId) {
      return ['method', 'volume', 'gear', 'water', 'steep', 'finish'];
    }
    return ['volume', 'gear', 'water', 'steep', 'finish'];
  }, [selectedMethodId]);

  const ensureValidStep = useCallback(
    (step: StepKey) => {
      const available = new Set<StepKey>(steps);
      if (available.has(step)) {
        return step;
      }
      return steps[0] ?? 'method';
    },
    [steps],
  );

  useEffect(() => {
    setCurrentStep((prev) => ensureValidStep(prev));
  }, [ensureValidStep]);

  useEffect(() => {
    if (selectedMethodId && !methodProfile) {
      setSelectedMethodId(null);
      setCurrentStep('method');
    }
  }, [methodProfile, selectedMethodId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const methodParam = params.get('method');
    const volumeParam = params.get('ml');
    const phaseParam = params.get('phase');

    if (methodParam && methodParam !== selectedMethodId) {
      const methodExists = findMethod(profile, methodParam) != null;
      if (methodExists) {
        setSelectedMethodId(methodParam);
      }
    }

    if (volumeParam) {
      const parsed = Number.parseInt(volumeParam, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        setVolumeMl(parsed);
      }
    }

    if (phaseParam === 'steep') {
      setCurrentStep(ensureValidStep('steep'));
    } else if (phaseParam === 'finish') {
      setCurrentStep(ensureValidStep('finish'));
    } else if (phaseParam === 'setup') {
      setCurrentStep(ensureValidStep(selectedMethodId ? 'volume' : 'method'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        goBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const goToStep = useCallback(
    (step: StepKey) => {
      setCurrentStep(ensureValidStep(step));
    },
    [ensureValidStep],
  );

  const goBack = useCallback(() => {
    const index = steps.indexOf(currentStep);
    if (index > 0) {
      goToStep(steps[index - 1]);
      return;
    }
    onExit();
  }, [currentStep, goToStep, onExit, steps]);

  const handleMethodSelect = useCallback(
    (method: string) => {
      setSelectedMethodId(method);
      setCurrentStep('volume');
    },
    [],
  );

  const handleVolumeSubmit = useCallback((volume: number) => {
    setVolumeMl(volume);
    goToStep('gear');
  }, [goToStep]);

  const gearInfo = useMemo(() => {
    const gear = normalizeArray(methodProfile?.gear);
    const filterRequired = Boolean((methodProfile as any)?.filter_required);
    const allowNoFilter = Boolean((methodProfile as any)?.allow_no_filter);
    return { gear, filterRequired, allowNoFilter };
  }, [methodProfile]);

  const methodLabel = useMemo(() => {
    if (!methodProfile) {
      return selectedMethodId ?? 'Ismeretlen módszer';
    }
    const title = (methodProfile as any)?.title;
    if (typeof title === 'string' && title.trim().length > 0) {
      return title.trim();
    }
    return (selectedMethodId ?? '')
      .split(/[-_]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }, [methodProfile, selectedMethodId]);

  const headerRef = useRef<HTMLHeadingElement | null>(null);
  const mergedTitleRef = mergeRefs<HTMLHeadingElement>(titleRef, headerRef);

  useEffect(() => {
    headerRef.current?.focus();
  }, [currentStep]);

  const notes = useMemo(() => normalizeArray((methodProfile as any)?.notes), [methodProfile]);
  const cautionNotes = useMemo(() => normalizeArray((methodProfile as any)?.caution_notes), [methodProfile]);

  useEffect(() => {
    const node = containerNodeRef.current;
    if (!node) {
      return;
    }
    node.scrollTop = 0;
  }, [currentStep]);

  return (
    <div className={styles.panelRoot} ref={mergedContainerRef}>
      <div className={styles.panelBody}>
        <div className={styles.stepHeader}>
          <span className={styles.stepBadge}>Mirāchai Brew Journey</span>
          <h2 className={styles.stepTitle} tabIndex={-1} ref={mergedTitleRef}>
            {tea.name}
          </h2>
          <p className={styles.stepLead}>Lépésről lépésre vezetünk végig a kiválasztott módszeren.</p>
        </div>

        {currentStep === 'method' ? (
          <StepMethod
            tea={tea}
            selectedMethodId={selectedMethodId}
            onSelect={setSelectedMethodId}
            onNext={handleMethodSelect}
            onBack={goBack}
          />
        ) : null}

        {currentStep === 'volume' ? (
          <StepVolume defaultVolume={volumeMl} onSubmit={handleVolumeSubmit} onBack={goBack} />
        ) : null}

        {currentStep === 'gear' ? (
          <StepGearFilter info={gearInfo} onBack={goBack} onNext={() => goToStep('water')} />
        ) : null}

        {currentStep === 'water' ? (
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
        ) : null}

        {currentStep === 'steep' ? (
          <StepSteep
            steep={(methodProfile as any)?.steepMin ?? null}
            steepSeconds={(methodProfile as any)?.time_s ?? null}
            timerHint={(methodProfile as any)?.timer_hint ?? null}
            caution={cautionNotes}
            onBack={goBack}
            onNext={() => goToStep('finish')}
          />
        ) : null}

        {currentStep === 'finish' ? (
          <StepFinish
            teaName={tea.name}
            methodLabel={methodLabel}
            finishMessage={(methodProfile as any)?.finish_message ?? null}
            notes={notes}
            onRestart={() => goToStep(selectedMethodId ? 'volume' : 'method')}
            onClose={onExit}
          />
        ) : null}
      </div>
    </div>
  );
}