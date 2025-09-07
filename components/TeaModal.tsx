import styles from '../styles/TeaModal.module.css';
import { Tea } from '../utils/filter';
import { getCategoryColor } from '../utils/colorMap';

interface Props {
  tea: Tea;
  onClose: () => void;
}

export default function TeaModal({ tea, onClose }: Props) {
  const color = getCategoryColor(tea.category);
  const light = getCategoryColor(tea.category, 'light');
  const ingredients = Array.from({ length: 6 })
    .map((_, i) => (tea as any)[`ingerdient-${i + 1}`])
    .filter(Boolean);

  const tags = ['tag-1', 'tag-2', 'tag-3']
    .map((t) => (tea as any)[t])
    .filter(Boolean);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.panel}
        style={{ backgroundColor: color }}
        onClick={(e) => e.stopPropagation()}
      >
        <img src="/Mandala.svg" alt="" className={styles.mandala} />
        <button className={styles.close} onClick={onClose} aria-label="Bezárás">
          ×
        </button>
        <div className={styles.content} style={{ backgroundColor: light }}>
          <h2>{tea.name}</h2>
          {tea.mood_short && <p>{tea.mood_short}</p>}
          {tea.description && <p>{tea.description}</p>}
          {ingredients.length > 0 && (
            <>
              <h3>Összetevők</h3>
              <ul>
                {ingredients.map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </>
          )}
          {tags.length > 0 && (
            <p>
              {tags.map((t, i) => (
                <span key={t}>
                  {t}
                  {i < tags.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          )}
          {tea.intensity && <p>Erősség: {tea.intensity}</p>}
        </div>
      </div>
    </div>
  );
}