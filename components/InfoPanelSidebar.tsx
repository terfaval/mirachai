import { useState } from 'react';
import { PanelKey } from './TeaCard';

interface Props {
  panel: PanelKey;
  onChange: (p: PanelKey) => void;
}

const PANELS: { key: PanelKey; icon: string; label: string }[] = [
  { key: 'category', icon: '/icon_category.svg', label: 'Kategória' },
  { key: 'timing', icon: '/icon_timing.svg', label: 'Időzítés' },
  { key: 'prep', icon: '/icon_prep.svg', label: 'Elkészítés' },
  { key: 'consumption', icon: '/icon_taste.svg', label: 'Fogyasztás' },
];

export default function InfoPanelSidebar({ panel, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        position: 'absolute',
        left: '-50px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        aria-label="Info"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <img src="/icon_info.svg" alt="info" style={{ width: 24, height: 24 }} />
      </button>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem', gap: '0.5rem' }}>
          {PANELS.map((p) => (
            <button
              key={p.key}
              onClick={() => { onChange(p.key); setOpen(false); }}
              aria-label={p.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontWeight: 'bold',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: panel === p.key ? 1 : 0.7,
              }}
            >
              <img src={p.icon} alt="" style={{ width: 24, height: 24 }} />
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}