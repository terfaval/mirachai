import { useEffect, useMemo, useRef } from 'react';
import { getBrewMethodsForTea, type BrewMethodSummary } from '@/utils/brewMethods';
import styles from '@/styles/BrewJourney.module.css';
import type { Tea } from '@/utils/filter';
import { useStepFooter } from '../BrewJourney';

type StepMethodProps = {
  tea: Tea;
  selectedMethodId: string | null;
  onSelect: (methodId: string) => void;
  onNext: (methodId: string) => void;
  onBack: () => void;
};

export default function StepMethod({ tea, selectedMethodId, onSelect, onNext, onBack }: StepMethodProps) {
  const methods = useMemo<BrewMethodSummary[]>(() => getBrewMethodsForTea(tea), [tea]);
  const firstButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (firstButtonRef.current) {
      firstButtonRef.current.focus();
    }
  }, []);

  const footer = useMemo(
    () => (
      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Vissza
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            if (selectedMethodId) {
              onNext(selectedMethodId);
            }
          }}
          disabled={!selectedMethodId}
        >
          Tovább a lépésekhez
        </button>
      </footer>
    ),
    [onBack, onNext, selectedMethodId],
  );

  useStepFooter(footer);

  return (
    <div className={styles.stepWrapper}>
      <div className={styles.methodGrid}>
        {methods.map((method, index) => {
          const isSelected = method.id === selectedMethodId;
          return (
            <button
              key={method.id}
              type="button"
              ref={index === 0 ? firstButtonRef : undefined}
              className={styles.methodCard}
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => onSelect(method.id)}
            >
              <div className={styles.methodCardContent}>
                <div className={styles.methodCardHeader}>
                  {method.icon ? <img src={method.icon} alt="" className={styles.methodIcon} /> : null}
                  <div>
                    <span className={styles.methodLabel}>{method.name}</span>
                    {method.oneLiner ? <p className={styles.methodOneLiner}>{method.oneLiner}</p> : null}
                  </div>
                </div>
                {method.description && !method.oneLiner ? (
                  <p className={styles.methodDescription}>{method.description}</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}