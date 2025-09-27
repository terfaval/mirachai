import { ChangeEvent, FormEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import styles from '@/styles/BrewJourney.module.css';
import { useStepFooter } from '../BrewJourney';

type StepVolumeProps = {
  defaultVolume: number | null;
  onSubmit: (volumeMl: number) => void;
  onBack: () => void;
};

const PRESET_VOLUMES = [250, 300, 350, 400, 500, 750, 1000];

const clampVolume = (value: number | null | undefined): number => {
  if (value == null || Number.isNaN(value)) {
    return PRESET_VOLUMES[0];
  }
  return Math.min(2000, Math.max(30, value));
};

export default function StepVolume({ defaultVolume, onSubmit, onBack }: StepVolumeProps) {
  const [volume, setVolume] = useState<number>(clampVolume(defaultVolume));
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formId = useId();

  useEffect(() => {
    setVolume(clampVolume(defaultVolume));
  }, [defaultVolume]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const formattedPresets = useMemo(() => PRESET_VOLUMES.map((value) => ({ value, label: `${value} ml` })), []);

  const isValid = Number.isFinite(volume) && volume >= 30 && volume <= 2000;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!isValid) {
      return;
    }
    onSubmit(volume);
  };

  const handlePresetClick = useCallback(
    (value: number) => {
      const clamped = clampVolume(value);
      setVolume(clamped);
      if (clamped >= 30 && clamped <= 2000) {
        onSubmit(clamped);
      }
    },
    [onSubmit],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(event.target.value, 10);
    if (Number.isNaN(parsed)) {
      setVolume(Number.NaN);
      return;
    }
    setVolume(parsed);
  };

  const footer = useMemo(
    () => (
      <footer className={styles.stepFooter}>
        <button type="button" className={styles.secondaryButton} onClick={onBack}>
          Vissza
        </button>
        <button type="submit" form={formId} className={styles.primaryButton} disabled={!isValid}>
          Tovább a felszereléshez
        </button>
      </footer>
    ),
    [formId, isValid, onBack],
  );

  useStepFooter(footer);

  return (
    <form className={styles.stepWrapper} onSubmit={handleSubmit} id={formId}>
      <div className={styles.volumeGrid}>
        {formattedPresets.map((preset) => {
          const isSelected = preset.value === volume;
          return (
            <button
              key={preset.value}
              type="button"
              className={styles.volumeButton}
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => handlePresetClick(preset.value)}
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
          min={30}
          max={2000}
          step={10}
          className={styles.volumeInput}
          value={Number.isNaN(volume) ? '' : volume}
          onChange={handleInputChange}
          inputMode="numeric"
          required
        />
        <span className={styles.volumeSuffix}>ml</span>
      </div>
    </form>
  );
}