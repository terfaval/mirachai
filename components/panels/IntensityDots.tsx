import React from 'react';
import { Scale1to3 } from '../../src/types/tea';

interface Props {
  intensity: Scale1to3;
}

const LABELS = ['enyhe', 'közepes', 'erős'];

export default function IntensityDots({ intensity }: Props) {
  return (
    <div className="flex items-center gap-2" aria-label="intenzitás">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full border ${
              i <= intensity ? 'bg-black border-black' : 'border-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm">{LABELS[intensity - 1]}</span>
    </div>
  );
}