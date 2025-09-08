import React from 'react';
import { Tea } from '../src/types/tea';

interface Props {
  tea: Tea;
}

const MODES = [
  { key: 'serve_hot', label: 'Forrón', icon: '🔥' },
  { key: 'serve_lukewarm', label: 'Langyosan', icon: '🌤️' },
  { key: 'serve_iced', label: 'Jegesen', icon: '❄️' },
  { key: 'serve_coldbrew', label: 'Coldbrew', icon: '🧊' },
] as const;

export default function ServeModes({ tea }: Props) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="fogyasztási módok">
      {MODES.filter((m) => (tea as any)[m.key]).map((m) => (
        <span
          key={m.key}
          className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
        >
          <span aria-hidden>{m.icon}</span>
          {m.label}
        </span>
      ))}
    </div>
  );
}