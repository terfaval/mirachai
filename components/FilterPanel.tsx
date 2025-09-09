import styles from '../styles/FilterPanel.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
}

interface Option {
  key: string;
  label: string;
  icon: string;
}

const OPTIONS: Option[] = [
  { key: 'category', label: 'Kategória', icon: '/icon_category.svg' },
  { key: 'ingredients', label: 'Hozzávalók', icon: '/icon_prep.svg' },
  { key: 'taste', label: 'Íz', icon: '/icon_taste.svg' },
  { key: 'focus', label: 'Fókusz', icon: '/icon_info.svg' },
  { key: 'intensity', label: 'Intenzitás', icon: '/icon_timing.svg' },
  { key: 'steepMin', label: 'SteepMin', icon: '/icon_timing.svg' },
  { key: 'caffeine', label: 'Koffein', icon: '/icon_info.svg' },
  { key: 'allergens', label: 'Allergének', icon: '/icon_info.svg' },
  { key: 'seasons', label: 'Évszakok', icon: '/icon_timing.svg' },
  { key: 'dayparts', label: 'Napszakok', icon: '/icon_timing.svg' },
  { key: 'temperature', label: 'Fogyasztási hőmérséklet', icon: '/icon_taste.svg' },
];

export default function FilterPanel({ open, onClose, onSelect }: Props) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        {OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={styles.option}
            onClick={() => onSelect(opt.key)}
          >
            {opt.label}
            <img src={opt.icon} alt="" 
            style={{
            width: 24,
            height: 24,
            filter:
              'brightness(0) invert(1) drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25))',
          }}/>
          </button>
        ))}
      </div>
    </div>
  );
}