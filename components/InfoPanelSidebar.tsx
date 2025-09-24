import { PanelKey } from './TeaCard';
import styles from '../styles/InfoPanelSidebar.module.css';

interface Props {
  panel: PanelKey;
  onChange: (p: PanelKey) => void;
}

const PANELS: { key: PanelKey; icon: string; label: string }[] = [
  { key: 'category', icon: '/icons/icon_category.svg', label: 'Kategória' },
  { key: 'timing', icon: '/icons/icon_timing.svg', label: 'Időzítés' },
  { key: 'prep', icon: '/icons/icon_prep.svg', label: 'Elkészítés' },
  { key: 'consumption', icon: '/icons/icon_taste.svg', label: 'Fogyasztás' },
];

export default function InfoPanelSidebar({ panel, onChange }: Props) {
  return (
    <div className={styles.container}>
      {PANELS.map((p) => {
        const active = panel === p.key;
        return (
          <button
            key={p.key}
            type="button"
            className={[styles.button, active ? styles.active : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(p.key)}
            aria-pressed={active}
          >
            <span className={styles.label}>{p.label}</span>
            <img src={p.icon} alt="" className={styles.icon} />
          </button>
        );
      })}
    </div>
  );
}