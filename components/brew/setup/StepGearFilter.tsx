import { useEffect, useMemo, useRef } from 'react';
import styles from '@/styles/BrewJourney.module.css';
import { useStepFooter } from '../BrewJourney';

export type GearInfo = {
  gear: string[];
  filterRequired: boolean;
  allowNoFilter: boolean;
  hasProfile: boolean;
};

type StepGearFilterProps = {
  info: GearInfo;
  onNext: () => void;
  onBack: () => void;
};

export default function StepGearFilter({ info, onNext, onBack }: StepGearFilterProps) {
  const { gear, filterRequired, allowNoFilter } = info;
  const nextRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    nextRef.current?.focus();
  }, []);

  const footer = useMemo(
    () => (
      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Vissza
        </button>
        <button type="button" className={styles.primaryButton} onClick={onNext} ref={nextRef}>
          Jöhet a víz és a levél
        </button>
      </footer>
    ),
    [onBack, onNext],
  );

  useStepFooter(footer);

  return (
    <div className={styles.stepWrapper}>
      <div className={styles.gearListWrapper}>
        {gear.length ? (
          <ul className={styles.gearList}>
            {gear.map((item) => (
              <li key={item} className={styles.gearItem}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.gearFallback}>Ehhez a módszerhez nincs megadott extra eszköz.</p>
        )}
      </div>

      <div className={styles.filterNotice} data-state={filterRequired ? 'required' : allowNoFilter ? 'optional' : 'not_needed'}>
        <h4>Szűrő használata</h4>
        {filterRequired ? (
          <p>Ehhez a recepthez kötelező a szűrő. Nélküle a tea túl zavaros vagy erős lenne.</p>
        ) : allowNoFilter ? (
          <p>Használhatsz szűrőt, de ha szeretnéd, elhagyható – a profil engedi a direkt kiöntést.</p>
        ) : (
          <p>Ehhez a módszerhez nincs szükség szűrőre – bátran készítsd el nélküle is.</p>
        )}
      </div>
    </div>
  );
}