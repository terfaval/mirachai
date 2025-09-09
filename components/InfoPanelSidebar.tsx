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
        left: '-150px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem',
        marginLeft: '-10px',
      }}
    >
    
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
              justifyContent: 'flex-end',
              gap: '0.5rem',
              color: 'white',
              fontWeight: 'bold',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: active ? 1 : 1,
              width: '100%',
            }}
          >
            {p.label}
            <img
              src={p.icon}
              alt=""
              style={{
                width: 40,
                height: 40,
                transition: 'transform 0.2s',
                transform: `scale(${scale})`,
                filter:
              'brightness(0) invert(1) drop-shadow(0 4px 4px rgba(0, 0, 0, 0.80))',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}