import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/BrewJourney.module.css';

type StepVolumeProps = {
  defaultVolume: number | null;
  onSubmit: (volumeMl: number) => void;
  onBack: () => void;
};

const PRESET_VOLUMES = [250, 300, 350, 400, 500, 750, 1000];

export default function StepVolume({ defaultVolume, onSubmit, onBack }: StepVolumeProps) {
  const [volume, setVolume] = useState<number>(defaultVolume ?? PRESET_VOLUMES[0]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setVolume(defaultVolume ?? PRESET_VOLUMES[0]);
  }, [defaultVolume]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const formattedPresets = useMemo(() => PRESET_VOLUMES.map((value) => ({ value, label: `${value} ml` })), []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!volume || Number.isNaN(volume) || volume <= 0) {
      return;
    }
    onSubmit(volume);
  };

  return (
    <form className={styles.stepWrapper} onSubmit={handleSubmit}>
      <header className={styles.stepHeader}>
        <span className={styles.stepBadge}>2 / 6</span>
        <h3 className={styles.stepTitle}>Mekkora adagot főznél?</h3>
        <p className={styles.stepLead}>
          A Mirāchai a teljes főzést ehhez a mennyiséghez igazítja. Később bármikor visszaléphetsz és módosíthatod.
        </p>
      </header>

      <div className={styles.volumeGrid}>
        {formattedPresets.map((preset) => {
          const isSelected = preset.value === volume;
          return (
            <button
              key={preset.value}
              type="button"
              className={styles.volumeButton}
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => setVolume(preset.value)}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className={styles.volumeCustom}> vagy add meg kézzel </div>

      <div className={styles.volumeInputRow}>
        <label htmlFor="brew-volume" className={styles.hiddenLabel}>
          Mennyiség milliliterben
        </label>
        <input
          id="brew-volume"
          ref={inputRef}
          type="number"
          min={50}
          step={25}
          className={styles.volumeInput}
          value={Number.isNaN(volume) ? '' : volume}
          onChange={(event) => setVolume(Number.parseInt(event.target.value, 10))}
          inputMode="numeric"
          required
        />
        <span className={styles.volumeSuffix}>ml</span>
      </div>

      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Vissza
        </button>
        <button type="submit" className={styles.primaryButton}>
          Tovább a felszereléshez
        </button>
      </footer>
    </form>
  );
}