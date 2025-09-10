import React from "react";
import { Ingredient } from "../../src/types/tea";
import { getIngredientColor } from "../../utils/colorMap";

interface Props {
  ingredients: Ingredient[];
  /** ha true, a rate-eket 100%-ra normalizálja */
  normalize?: boolean;
  /** minimum szélesség, ami felett megjelenik a címke (%), pl. 10 = 10% */
  labelThresholdPct?: number;
}

export default function IngredientsStack({
  ingredients,
  normalize = true,
  labelThresholdPct = 10,
}: Props) {
  const safe = Array.isArray(ingredients) ? ingredients : [];

  // csak pozitív és véges rate-eket engedünk
  const total = safe.reduce(
    (s, it) => s + (Number.isFinite(it.rate) && it.rate > 0 ? it.rate : 0),
    0
  );

  // normalizált szeletek [0..100]
  const slices = safe.map((it) => {
    const rate = Number.isFinite(it.rate) && it.rate > 0 ? it.rate : 0;
    return {
      name: it.name,
      pct: normalize && total > 0 ? (rate / total) * 100 : rate,
      color: getIngredientColor(it.name),
    };
  });

  // ha a nyers összege nem 100, arányosan fel/le skálázunk
  const sumPct = slices.reduce((s, it) => s + it.pct, 0);
  const scale = sumPct === 0 ? 0 : 100 / sumPct;
  const scaled = slices.map((it) => ({ ...it, pct: it.pct * scale }));

  // kerekítési hibák megelőzése: utolsó szelet = 100 - előzők
  const withOffsets: Array<{ name: string; color: string; left: number; width: number }> = [];
  let acc = 0;
  for (let i = 0; i < scaled.length; i++) {
    const isLast = i === scaled.length - 1;
    const width = isLast
      ? Math.max(0, 100 - acc)
      : Math.max(0, Math.min(100 - acc, scaled[i].pct));
    withOffsets.push({ name: scaled[i].name, color: scaled[i].color, left: acc, width });
    acc += width;
  }

  return (
    <div
      className="relative w-full h-16 overflow-hidden bg-gray-200 rounded-r-xl"
      aria-label="Hozzávalók aránya (összesen 100%)"
    >
      {/* szeletek */}
      {withOffsets.map((s) => (
        <div
          key={s.name}
          className="absolute top-0 h-full"
          style={{
            left: `${s.left}%`,
            width: `${s.width}%`,
            backgroundColor: s.color,
          }}
        >
          {/* középre igazított címke; csak elég széles szeletnél */}
          {s.width >= labelThresholdPct && (
            <div className="flex h-full items-center justify-center">
              <div className="text-white text-center drop-shadow-sm">
                <div className="text-lg font-bold leading-none">{Math.round(s.width)}%</div>
                <div className="text-xs leading-none">{s.name}</div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}