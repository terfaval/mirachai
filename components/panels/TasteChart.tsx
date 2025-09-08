import React from 'react';
import { Scale1to3 } from '../../src/types/tea';

interface Props {
  taste: Record<string, Scale1to3>;
}

export default function TasteChart({ taste }: Props) {
  const entries = Object.entries(taste);
  return (
    <div className="space-y-2" role="img" aria-label="ízprofil">
      {entries.map(([label, value]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="flex-1 text-sm">{label}</span>
          <div className="flex gap-1" aria-label={`${label} ${value} / 3`}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-3 h-3 rounded-full border ${
                  i <= value ? 'bg-black border-black' : 'border-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}