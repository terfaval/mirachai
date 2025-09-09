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
  const [hovered, setHovered] = useState<PanelKey | null>(null);
  return (
    <div
      style={{
        position: 'absolute',
        left: '-50px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      <button
        aria-label="Info"
        style={{ background: 'none', border: 'none', cursor: 'default' }}
      >
        <img src="/icon_info.svg" alt="info" style={{ width: 24, height: 24 }} />
      </button>
      {PANELS.map((p) => {
        const active = panel === p.key;
        const isHovered = hovered === p.key;
        const scale = active || isHovered ? 1.1 : 1;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            onMouseEnter={() => setHovered(p.key)}
            onMouseLeave={() => setHovered(null)}
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
              opacity: active ? 1 : 0.7,
            }}
          >
            {p.label}
            <img
              src={p.icon}
              alt=""
              style={{
                width: 32,
                height: 32,
                transition: 'transform 0.2s',
                transform: `scale(${scale})`,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}