
import { useEffect, useRef } from 'react';
import styles from '@/styles/BrewJourney.module.css';

type StepFinishProps = {
  teaName: string;
  methodLabel: string;
  finishMessage?: string | null;
  notes?: Array<string | null | undefined> | string | null;
  onRestart: () => void;
  onClose: () => void;
};

function normalizeNotes(value: StepFinishProps['notes']): string[] {
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

export default function StepFinish({
  teaName,
  methodLabel,
  finishMessage,
  notes,
  onRestart,
  onClose,
}: StepFinishProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const normalizedNotes = normalizeNotes(notes);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className={styles.stepWrapper}>
      <header className={styles.stepHeader}>
        <span className={styles.stepBadge}>6 / 6</span>
        <h3 className={styles.stepTitle}>Készen van a {teaName}!</h3>
        <p className={styles.stepLead}>
          Gratulálunk, végigmentél a {methodLabel.toLowerCase()} lépésein. Szűrd le, tálald és élvezd a teát.
        </p>
      </header>

      <div className={styles.finishPanel}>
        {finishMessage ? <p className={styles.finishMessage}>{finishMessage}</p> : null}
        {normalizedNotes.length ? (
          <div className={styles.noteBox}>
            <h4>Tálalási tippek</h4>
            <ul>
              {normalizedNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <footer className={styles.finishFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onRestart}>
          Újra főzöm
        </button>
        <button type="button" className={styles.primaryButton} onClick={onClose} ref={buttonRef}>
          Vissza a teához
        </button>
      </footer>
    </div>
  );
}