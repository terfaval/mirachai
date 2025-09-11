import React from 'react';
import { Tea } from '../src/types/tea';

interface Props {
  tea: Tea;
}

const MODES = [
  {
    key: 'serve_hot',
    label: 'Forrón',
    svg: '/serve_hot.svg',
    color: '#e11d48',
  },
  {
    key: 'serve_lukewarm',
    label: 'Langyosan',
    svg: '/serve_lukewarm.svg',
    color: '#fb923c',
  },
  {
    key: 'serve_iced',
    label: 'Jegesen',
    svg: '/serve_iced.svg',
    color: '#60a5fa',
  },
  {
    key: 'serve_coldbrew',
    label: 'Coldbrew',
    svg: '/serve_coldbrew.svg',
    color: '#4ade80',
  },
] as const;

export default function ServeModes({ tea }: Props) {
  return (
    <div className="flex gap-4" aria-label="fogyasztási módok">
      {MODES.filter((m) => (tea as any)[m.key]).map((m) => (
        <div
          key={m.key}
          className="relative flex flex-1 items-center justify-center text-center aspect-square"
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-20"
            style={{
              backgroundColor: m.color,
              mask: `url(${m.svg}) no-repeat center / 60%`,
              WebkitMask: `url(${m.svg}) no-repeat center / 60%`,
            }}
          />
          <span className="relative font-bold" style={{ color: m.color }}>
            {m.label}
          </span>
        </div>
      ))}
    </div>
  );
}