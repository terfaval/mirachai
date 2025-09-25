// IngredientsStack.tsx

import React from "react";
import { getIngredientColor } from "../../utils/colorMap";
import type { PerIngredientTk } from "lib/teaScaling";

type Orientation = "horizontal" | "vertical";

interface Props {
  items: PerIngredientTk[];
  orientation?: Orientation;
}

function formatTkLabel(value: number) {
  const normalized = Number(value.toFixed(2));
  return `~${normalized} tk`;
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

const normalize = (items: PerIngredientTk[]): PerIngredientTk[] => {
  const positive = items.filter((item) => Number.isFinite(item.percent) && item.percent > 0);
  if (!positive.length) {
    return items;
  }
  const sum = positive.reduce((total, item) => total + item.percent, 0);
  if (!sum) {
    return positive;
  }
  return positive.map((item) => ({
    ...item,
    percent: (item.percent / sum) * 100,
  }));
};

const reorderForContrast = (items: PerIngredientTk[]): PerIngredientTk[] => {
  const pool = [...items];
  const result: PerIngredientTk[] = [];
  while (pool.length) {
    const prev = result[result.length - 1];
    const prevColor = prev ? getIngredientColor(prev.name) : null;
    let idx = pool.findIndex((item) => getIngredientColor(item.name) !== prevColor);
    if (idx === -1) {
      idx = 0;
    }
    result.push(pool.splice(idx, 1)[0]!);
  }
  return result;
};

export default function IngredientsStack({ items, orientation = "horizontal" }: Props) {
  const normalized = reorderForContrast(normalize(Array.isArray(items) ? items : []));
  if (!normalized.length) {
    return null;
  }

  if (orientation === "vertical") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 16,
            overflow: "hidden",
            background: "#e5e7eb",
          }}
        >
          {normalized.map((item, index) => {
            const color = getIngredientColor(item.name);
            const radius: React.CSSProperties = {};
            if (index === 0) {
              radius.borderTopLeftRadius = 16;
              radius.borderTopRightRadius = 16;
            }
            if (index === normalized.length - 1) {
              radius.borderBottomLeftRadius = 16;
              radius.borderBottomRightRadius = 16;
            }
            const label = formatTkLabel(item.tkRounded);
            return (
              <div
                key={`${item.name}-${index}`}
                style={{
                  flexGrow: item.percent,
                  padding: "12px 16px",
                  position: "relative",
                  background: gradientBg(color),
                  ...radius,
                }}
                aria-label={`${item.name}: ${label}`}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontWeight: 600,
                    background: alphaBg("#ffffff", 0.85),
                    color: "#0f172a",
                    borderRadius: 999,
                    padding: "2px 10px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${normalized.length}, minmax(0,1fr))`,
            gap: 12,
          }}
        >
          {normalized.map((item, index) => (
            <div key={`${item.name}-label-${index}`} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          borderRadius: 24,
          background: "#e5e7eb",
          overflow: "visible",
          minHeight: 64,
        }}
        aria-label="Hozzávalók aránya"
      >
        {normalized.map((item, index) => {
          const color = getIngredientColor(item.name);
          const radius: React.CSSProperties = {};
          if (index === 0) {
            radius.borderTopLeftRadius = 24;
            radius.borderBottomLeftRadius = 24;
          }
          if (index === normalized.length - 1) {
            radius.borderTopRightRadius = 24;
            radius.borderBottomRightRadius = 24;
          }
          const width = `${item.percent}%`;
          const label = formatTkLabel(item.tkRounded);
          return (
            <div
              key={`${item.name}-${index}`}
              style={{
                position: "relative",
                width,
                minWidth: 0,
              }}
              aria-label={`${item.name}: ${label}`}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: gradientBg(color),
                  ...radius,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontWeight: 600,
                    background: alphaBg("#ffffff", 0.85),
                    color: "#0f172a",
                    borderRadius: 999,
                    padding: "2px 10px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 1px 2px rgba(15,23,42,0.12)",
                  }}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${normalized.length}, minmax(0,1fr))`,
          gap: 12,
        }}
      >
        {normalized.map((item, index) => (
          <div key={`${item.name}-legend-${index}`} style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 600 }}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}