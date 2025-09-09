import { PanelKey } from './TeaCard';

interface Props {
  panel: PanelKey;
  onChange: (p: PanelKey) => void;
}

const PANELS: { key: PanelKey; symbol: string; label: string }[] = [
  { key: 'timing', symbol: '⏰', label: 'Időzítés' },
  { key: 'category', symbol: '📚', label: 'Kategória' },
  { key: 'prep', symbol: '⚙️', label: 'Elkészítés' },
  { key: 'consumption', symbol: '🍵', label: 'Fogyasztás' },
];

export default function InfoPanelSidebar({ panel, onChange }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 1000,
      }}
    >
      {PANELS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          aria-label={p.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            border: '2px solid #000',
            backgroundColor: panel === p.key ? '#000' : 'white',
            color: panel === p.key ? 'white' : '#000',
            borderRadius: '4px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span aria-hidden>{p.symbol}</span>
          {p.label}
        </button>
      ))}
    </div>
  );
}