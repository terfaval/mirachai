import { useEffect, useMemo, useRef } from 'react';
import clsx from 'clsx';
import styles from '@/styles/BrewJourney.module.css';
import { useStepFooter } from '../BrewJourney';
import { getEquipmentIcon } from '@/utils/equipment';
import { normalizeInstructionSteps } from '../normalizeSteps';

export type GearInfo = {
  gear: string[];
  filterRequired: boolean;
  allowNoFilter: boolean;
  hasProfile: boolean;
};

type StepGearFilterProps = {
  info: GearInfo;
  methodTitle: string;
  methodDescription?: string | null;
  steps: string[];
  onNext: () => void;
  onBack: () => void;
};

export default function StepGearFilter({ info, methodTitle, methodDescription, steps, onNext, onBack }: StepGearFilterProps) {
  const { gear, filterRequired, allowNoFilter } = info;
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const description = useMemo(() => methodDescription?.trim() ?? null, [methodDescription]);
  const instructions = useMemo(() => normalizeInstructionSteps(steps), [steps]);

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
          <ul className={styles.gearGrid}>
            {gear.map((item) => {
              const iconSrc = getEquipmentIcon(item);
              return (
                <li key={item} className={clsx(styles.volumeTile, styles.gearCard)}>
                  {iconSrc ? <img src={iconSrc} alt="" className={styles.gearIcon} /> : null}
                  <span className={styles.gearName}>{item}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.gearFallback}>Ehhez a módszerhez nincs megadott extra eszköz.</p>
        )}
      </div>

      <div className={styles.instructionsPanel}>
        <header className={styles.instructionsHeader}>
          <h3>{methodTitle}</h3>
          {description ? <p className={styles.instructionsIntro}>{description}</p> : null}
        </header>
        {instructions.length ? (
          <ol className={styles.instructionsList}>
            {instructions.map((step, index) => (
              <li key={index} className={styles.instructionsListItem}>
                {step}
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.instructionsFallback}>
            Ehhez a módszerhez jelenleg nincs részletes leírásunk – folytasd a víz és a levél beállításával.
          </p>
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