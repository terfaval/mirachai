import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/BrewJourney.module.css';
import { parseRatio, scaleByVolume, type ParsedRatio } from '@/lib/brew.ratio';
import { useStepFooter } from '../BrewJourney';

function formatNumber(value: number | null | undefined, unit: string): string | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return `${value}${unit}`;
}

type StepWaterAndLeafProps = {
  volumeMl: number;
  ratio: string | null | undefined;
  tempC?: number | null;
  preheat?: boolean | null;
  notes?: Array<string | null | undefined> | string | null;
  onNext: (context: { parsedRatio: ParsedRatio; strength: number }) => void;
  onBack: () => void;
};

function normalizeNotes(notes: StepWaterAndLeafProps['notes']): string[] {
  if (!notes) {
    return [];
  }
  if (Array.isArray(notes)) {
    return notes.filter((note): note is string => typeof note === 'string' && note.trim().length > 0);
  }
  if (typeof notes === 'string' && notes.trim().length > 0) {
    return [notes];
  }
  return [];
}

export default function StepWaterAndLeaf({ volumeMl, ratio, tempC, preheat, notes, onNext, onBack }: StepWaterAndLeafProps) {
  const parsedRatio = useMemo(() => parseRatio(ratio), [ratio]);
  const [strength, setStrength] = useState(0.5);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const focusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setStrength(0.5);
  }, [ratio]);

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);

  const scaled = useMemo(() => scaleByVolume(volumeMl, parsedRatio, { strength }), [volumeMl, parsedRatio, strength]);
  const [unitMode, setUnitMode] = useState<'grams' | 'spoons'>('grams');
  useEffect(() => {
    setUnitMode((mode) => {
      const hasSpoon = scaled.teaspoons != null || scaled.tablespoons != null;
      if (scaled.grams == null && hasSpoon) {
        return 'spoons';
      }
      if (!hasSpoon && scaled.grams != null) {
        return 'grams';
      }
      return mode;
    });
  }, [scaled.grams, scaled.tablespoons, scaled.teaspoons]);
  const noteList = useMemo(() => normalizeNotes(notes), [notes]);

  const strengthEnabled = parsedRatio.kind === 'range' || parsedRatio.kind === 'parts';
  const ratioDescription = parsedRatio.raw;

  const gramsText = formatNumber(scaled.grams, ' g');
  const spoonHints: string[] = [];
  if (scaled.teaspoons != null) {
    spoonHints.push(`${scaled.teaspoons} tk`);
  }
  if (scaled.tablespoons != null) {
    spoonHints.push(`${scaled.tablespoons} ek`);
  }
  const spoonText = spoonHints.length ? spoonHints.join(' · ') : null;
  const primaryTeaAmount =
    unitMode === 'spoons' ? spoonText ?? gramsText ?? '–' : gramsText ?? spoonText ?? '–';
  const teaHints = unitMode === 'spoons' ? (gramsText ? [gramsText] : []) : spoonHints;
  const alternateTeaAmount = unitMode === 'spoons' ? gramsText : spoonText;
  const alternateTeaDisplay =
    alternateTeaAmount && alternateTeaAmount !== primaryTeaAmount ? alternateTeaAmount : null;
  const canUseGrams = gramsText != null;
  const canUseSpoons = spoonText != null;
  const showUnitToggle = canUseGrams && canUseSpoons;
  const hasNumericRatio = scaled.grams != null;

  const footer = useMemo(
    () => (
      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Vissza
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          ref={nextRef}
          onClick={() => onNext({ parsedRatio, strength })}
        >
          Indulhat az áztatás
        </button>
      </footer>
    ),
    [onBack, onNext, parsedRatio, strength],
  );

  useStepFooter(footer);

  return (
    <div className={styles.stepWrapper}>
      <div className={styles.waterLeafPanel} tabIndex={-1} ref={focusRef}>
        <div className={styles.waterLeafAmounts}>
          <div className={styles.amountBlock}>
            <span className={styles.amountLabel}>Tea levél</span>
            <span className={styles.amountValue}>{primaryTeaAmount}</span>
            {teaHints.length ? (
              <div className={styles.amountHints}>
                {teaHints.map((hint) => (
                  <span key={hint}>{hint}</span>
                ))}
              </div>
            ) : null}
          </div>
          <div className={styles.amountBlock}>
            <span className={styles.amountLabel}>Víz</span>
            <div className={styles.amountValueRow}>
              <span className={styles.amountValue}>{volumeMl} ml</span>
              {typeof tempC === 'number' ? <span className={styles.tempBadge}>{tempC}°C</span> : null}
            </div>
          </div>
        </div>

        <div className={styles.ingredientsBox}>
          <div className={styles.ingredientsHeader}>
            <h4>Hozzávalók</h4>
            {showUnitToggle ? (
              <div className={styles.unitToggle} role="group" aria-label="Tea mértékegysége">
                <button
                  type="button"
                  className={styles.unitToggleButton}
                  data-active={unitMode === 'grams' ? 'true' : undefined}
                  aria-pressed={unitMode === 'grams'}
                  onClick={() => setUnitMode('grams')}
                >
                  Gramm
                </button>
                <button
                  type="button"
                  className={styles.unitToggleButton}
                  data-active={unitMode === 'spoons' ? 'true' : undefined}
                  aria-pressed={unitMode === 'spoons'}
                  onClick={() => setUnitMode('spoons')}
                >
                  Kanál
                </button>
              </div>
            ) : null}
          </div>

          <div className={styles.ingredientsList}>
            <div className={styles.ingredientsRow}>
              <span className={styles.ingredientsLabel}>Tea levél</span>
              <span className={styles.ingredientsValue}>
                {primaryTeaAmount}
                {alternateTeaDisplay ? (
                  <span className={styles.ingredientsAlt}>({alternateTeaDisplay})</span>
                ) : null}
              </span>
            </div>
            <div className={styles.ingredientsRow}>
              <span className={styles.ingredientsLabel}>Víz</span>
              <span className={styles.ingredientsValue}>
                {volumeMl} ml
                {typeof tempC === 'number' ? ` · ${tempC}°C` : ''}
              </span>
            </div>
          </div>
        </div>

        {preheat ? (
          <div className={styles.preheatNotice}>A profil előmelegített eszközt javasol – melegítsd át a kannát vagy a csészét.</div>
        ) : null}

        <div className={styles.ratioBox}>
          <h4>Profil szerinti arány</h4>
          <p>{ratioDescription || 'Nincs megadott arány – a leírást kövesd.'}</p>
          {!hasNumericRatio ? (
            <p className={styles.ratioHint}>A profil nem adott meg pontos grammozást – igazodj a leíráshoz és saját ízlésedhez.</p>
          ) : null}
          {strengthEnabled ? (
            <div className={styles.sliderRow}>
              <label htmlFor="ratio-strength" className={styles.sliderLabel}>
                Intenzitás
              </label>
              <input
                id="ratio-strength"
                type="range"
                min={0}
                max={100}
                value={Math.round(strength * 100)}
                onChange={(event) => setStrength(Number(event.target.value) / 100)}
                className={styles.slider}
              />
            </div>
          ) : null}
        </div>

        {noteList.length ? (
          <div className={styles.noteBox}>
            <h4>Megjegyzések</h4>
            <ul>
              {noteList.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

    </div>
  );
}