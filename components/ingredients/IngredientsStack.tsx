import React from "react";
import { Ingredient } from "../../src/types/tea";
import { getIngredientColor } from "../../utils/colorMap";

interface Props {
  ingredients: Ingredient[];
}

/**
 * Vizuál logika:
 * 1) Felül: vízszintes, arányos, színes sávok (stacked bar), felirat nélkül.
 * 2) Alul: egy 1-soros, N-oszlopos grid (N = szeletek száma), mindegyik cella középre zárt
 *    két soros labellel: 1. sor a % (nagyobb), 2. sor a hozzávaló neve (kisebb).
 *
 * Finomhangolás jelölve: // [TUNE] ...
 */
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

  const slices = Array.from(grouped.entries()).map(([name, rate]) => ({
    name,
    ratePct: (rate / total) * 100,
    // ha az Ingredient-nek van `type` mezője, ide beadhatod második paraméterként:
    color: getIngredientColor(name /*, it.type */), // a colorScale-ből jön a HEX. [forrás] :contentReference[oaicite:2]{index=2}
  }));

  return (
    <figure aria-label="Hozzávalók arányai és címkék" className="w-full">
      {/* Felső: stacked bar */}
      <div
        className="flex w-full h-16 overflow-hidden rounded-r-xl"
        role="img"
        aria-label="Hozzávalók aránya (összesen 100%)"
        // [TUNE] háttérszín a 'hézagok' érzéshez
        style={{ backgroundColor: "#E5E7EB" }} // tailwind bg-gray-200
      >
        {slices.map((s) => (
          <div
            key={s.name}
            className="h-full"
            style={{
              width: `${s.ratePct}%`,
              backgroundColor: s.color,
              // [TUNE] ha szeretnél minimális szelet-szélességet adni:
              minWidth: s.ratePct > 0 ? 0 : 0,
            }}
            aria-label={`${s.name}: ${Math.round(s.ratePct)}%`}
            title={`${s.name}: ${Math.round(s.ratePct)}%`}
          />
        ))}
      </div>

      {/* Alsó: label-sor (egyenlő távolság, középre zárt) */}
      <figcaption
        className="mt-2 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${Math.max(slices.length, 1)}, minmax(0, 1fr))`,
        }}
      >
        {slices.map((s) => (
          <div key={`label-${s.name}`} className="text-center leading-tight">
            {/* [TUNE] %-sor tipó: méret, súly, betűköz, sortáv */}
            <div
              className="font-semibold"
              style={{
                fontSize: 16, // [TUNE] nagyobb szám = nagyobb %-szöveg
                lineHeight: 1.0,
                // [TUNE] színkontraszthoz módosítható, pl. mindig sötét:
                color: "#111827",
              }}
            >
              {Math.round(s.ratePct)}%
            </div>
            {/* [TUNE] név-sor tipó: méret, súly, szín */}
            <div
              className="truncate"
              style={{
                fontSize: 12, // [TUNE] kisebb, mint a fenti sor
                color: "#374151",
              }}
              title={s.name}
            >
              {s.name}
            </div>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
