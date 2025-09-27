import { useEffect, useMemo, useRef } from 'react';
import styles from '@/styles/BrewJourney.module.css';
import { useStepFooter } from '../BrewJourney';

type StepInstructionsProps = {
  methodTitle: string;
  description?: string | null;
  steps: string[];
  onNext: () => void;
  onBack: () => void;
};

function normalizeSteps(steps: string[]): string[] {
  return steps
    .map((step) => step.trim())
    .filter((step) => step.length > 0)
    .map((step) => step.replace(/\s+/g, ' '))
    .map((step) => step.replace(/^\d+[.)]\s*/, ''))
    .map((step) => step.replace(/^[•*-]\s*/, ''));
}

export default function StepInstructions({ methodTitle, description, steps, onNext, onBack }: StepInstructionsProps) {
  const list = useMemo(() => normalizeSteps(steps), [steps]);
  const focusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    focusRef.current?.focus();
  }, [list]);

  const footer = useMemo(
    () => (
      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Vissza
        </button>
        <button type="button" className={styles.primaryButton} onClick={onNext}>
          Tovább a mennyiséghez
        </button>
      </footer>
    ),
    [onBack, onNext],
  );

  useStepFooter(footer);

  return (
    <div className={styles.stepWrapper}>
      <div className={styles.instructionsPanel} tabIndex={-1} ref={focusRef}>
        <header className={styles.instructionsHeader}>
          <h3>{methodTitle}</h3>
          {description ? <p className={styles.instructionsIntro}>{description}</p> : null}
        </header>
        {list.length ? (
          <ol className={styles.instructionsList}>
            {list.map((step, index) => (
              <li key={index} className={styles.instructionsListItem}>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.instructionsFallback}>
            Ehhez a módszerhez jelenleg nincs részletes leírásunk – folytasd a mennyiséggel.
          </p>
        )}
      </div>
    </div>
  );
}