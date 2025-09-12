// IngredientsStack.tsx

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
  const total = Array.from(grouped.values()).reduce((s, v) => s + v, 0) || 1;
  interface Slice {
    name: string;
    ratePct: number;
    color: string;
  }

  const initialSlices: Slice[] = Array.from(grouped.entries()).map(([name, rate]) => ({
    name,
    ratePct: (rate / total) * 100,
    color: getIngredientColor(name),
  }));

  // egyszerű rendezés: próbálja meg elkerülni az azonos színű szomszédokat
  const slices: Slice[] = [];
  const pool = [...initialSlices];
  while (pool.length) {
    const prev = slices[slices.length - 1];
    let idx = pool.findIndex((s) => s.color !== prev?.color);
    if (idx === -1) idx = 0; // ha nincs eltérő szín, vesszük az elsőt
    slices.push(pool.splice(idx, 1)[0]);
  }


  // egyszerű kontrasztos szövegszín (FINOMHANG: küszöböt állíthatod)
  const textColorFor = (hex?: string) => {
    if (!hex || !/^#/.test(hex)) return "#fff";
    const c = hex.slice(1);
    const n = c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c;
    const r = parseInt(n.slice(0, 2), 16);
    const g = parseInt(n.slice(2, 4), 16);
    const b = parseInt(n.slice(4, 6), 16);
    const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.55 ? "#111" : "#fff";
  };

  const alphaBg = (hex?: string, alpha = 0.2) => {
    if (!hex || !/^#/.test(hex)) return hex;
    const c = hex.slice(1);
    const n = c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c;
    const r = parseInt(n.slice(0, 2), 16);
    const g = parseInt(n.slice(2, 4), 16);
    const b = parseInt(n.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  
  return (
    <div className="flex flex-col justify-center w-full h-full">
      {/* Sávdiagram */}
      <div
        className="flex w-full h-16 overflow-hidden bg-gray-200 rounded-l-xl rounded-r-xl"
        role="img"
        aria-label="Hozzávalók aránya (összesen 100%)"
      >
        {slices.map((s, idx) => (
          <div
            key={s.name + idx}
            className="relative h-full"
            style={{ width: `${s.ratePct}%`, backgroundColor: s.color }}
          />
        ))}
      </div>

      {/* Labelek a sáv alatt, egyenlő oszlopokban, középre zárva */}
      <div
        className="grid mt-3 gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.max(slices.length, 1)}, minmax(0, 1fr))` }}
      >
        {slices.map((s, idx) => (
          <div
            key={"label-" + s.name + idx}
            className="text-center leading-tight rounded-md p-1"
            style={{ backgroundColor: alphaBg(s.color, 0.6), color: textColorFor(s.color) }}
          >
            {/* FINOMHANG: % méret/weight itt állítható */}
            <div className="font-semibold text-base md:text-lg">
              {Math.round(s.ratePct)}%
            </div>
            {/* FINOMHANG: név mérete/betűköz, sor-köz itt állítható */}
            <div className="text-xs md:text-sm opacity-90">{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
