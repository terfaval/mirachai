import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import MandalaBackground from '../panels/MandalaBackground';
import { buildPlanFor, type BrewMethodPlan } from '../../lib/brew.integration';

export const FLIP_DUR = 0.9;
export const FLIP_EASE = [0.22, 1, 0.36, 1] as const;
export const MID_HOLD = 0.5;
export const MID_LIFT = 160;
export const TARGET_LIFT = 280;

type SetupProps = {
  tea: { slug: string; name: string; category?: string; colorMain?: string; colorDark?: string };
  value: { methodId: string | null; volumeMl: number };
  onChange: (v: { methodId: string | null; volumeMl: number }) => void;
  onNext: () => void;
  onBack: () => void;
};

type JourneyStep = {
  id: string;
  heading: string;
  description: string;
};

type JourneyTopProps = {
  tea: SetupProps['tea'];
  methodId?: string | null;
  volumeMl?: number;
  showControls?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  steps?: JourneyStep[];
  activeStepIndex?: number;
  stepsLoading?: boolean;
  methodLabel?: string;
};

const formatMethod = (methodId?: string | null) => {
  if (!methodId) return 'Módszer kiválasztása hamarosan';
  const cleaned = methodId.replace(/[-_]/g, ' ').trim();
  if (!cleaned) return 'Módszer kiválasztása hamarosan';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

const formatVolume = (volume?: number) => {
  if (!volume || Number.isNaN(volume)) return 'Add meg, mennyi teát főznél';
  return `${volume} ml`;
};

export function SetupJourneyTop({
  tea,
  methodId,
  methodLabel,
  volumeMl,
  showControls = false,
  onBack,
  onNext,
  nextDisabled = !methodId,
  nextLabel = 'Folytatás',
  steps = [],
  activeStepIndex = 0,
  stepsLoading = false,
}: JourneyTopProps) {
  const mainColor = tea.colorMain ?? '#B88E63';
  const darkColor = tea.colorDark ?? '#2D1E3E';
  const stepsList = useMemo(() => steps ?? [], [steps]);
  const totalSteps = stepsList.length;
  const clampedActiveIndex = totalSteps
    ? Math.max(0, Math.min(activeStepIndex, totalSteps - 1))
    : 0;
  const effectiveIndex = totalSteps ? clampedActiveIndex : null;
  const visibleSteps = totalSteps ? stepsList.slice(0, clampedActiveIndex + 1) : [];
  const stepRefs = useRef<Array<HTMLLIElement | null>>([]);
  const headingRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const prevActiveRef = useRef<number | null>(null);
  const stepsKey = useMemo(() => stepsList.map((s) => s.id).join('|'), [stepsList]);

  useEffect(() => {
    prevActiveRef.current = null;
    stepRefs.current = [];
    headingRefs.current = [];
  }, [stepsKey]);

  useEffect(() => {
    if (effectiveIndex == null) return;
    if (!totalSteps) return;
    const previous = prevActiveRef.current;
    if (previous === null) {
      prevActiveRef.current = effectiveIndex;
      return;
    }
    if (effectiveIndex === previous) return;

    const stepEl = stepRefs.current[effectiveIndex];
    const headingEl = headingRefs.current[effectiveIndex];
    stepEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    let timer: number | undefined;
    if (headingEl) {
      timer = window.setTimeout(() => {
        headingEl.focus({ preventScroll: true });
      }, 220);
    }

    prevActiveRef.current = effectiveIndex;

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [effectiveIndex, totalSteps]);

  const methodDisplay = methodLabel ?? formatMethod(methodId);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-[32px]"
      style={{ background: `linear-gradient(160deg, ${mainColor} 0%, ${darkColor} 68%)` }}
    >
      <div className="relative flex flex-col gap-6 px-10 py-12 text-white">
        <MandalaBackground
          color={tea.colorDark ?? darkColor}
          category={tea.category ?? ''}
          className="max-w-none opacity-40"
        />
        <div className="relative z-10 flex flex-col gap-4">
          <span className="text-xs uppercase tracking-[0.4em] text-white/60">Mirachai Brew Journey</span>
          <h1 className="text-4xl font-semibold leading-tight">{tea.name}</h1>
          <p className="max-w-md text-base leading-relaxed text-white/80">
            Hangoljuk össze az elkészítést. A módszer és a mennyiség beállítása után végigvezetlek majd a
            főzésen, lépésről lépésre.
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap items-center gap-3 text-sm text-white/70">
          <span className="rounded-full border border-white/25 px-4 py-1 uppercase tracking-[0.3em]">1. lépés</span>
          <span className="rounded-full border border-white/10 px-4 py-1">Előkészítés</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 bg-white/92 px-10 py-8 text-slate-900 backdrop-blur">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Módszer</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{methodDisplay}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Hamarosan itt listázzuk a különböző elkészítési módokat, részletes ajánlásokkal.
            </p>
          </div>
          <div className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-slate-500">Mennyiség</div>
            <div className="mt-3 text-2xl font-semibold text-slate-900">{formatVolume(volumeMl)}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Az arányokat automatikusan számoljuk majd a választott térfogat alapján – könnyű lesz követni.
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-black/10 bg-white/75 shadow-inner">
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 text-xs font-semibold uppercase tracking-[0.3em] text-slate-600">
            <span>Mirachai Journey lépések</span>
            {totalSteps ? (
              <span className="text-[0.65rem] font-medium tracking-[0.4em] text-slate-400">
                {visibleSteps.length}/{totalSteps}
              </span>
            ) : null}
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {stepsLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/60 px-4 py-5 text-sm text-slate-500">
                Lépések betöltése…
              </div>
            ) : visibleSteps.length ? (
              <ol className="flex flex-col gap-4">
                {visibleSteps.map((step, idx) => {
                  const stepIndex = idx;
                  return (
                    <motion.li
                      key={step.id}
                      ref={(el) => {
                        stepRefs.current[stepIndex] = el;
                      }}
                      className="scroll-mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white/95 shadow-sm"
                      initial={stepIndex === 0 ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.22, ease: [0.33, 1, 0.68, 1] }}
                    >
                      <div className="flex flex-col gap-3 px-5 py-4">
                        <h3
                          ref={(el) => {
                            headingRefs.current[stepIndex] = el;
                          }}
                          tabIndex={-1}
                          className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 focus:outline-none focus-visible:ring focus-visible:ring-slate-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                          {step.heading}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-700">{step.description}</p>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/60 px-4 py-5 text-sm leading-relaxed text-slate-500">
                Válaszd ki a módszert, és itt jelennek meg a lépések.
              </div>
            )}
          </div>
        </div>

        {showControls ? (
          <div className="mt-auto flex flex-col gap-3 pt-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>Ez egy előnézet – hamarosan interaktív beállításokkal.</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-slate-300 px-5 py-2 font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                Vissza
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                className="rounded-full bg-slate-900 px-6 py-2 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {nextLabel}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Setup({ tea, value, onChange, onNext, onBack }: SetupProps) {
  void onChange;
  const [plan, setPlan] = useState<BrewMethodPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!value.methodId) {
      setPlan(null);
      setStepIndex(0);
      setLoadingPlan(false);
      return () => {
        cancelled = true;
      };
    }

    setLoadingPlan(true);
    buildPlanFor(tea.slug, value.methodId, value.volumeMl)
      .then((result) => {
        if (cancelled) return;
        setPlan(result);
        setStepIndex(0);
        setLoadingPlan(false);
      })
      .catch(() => {
        if (cancelled) return;
        setPlan(null);
        setStepIndex(0);
        setLoadingPlan(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tea.slug, value.methodId, value.volumeMl]);

  const steps = useMemo(() => {
    if (!plan || !Array.isArray(plan.steps)) return [];
    return plan.steps.map((step, idx) => {
      const rawTitle = step.title?.trim();
      const isGeneric = !rawTitle || rawTitle.toLowerCase() === 'lépés';
      const heading = isGeneric ? `${idx + 1}. lépés` : `${idx + 1}. ${rawTitle}`;
      return {
        id: `${plan.method_id}-${idx}`,
        heading,
        description: step.action,
      } satisfies JourneyStep;
    });
  }, [plan]);

  const totalSteps = steps.length;
  const clampedIndex = totalSteps ? Math.min(stepIndex, totalSteps - 1) : 0;
  const nextLabel = totalSteps > 0 && stepIndex >= totalSteps - 1 ? 'Indulhat a főzés' : 'Következő lépés';
  const nextDisabled = loadingPlan || totalSteps === 0;

  const handleNext = () => {
    if (loadingPlan) return;
    if (!totalSteps) return;
    if (stepIndex < totalSteps - 1) {
      setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
      return;
    }
    onNext();
  };

  return (
    <div
      className="h-full w-full"
      style={{ marginTop: `${-TARGET_LIFT}px` }}
    >
      <SetupJourneyTop
        tea={tea}
        methodId={value.methodId}
        methodLabel={plan?.method_label}
        volumeMl={value.volumeMl}
        showControls
        onBack={onBack}
        onNext={handleNext}
        nextDisabled={nextDisabled}
        nextLabel={nextLabel}
        steps={steps}
        activeStepIndex={clampedIndex}
        stepsLoading={loadingPlan}
      />
    </div>
  );
}