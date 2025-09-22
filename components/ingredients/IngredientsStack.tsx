// IngredientsStack.tsx

import React from "react";
import { Ingredient } from "../../src/types/tea";
import { getIngredientColor } from "../../utils/colorMap";

type Orientation = 'horizontal' | 'vertical';

interface Props {
  ingredients: Ingredient[];
  orientation?: Orientation;
}

export default function IngredientsStack({
  ingredients,
  orientation = 'horizontal',
}: Props) {
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
  
  const adjustColor = (hex?: string, amt = 0) => {
    if (!hex || !/^#/.test(hex)) return hex ?? "";
    const c = hex.slice(1);
    const n = c.length === 3 ? c.split("").map((ch) => ch + ch).join("") : c;
    const r = Math.max(0, Math.min(255, parseInt(n.slice(0, 2), 16) + amt));
    const g = Math.max(0, Math.min(255, parseInt(n.slice(2, 4), 16) + amt));
    const b = Math.max(0, Math.min(255, parseInt(n.slice(4, 6), 16) + amt));
    return `#${[r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")}`;
  };

  const gradientBg = (hex?: string, alpha?: number) => {
    if (!hex || !/^#/.test(hex)) return hex ?? "";
    const light = adjustColor(hex, 20);
    const dark = adjustColor(hex, -30);
    const start = alpha !== undefined ? alphaBg(light, alpha) : light;
    const end = alpha !== undefined ? alphaBg(dark, alpha) : dark;
    return `radial-gradient(-90deg, ${start}, ${end})`;
  };

  const labelNodes = slices.map((s, idx) => (
    <div
      key={`label-${s.name}-${idx}`}
      className={
        orientation === 'vertical'
          ? 'leading-tight rounded-md p-2 text-left'
          : 'text-center leading-tight rounded-md p-1'
      }
      style={{
        backgroundColor: alphaBg(s.color, 0.6),
        background: gradientBg(s.color, 0.6),
        color: textColorFor(s.color),
      }}
    >
      <div className="font-semibold text-base md:text-lg">
        {Math.round(s.ratePct)}%
      </div>
      <div className="text-xs md:text-sm opacity-90">{s.name}</div>
    </div>
  ));

  if (orientation === 'vertical') {
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'stretch',
          gap: 16,
          width: '100%',
          height: '100%',
        }}
      >
        <div
          role="img"
          aria-label="Hozzávalók aránya (összesen 100%)"
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 120px',
            maxWidth: '160px',
            width: '100%',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#e5e7eb',
          }}
        >
          {slices.map((s, idx) => (
            <div
              key={`${s.name}-${idx}`}
              style={{
                flexGrow: s.ratePct,
                flexBasis: 0,
                backgroundColor: s.color,
                background: gradientBg(s.color),
                minHeight: 6,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            gap: 12,
            justifyContent: 'center',
          }}
        >
          {labelNodes}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center w-full h-full">
      <div
        className="flex w-full h-16 overflow-hidden bg-gray-200 rounded-l-xl rounded-r-xl"
        role="img"
        aria-label="Hozzávalók aránya (összesen 100%)"
      >
        {slices.map((s, idx) => (
          <div
            key={s.name + idx}
            className="relative h-full"
            style={{
              width: `${s.ratePct}%`,
              backgroundColor: s.color,
              background: gradientBg(s.color),
            }}
          />
        ))}
      </div>

      <div
        className="grid mt-4 gap-3"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          alignItems: 'stretch',
        }}
      >
        {labelNodes}
      </div>
    </div>
  );
}