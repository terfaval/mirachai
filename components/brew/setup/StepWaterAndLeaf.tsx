import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/BrewJourney.module.css';
import { parseRatio, scaleByVolume, type ParsedRatio } from '@/lib/brew.ratio';
import { getIngredientColor } from '../../../utils/colorMap';
import { useStepFooter } from '../BrewJourney';

function formatNumber(value: number | null | undefined, unit: string): string | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return `${value}${unit}`;
}

function formatPercent(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  const normalized = Math.max(0, value);
  if (normalized >= 10) {
    return `${Math.round(normalized)}%`;
  }
  const rounded = Math.round(normalized * 10) / 10;
  return `${rounded}%`;
}

function round(value: number, precision = 1): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

type IngredientShare = {
  name: string;
  rate: number;
};

type StepWaterAndLeafProps = {
  volumeMl: number;
  ratio: string | null | undefined;
  tempC?: number | null;
  preheat?: boolean | null;
  notes?: Array<string | null | undefined> | string | null;
  ingredients?: IngredientShare[] | null;
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

function normalizeIngredients(ingredients: StepWaterAndLeafProps['ingredients']): IngredientShare[] {
  if (!Array.isArray(ingredients)) {
    return [];
  }
  return ingredients
    .filter((item): item is IngredientShare => {
      if (!item) {
        return false;
      }
      const hasName = typeof item.name === 'string' && item.name.trim().length > 0;
      const rate = typeof item.rate === 'number' ? item.rate : Number.NaN;
      return hasName && Number.isFinite(rate) && rate > 0;
    })
    .map((item) => ({
      name: item.name.trim(),
      rate: item.rate,
    }));
}

export default function StepWaterAndLeaf({
  volumeMl,
  ratio,
  tempC,
  preheat,
  notes,
  ingredients,
  onNext,
  onBack,
}: StepWaterAndLeafProps) {
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
  const normalizedIngredients = useMemo(() => normalizeIngredients(ingredients), [ingredients]);

  const buildTeaAmountDisplay = useCallback(
    (fraction: number) => {
      const safeFraction = Number.isFinite(fraction) ? Math.max(0, fraction) : 0;
      const gramsValue =
        scaled.grams != null ? round(scaled.grams * safeFraction, safeFraction >= 1 ? 1 : 2) : null;
      const teaspoonsValue =
        scaled.teaspoons != null ? round(scaled.teaspoons * safeFraction, 1) : null;
      const tablespoonsValue =
        scaled.tablespoons != null ? round(scaled.tablespoons * safeFraction, 2) : null;

      const gramsText = formatNumber(gramsValue, ' g');
      const spoonHints: string[] = [];
      if (teaspoonsValue != null) {
        spoonHints.push(`${teaspoonsValue} tk`);
      }
      if (tablespoonsValue != null) {
        spoonHints.push(`${tablespoonsValue} ek`);
      }
      const spoonText = spoonHints.length ? spoonHints.join(' · ') : null;
      const primaryTeaAmount = unitMode === 'spoons' ? spoonText ?? gramsText ?? '–' : gramsText ?? spoonText ?? '–';
      const teaHints = unitMode === 'spoons' ? (gramsText ? [gramsText] : []) : spoonHints;
      const alternateTeaDisplay = unitMode === 'spoons' ? gramsText : spoonText;

      return { primaryTeaAmount, teaHints, alternateTeaDisplay, gramsText, spoonText };
    },
    [scaled.grams, scaled.tablespoons, scaled.teaspoons, unitMode],
  );

  const totalTeaDisplay = buildTeaAmountDisplay(1);
  const { primaryTeaAmount, teaHints, gramsText, spoonText } = totalTeaDisplay;
  const canUseGrams = gramsText != null;
  const canUseSpoons = spoonText != null;
  const showUnitToggle = canUseGrams && canUseSpoons;
  
  const ingredientDisplays = useMemo(
    () =>
      normalizedIngredients.map((item, index) => {
        const fraction = item.rate / 100;
        const { primaryTeaAmount: ingredientPrimary, alternateTeaDisplay: ingredientAlternate } =
          buildTeaAmountDisplay(fraction);
        const percentValue = Number.isFinite(item.rate) ? Math.max(0, Math.min(item.rate, 100)) : null;
        return {
          key: `${item.name}-${index}`,
          name: item.name,
          percent: formatPercent(item.rate),
          percentValue,
          color: getIngredientColor(item.name),
          primary: ingredientPrimary,
          alternate:
            ingredientAlternate && ingredientAlternate !== ingredientPrimary ? ingredientAlternate : null,
        };
      }),
    [buildTeaAmountDisplay, normalizedIngredients],
  );

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
            {ingredientDisplays.length ? (
              ingredientDisplays.map((item) => (
                <div className={styles.ingredientsRow} key={item.key}>
                  <div className={styles.ingredientsDetails}>
                    <div className={styles.ingredientsLabelGroup}>
                      <span className={styles.ingredientsLabel}>{item.name}</span>
                      {item.percent ? <span className={styles.ingredientsPercent}>{item.percent}</span> : null}
                    </div>
                    <span className={styles.ingredientsValue}>
                      {item.primary}
                      {item.alternate ? <span className={styles.ingredientsAlt}>({item.alternate})</span> : null}
                    </span>
                  </div>
                  {item.percentValue != null ? (
                    <div className={styles.ingredientsChart} aria-hidden="true">
                      <div
                        className={styles.ingredientsChartFill}
                        style={{ width: `${item.percentValue}%`, backgroundColor: item.color }}
                      />
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className={styles.ingredientsEmpty}>A profil nem tartalmaz részletezett hozzávalókat.</div>
            )}
          </div>
        </div>

        {preheat ? (
          <div className={styles.preheatNotice}>A profil előmelegített eszközt javasol – melegítsd át a kannát vagy a csészét.</div>
        ) : null}

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