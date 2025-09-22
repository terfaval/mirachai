import React from 'react';
import { getTeaServeModes, SERVE_MODE_DEFINITIONS, SERVE_MODE_ORDER } from '@/utils/serveModes';
import type { Tea } from '@/types/tea';

interface Props {
  tea: Tea;
}

export default function ServeModes({ tea }: Props) {
  const serveModes = getTeaServeModes(tea);
  const active = new Set(serveModes.map((mode) => mode.id));

  return (
    <div className="flex justify-center" aria-label="fogyasztási módok">
      <div className="grid grid-cols-4 gap-4">
        {SERVE_MODE_ORDER.map((modeKey) => {
          const meta = SERVE_MODE_DEFINITIONS[modeKey];
          const isActive = active.has(modeKey);
          return (
            <div
              key={modeKey}
              className="relative flex items-center justify-center text-center aspect-[6/4]"
            >
              {isActive && (
                <>
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundColor: meta.color,
                      mask: `url(${meta.icon}) no-repeat center / 100%`,
                      WebkitMask: `url(${meta.icon}) no-repeat center / 100%`,
                    }}
                  />
                  <span className="relative font-bold" style={{ color: meta.color }}>
                    {meta.label}
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