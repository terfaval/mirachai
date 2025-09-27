import { FormEvent, useMemo, useState } from 'react';
import styles from '@/styles/ReviewForm.module.css';

export type ReviewFormSubmission = {
  brewRating: number;
  teaRating: number;
  wouldRecommend: 'yes' | 'no' | 'maybe';
  notes: string;
};

interface ReviewFormProps {
  teaName: string;
  methodLabel: string;
  onSubmit: (submission: ReviewFormSubmission) => void;
  onCancel: () => void;
}

const ratingValues = [1, 2, 3, 4, 5];

export default function ReviewForm({ teaName, methodLabel, onSubmit, onCancel }: ReviewFormProps) {
  const [brewRating, setBrewRating] = useState<number | null>(null);
  const [teaRating, setTeaRating] = useState<number | null>(null);
  const [wouldRecommend, setWouldRecommend] = useState<'yes' | 'no' | 'maybe' | null>(null);
  const [notes, setNotes] = useState('');

  const isSubmitDisabled = useMemo(() => {
    return brewRating == null || teaRating == null || wouldRecommend == null;
  }, [brewRating, teaRating, wouldRecommend]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (brewRating == null || teaRating == null || wouldRecommend == null) {
      return;
    }
    onSubmit({
      brewRating,
      teaRating,
      wouldRecommend,
      notes: notes.trim(),
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Mennyire volt hasznos az útmutató?</legend>
        <div className={styles.radioRow}>
          {ratingValues.map((value) => (
            <label key={`brew-${value}`} className={styles.radioOption}>
              <input
                type="radio"
                name="brew-rating"
                value={value}
                checked={brewRating === value}
                onChange={() => setBrewRating(value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Milyen volt a {teaName.toLowerCase()} íze?</legend>
        <div className={styles.radioRow}>
          {ratingValues.map((value) => (
            <label key={`tea-${value}`} className={styles.radioOption}>
              <input
                type="radio"
                name="tea-rating"
                value={value}
                checked={teaRating === value}
                onChange={() => setTeaRating(value)}
              />
              <span>{value}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Ajánlanád másoknak?</legend>
        <div className={styles.choiceRow}>
          {(
            [
              { value: 'yes', label: 'Igen' },
              { value: 'maybe', label: 'Talán' },
              { value: 'no', label: 'Nem' },
            ] as const
          ).map((option) => (
            <label key={option.value} className={styles.choiceOption}>
              <input
                type="radio"
                name="recommendation"
                value={option.value}
                checked={wouldRecommend === option.value}
                onChange={() => setWouldRecommend(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={styles.textAreaLabel}>
        Jegyzeteld fel, mit tapasztaltál az elkészítés vagy a tea kapcsán:
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={`${methodLabel} tapasztalatok, illat, ízjegyek...`}
          rows={4}
        />
      </label>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton} onClick={onCancel}>
          Vissza a teához
        </button>
        <button type="submit" className={styles.primaryButton} disabled={isSubmitDisabled}>
          Beküldöm
        </button>
      </div>
    </form>
  );
}