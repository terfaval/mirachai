import React from 'react';
import { Tea } from '../src/types/tea';
import { normalizeServeFlags } from '@/utils/teaTransforms';

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
  const serve = normalizeServeFlags(tea);
  return (
    <div className="flex justify-center" aria-label="fogyasztási módok">
      <div className="grid grid-cols-4 gap-4">
        {MODES.map((m) => {
          const active = serve[m.key.replace('serve_', '') as keyof typeof serve];
          return (
            <div
              key={m.key}
              className="relative flex items-center justify-center text-center aspect-[6/4]"
            >
              {active && (
                <>
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundColor: m.color,
                      mask: `url(${m.svg}) no-repeat center / 100%`,
                      WebkitMask: `url(${m.svg}) no-repeat center / 100%`,
                    }}
                  />
                  <span className="relative font-bold" style={{ color: m.color }}>
                    {m.label}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}