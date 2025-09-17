import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import MandalaBackground from '../panels/MandalaBackground';
import { SetupJourneyTop } from './Setup';
import uiTexts from '../../data/ui_texts.json';
import { pickIntroCopy, type IntroCopy } from '../../utils/introCopy';

const FLIP_DUR = 0.9;
const FLIP_EASE = [0.22, 1, 0.36, 1] as const;
const MID_HOLD = 0.5;
const MID_LIFT = 160;
const TARGET_LIFT = 280;

type IntroTexts = {
  brewJourney?: {
    intro?: {
      h1?: string[];
      lead?: string[];
    };
  };
};

type IntroProps = {
  tea: {
    id?: string;
    slug: string;
    name: string;
    category?: string;
    colorMain?: string;
    colorDark?: string;
  };
  onSetupEnter?: (teaId: string) => void;
};

type BrewBoxShellProps = {
  front: ReactNode;
  back: ReactNode;
  background: string;
  onComplete?: () => void;
};

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

const introCopyOptions = createIntroCopyOptions((uiTexts as IntroTexts)?.brewJourney?.intro);

const usePrefersReducedMotion = () => {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefers(media.matches);
    update();
    const handler = () => update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handler);
      return () => media.removeEventListener('change', handler);
    }

    media.addListener(handler);
    return () => media.removeListener(handler);
  }, []);

  return prefers;
};

function BrewBoxShell({ front, back, background, onComplete }: BrewBoxShellProps) {
  const [phase, setPhase] = useState<'intro' | 'setup'>('intro');
  const [animating, setAnimating] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const holdRatio = prefersReducedMotion ? 0.6 : MID_HOLD;
    const timer = window.setTimeout(() => setPhase('setup'), holdRatio * FLIP_DUR * 1000);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <div
      className="brew-box-shell inline-block"
      style={{ perspective: 1600, pointerEvents: animating ? 'none' : undefined }}
    >
      <style>{`.brew-box-shell__faces.is-animating * { transition: none !important; animation: none !important; }`}</style>
      <motion.div
        className="brew-box-shell__inner relative overflow-hidden rounded-[32px] shadow-2xl"
        style={{
          width: 'var(--card-w, 480px)',
          height: 'var(--card-h, 640px)',
          background,
          transformStyle: 'preserve-3d',
          transformPerspective: 1400,
        }}
        initial={
          prefersReducedMotion
            ? { opacity: 0, scale: 0.94, y: 0 }
            : { rotateX: 0, y: 0 }
        }
        animate={
          prefersReducedMotion
            ? { opacity: 1, scale: 1, y: -TARGET_LIFT }
            : { rotateX: [0, 180, 180], y: [0, -MID_LIFT, -TARGET_LIFT] }
        }
        transition={
          prefersReducedMotion
            ? { duration: FLIP_DUR, ease: FLIP_EASE }
            : { duration: FLIP_DUR, ease: FLIP_EASE, times: [0, MID_HOLD, 1] }
        }
        onAnimationStart={() => setAnimating(true)}
        onAnimationComplete={() => {
          setAnimating(false);
          setPhase('setup');
          onComplete?.();
        }}
      >
        <div
          className={`brew-box-shell__faces absolute inset-0 ${animating ? 'is-animating' : ''}`}
          aria-live="polite"
          data-phase={phase}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div
            aria-hidden={phase !== 'intro'}
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              display: prefersReducedMotion && phase !== 'intro' ? 'none' : undefined,
            }}
          >
            {front}
          </div>
          <div
            aria-hidden={phase !== 'setup'}
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              transform: prefersReducedMotion ? 'none' : 'rotateX(180deg)',
              display: prefersReducedMotion && phase !== 'setup' ? 'none' : undefined,
            }}
          >
            {back}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Intro({ tea, onSetupEnter }: IntroProps) {
  const teaId = String(tea.id ?? tea.slug ?? tea.name ?? 'tea');
  const copy = useMemo(() => pickIntroCopy(teaId, introCopyOptions), [teaId]);

  const mainColor = tea.colorMain ?? '#B88E63';
  const darkColor = tea.colorDark ?? '#2D1E3E';

  const front = (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden text-center text-white">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% -20%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 32%, rgba(0,0,0,0.45) 100%), ${mainColor}`,
        }}
      />
      <MandalaBackground
        color={darkColor}
        category={tea.category ?? ''}
        className="max-w-none opacity-35"
      />
      <div className="relative z-10 flex flex-col items-center gap-6 px-10">
        <img src="/mirachai_logo.svg" alt="Mirachai" className="h-20 w-20" />
        <div className="flex flex-col gap-3">
          <span className="text-xs uppercase tracking-[0.4em] text-white/70">Brew Journey</span>
          <h1 className="text-4xl font-semibold leading-tight">{copy.h1}</h1>
          <p className="max-w-sm text-base leading-relaxed text-white/80">{copy.lead}</p>
        </div>
        <div className="rounded-full bg-white/15 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/85">
          {tea.name}
        </div>
      </div>
    </div>
  );

  const back = <SetupJourneyTop tea={tea} methodId={null} volumeMl={250} />;

  return (
    <BrewBoxShell
      front={front}
      back={back}
      background={mainColor}
      onComplete={() => onSetupEnter?.(teaId)}
    />
  );
}