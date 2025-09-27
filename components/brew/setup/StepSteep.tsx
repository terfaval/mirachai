import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/BrewJourney.module.css';
import { shouldShowTimer } from '@/lib/brew.ratio';
import { useStepFooter } from '../BrewJourney';

function parseSteepRange(input: unknown): { min: number | null; max: number | null } {
  if (typeof input === 'number') {
    const value = Number.isFinite(input) ? input : null;
    return { min: value, max: value };
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return { min: null, max: null };
    }
    const rangeMatch = trimmed.match(/(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)/);
    if (rangeMatch) {
      const min = Number.parseFloat(rangeMatch[1].replace(',', '.'));
      const max = Number.parseFloat(rangeMatch[2].replace(',', '.'));
      return { min, max };
    }
    const numeric = Number.parseFloat(trimmed.replace(',', '.'));
    if (Number.isFinite(numeric)) {
      return { min: numeric, max: numeric };
    }
  }
  return { min: null, max: null };
}

type StepSteepProps = {
  steep: unknown;
  steepSeconds?: unknown;
  timerHint?: string | null;
  onNext: () => void;
  onBack: () => void;
  caution?: Array<string | null | undefined> | string | null;
};

function normalizeList(value: StepSteepProps['caution']): string[] {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value];
  }
  return [];
}

export default function StepSteep({ steep, steepSeconds, timerHint, onNext, onBack, caution }: StepSteepProps) {
  const { min, max } = useMemo(() => parseSteepRange(steep), [steep]);
  const secondsAsMinutes = useMemo(() => {
    if (typeof steepSeconds === 'number') {
      return steepSeconds / 60;
    }
    if (typeof steepSeconds === 'string') {
      const parsed = Number.parseFloat(steepSeconds);
      if (Number.isFinite(parsed)) {
        return parsed / 60;
      }
    }
    return null;
  }, [steepSeconds]);
  const showTimer = shouldShowTimer(max ?? min ?? secondsAsMinutes);
  const defaultMinutes = max && min ? (max + min) / 2 : max ?? min ?? secondsAsMinutes ?? 0;
  const defaultSeconds = Math.round((defaultMinutes || 0) * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startButtonRef = useRef<HTMLButtonElement | null>(null);

  const cautionList = useMemo(() => normalizeList(caution), [caution]);

  useEffect(() => {
    setRemainingSeconds(defaultSeconds);
    setIsRunning(false);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!showTimer || !isRunning) {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [showTimer, isRunning]);

  useEffect(() => {
    startButtonRef.current?.focus();
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const minutes = Math.floor(remainingSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(remainingSeconds % 60)
    .toString()
    .padStart(2, '0');

  const steepText = min && max
    ? `${min}–${max} perc`
    : min
      ? `${min} perc`
      : secondsAsMinutes
        ? `${Math.round(secondsAsMinutes * 10) / 10} perc`
        : 'A profil részletei szerint';

  const footer = useMemo(
    () => (
      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Vissza
        </button>
        {!showTimer ? null : (
          <button type="button" className={styles.primaryButton} onClick={onNext}>
            Léptetés a befejezésre
          </button>
        )}
      </footer>
    ),
    [onBack, onNext, showTimer],
  );

  useStepFooter(footer);

  return (
    <div className={styles.stepWrapper}>
      <div className={styles.steepPanel}>
        <div className={styles.steepRange}>Ajánlott idő: {steepText}</div>
        {timerHint ? <div className={styles.steepHint}>Leöntés javaslat: {timerHint}</div> : null}

        {showTimer ? (
          <div className={styles.timerBox}>
            <div className={styles.timerDisplay}>
              {minutes}:{seconds}
            </div>
            <div className={styles.timerControls}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setIsRunning((value) => !value)}
                ref={startButtonRef}
              >
                {isRunning ? 'Szünet' : 'Indítás'}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => {
                  setIsRunning(false);
                  setRemainingSeconds(defaultSeconds);
                }}
              >
                Reset
              </button>
              <button type="button" className={styles.secondaryButton} onClick={onNext}>
                Késznek jelölöm
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.noTimerBox}>
            <p>Az ajánlott áztatási idő hosszabb 30 percnél, ezért nem indítunk beépített időzítőt. Állíts be saját emlékeztetőt!</p>
            <button type="button" className={styles.primaryButton} onClick={onNext}>
              Tovább a befejezéshez
            </button>
          </div>
        )}

        {cautionList.length ? (
          <div className={styles.cautionBox}>
            <h4>Figyelmeztetés</h4>
            <ul>
              {cautionList.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

    </div>
  );
}