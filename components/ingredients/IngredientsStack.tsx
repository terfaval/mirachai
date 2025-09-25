// IngredientsStack.tsx

import React from "react";
import { Ingredient } from "../../src/types/tea";
import { getIngredientColor } from "../../utils/colorMap";

type Orientation = "horizontal" | "vertical";

interface Props {
  ingredients: Ingredient[];
  orientation?: Orientation;
}

export default function IngredientsStack({
  ingredients,
  orientation = "horizontal",
}: Props) {
  const safe = Array.isArray(ingredients)
    ? ingredients.filter((item): item is Ingredient => {
        if (!item) return false;
        const { name, rate } = item as Partial<Ingredient>;
        if (typeof name !== "string" || !name.trim()) return false;
        return Number.isFinite(rate) && (rate as number) > 0;
      })
    : [];

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

  const tooltipClassName = (dir: Orientation) =>
    dir === "vertical"
      ? "pointer-events-none absolute left-full top-1/2 z-20 ml-3 flex -translate-y-1/2 -translate-x-2 transform items-center opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus:translate-x-0 group-focus:opacity-100"
      : "pointer-events-none absolute left-1/2 top-full z-20 mt-3 flex -translate-x-1/2 translate-y-2 transform flex-col items-center opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100";

  const tooltipBody = (slice: Slice) => (
    <div
      className="rounded-md bg-slate-900/90 px-3 py-2 text-xs leading-tight text-white shadow-lg"
      aria-hidden="true"
    >
      <div className="text-sm font-semibold leading-tight">{Math.round(slice.ratePct)}%</div>
      <div className="leading-tight opacity-90">{slice.name}</div>
    </div>
  );

  const buildLabel = (slice: Slice) => `${slice.name}: ${Math.round(slice.ratePct)}%`;
  const radiusValue = 12;

  if (orientation === "vertical") {
    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "stretch",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          role="img"
          aria-label="Hozzávalók aránya (összesen 100%)"
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "0 0 120px",
            maxWidth: "160px",
            width: "100%",
            borderRadius: 12,
            backgroundColor: "#e5e7eb",
            position: "relative",
          }}
        >
          {slices.map((s, idx) => {
            const label = buildLabel(s);
            const radius: React.CSSProperties = {};
            if (idx === 0) {
              radius.borderTopLeftRadius = radiusValue;
              radius.borderTopRightRadius = radiusValue;
            }
            if (idx === slices.length - 1) {
              radius.borderBottomLeftRadius = radiusValue;
              radius.borderBottomRightRadius = radiusValue;
            }

            return (
              <div
                key={`${s.name}-${idx}`}
                className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-400"
                tabIndex={0}
                title={label}
                aria-label={label}
                style={{
                  flexGrow: s.ratePct,
                  flexBasis: 0,
                  backgroundColor: s.color,
                  background: gradientBg(s.color),
                  minHeight: 6,
                  ...radius,
                }}
              >
                <div className={tooltipClassName("vertical")} aria-hidden="true">
                  {tooltipBody(s)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center">
      <div className="relative w-full">
        <div className="h-16 w-full rounded-2xl bg-gray-200" aria-hidden="true" />
        <div
          className="absolute inset-0 flex items-stretch rounded-2xl"
          role="img"
          aria-label="Hozzávalók aránya (összesen 100%)"
        >
          {slices.map((s, idx) => {
            const label = buildLabel(s);
            const radius: React.CSSProperties = {};
            if (idx === 0) {
              radius.borderTopLeftRadius = radiusValue;
              radius.borderBottomLeftRadius = radiusValue;
            }
            if (idx === slices.length - 1) {
              radius.borderTopRightRadius = radiusValue;
              radius.borderBottomRightRadius = radiusValue;
            }

            return (
              <div
                key={`${s.name}-${idx}`}
                className="group relative h-full outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-400"
                tabIndex={0}
                title={label}
                aria-label={label}
                style={{
                  width: `${s.ratePct}%`,
                  backgroundColor: s.color,
                  background: gradientBg(s.color),
                  ...radius,
                }}
              >
                <div className={tooltipClassName("horizontal")} aria-hidden="true">
                  {tooltipBody(s)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
