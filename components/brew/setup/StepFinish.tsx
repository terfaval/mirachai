
import { useEffect, useRef } from 'react';
import styles from '@/styles/BrewJourney.module.css';

type StepFinishProps = {
  teaName: string;
  methodLabel: string;
  finishMessage?: string | null;
  notes?: Array<string | null | undefined> | string | null;
  onReview: () => void;
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
  onReview,
  onClose,
}: StepFinishProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const normalizedNotes = normalizeNotes(notes);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  return (
    <div className={styles.stepWrapper}>

      <div className={styles.finishPanel}>
        <div className={styles.finishIntroBlock}>
          <h3 className={styles.finishHeading}>Készen van a {teaName}!</h3>
          <p className={styles.finishIntro}>
            Gratulálunk, végigmentél a {methodLabel.toLowerCase()} lépésein. Szűrd le, tálald és élvezd a teát.
          </p>
        </div>
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
        <button type="button" className={styles.secondaryButton} onClick={onReview}>
          Értékelem
        </button>
        <button type="button" className={styles.primaryButton} onClick={onClose} ref={buttonRef}>
          Vissza a teához
        </button>
      </footer>
    </div>
  );
}