import { useEffect, useRef } from 'react';
import styles from '@/styles/BrewJourney.module.css';

export type GearInfo = {
  gear: string[];
  filterRequired: boolean;
  allowNoFilter: boolean;
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

  return (
    <div className={styles.stepWrapper}>
      <header className={styles.stepHeader}>
        <span className={styles.stepBadge}>3 / 6</span>
        <h3 className={styles.stepTitle}>Ellenőrizd a felszerelést</h3>
        <p className={styles.stepLead}>
          A profil alapján ezekre az eszközökre lesz szükség. Készítsd elő őket, hogy a főzés közben ne kelljen keresgélni.
        </p>
      </header>

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

      <div className={styles.filterNotice} data-state={filterRequired ? 'required' : allowNoFilter ? 'optional' : 'suggested'}>
        <h4>Szűrő használata</h4>
        {filterRequired ? (
          <p>Ehhez a recepthez kötelező a szűrő. Nélküle a tea túl zavaros vagy erős lenne.</p>
        ) : allowNoFilter ? (
          <p>Használhatsz szűrőt, de ha szeretnéd, elhagyható – a profil engedi a direkt kiöntést.</p>
        ) : (
          <p>Javasolt a szűrő használata a tiszta csészéhez, de szükség esetén megpróbálhatod nélküle is.</p>
        )}
      </div>

      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Vissza
        </button>
        <button type="button" className={styles.primaryButton} onClick={onNext} ref={nextRef}>
          Jöhet a víz és a levél
        </button>
      </footer>
    </div>
  );
}