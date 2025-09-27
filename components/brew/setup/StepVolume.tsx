import { ChangeEvent, FormEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from '@/styles/BrewJourney.module.css';
import { useStepFooter } from '../BrewJourney';

type StepVolumeProps = {
  defaultVolume: number | null;
  onSubmit: (volumeMl: number) => void;
  onBack: () => void;
};

const PRESET_VOLUMES = [
  { value: 200, label: '200 ml', icon: '/teasets/icon_tinycup.svg', description: 'Apró csésze' },
  { value: 300, label: '300 ml', icon: '/teasets/icon_cup.svg', description: 'Csésze' },
  { value: 500, label: '500 ml', icon: '/teasets/icon_mug.svg', description: 'Bögre' },
  { value: 750, label: '750 ml', icon: '/teasets/icon_bottle.svg', description: 'Palack' },
  { value: 1000, label: '1000 ml', icon: '/teasets/icon_jug.svg', description: 'Kancsó' },
];

const PRESET_VOLUME_VALUES = PRESET_VOLUMES.map((option) => option.value);

const clampVolume = (value: number | null | undefined): number => {
  if (value == null || Number.isNaN(value)) {
    return PRESET_VOLUME_VALUES[0];
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

  const presetOptions = useMemo(() => PRESET_VOLUMES, []);

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
        {presetOptions.map((preset) => {
          const isSelected = preset.value === volume;
          return (
            <button
              key={preset.value}
              type="button"
              className={clsx(styles.volumeTile, styles.volumeButton)}
              data-selected={isSelected ? 'true' : undefined}
              onClick={() => handlePresetClick(preset.value)}
            >
              <span className={styles.volumeButtonIcon}>
                <img src={preset.icon} alt="" />
              </span>
              <span className={styles.volumeValue}>{preset.label}</span>
              <span className={styles.volumeDescription}>{preset.description}</span>
            </button>
          );
        })}

        <div className={clsx(styles.volumeTile, styles.volumeCustomCard)}>
          <span className={styles.volumeCustomTitle}>Más mennyiség</span>
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
        </div>
      </div>
    </form>
  );
}