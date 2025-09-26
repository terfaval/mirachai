import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/BrewJourney.module.css';
import { parseRatio, scaleByVolume, type ParsedRatio } from '@/lib/brew.ratio';

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
  const noteList = useMemo(() => normalizeNotes(notes), [notes]);

  const strengthEnabled = parsedRatio.kind === 'range' || parsedRatio.kind === 'parts';
  const ratioDescription = parsedRatio.raw;

  const gramsText = formatNumber(scaled.grams, ' g');
  const tspText = scaled.teaspoons != null ? `${scaled.teaspoons} tk` : null;
  const tbspText = scaled.tablespoons != null ? `${scaled.tablespoons} ek` : null;
  const hasNumericRatio = scaled.grams != null;

  return (
    <div className={styles.stepWrapper}>
      <header className={styles.stepHeader}>
        <span className={styles.stepBadge}>4 / 6</span>
        <h3 className={styles.stepTitle}>Víz és levél arány</h3>
        <p className={styles.stepLead}>
          A tea profiljának arányai alapján kiszámoltuk, mennyi levelet érdemes használni ehhez a mennyiséghez.
        </p>
      </header>

      <div className={styles.waterLeafPanel} tabIndex={-1} ref={focusRef}>
        <div className={styles.waterLeafAmounts}>
          <div className={styles.amountBlock}>
            <span className={styles.amountLabel}>Tea levél</span>
            {gramsText ? <span className={styles.amountValue}>{gramsText}</span> : <span className={styles.amountValue}>–</span>}
            <div className={styles.amountHints}>
              {tspText ? <span>{tspText}</span> : null}
              {tbspText ? <span>{tbspText}</span> : null}
            </div>
          </div>
          <div className={styles.amountBlock}>
            <span className={styles.amountLabel}>Víz</span>
            <span className={styles.amountValue}>{volumeMl} ml</span>
            {typeof tempC === 'number' ? (
              <span className={styles.tempBadge}>{tempC}°C</span>
            ) : null}
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
    </div>
  );
}