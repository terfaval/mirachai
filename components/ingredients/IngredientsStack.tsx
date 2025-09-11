import React from "react";
import { Ingredient } from "../../src/types/tea";
import { getIngredientColor } from "../../utils/colorMap";

interface Props {
  ingredients: Ingredient[];
}

export default function IngredientsStack({ ingredients }: Props) {
  const safe = Array.isArray(ingredients) ? ingredients : [];

  // duplikátumok összegzése és csak pozitív, véges rate-ek használata
  const grouped = safe.reduce((map, it) => {
    const rate = Number.isFinite(it.rate) && it.rate > 0 ? it.rate : 0;
    if (rate > 0) {
      map.set(it.name, (map.get(it.name) ?? 0) + rate);
    }
    return map;
  }, new Map<string, number>());

  const slices = Array.from(grouped.entries()).map(([name, rate]) => ({
    name,
    rate,
    color: getIngredientColor(name),
  }));

  return (
    <div
      className="flex w-full h-16 overflow-hidden bg-gray-200 rounded-r-xl"
      role="img"
      aria-label="Hozzávalók aránya (összesen 100%)"
    >
      {slices.map((s) => (
        <div
          key={s.name}
          className="relative h-full"
          style={{ width: `${s.rate}%`, backgroundColor: s.color }}
        >
          <div className="absolute bottom-0 left-0 p-1 text-white drop-shadow-sm whitespace-nowrap">
            <div className="text-lg font-bold leading-none">{s.rate}%</div>
            <div className="text-sm leading-none">{s.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}