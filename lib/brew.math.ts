export function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

export function gramsForVolume(ratio_g_per_100ml: number, volume_ml: number, rounding_g = 0.1) {
  const g = (ratio_g_per_100ml * volume_ml) / 100;
  return roundTo(g, rounding_g);
}

export function approxTspFromGrams(grams: number, gramsPerTsp: number, tspStep = 0.25) {
  if (!gramsPerTsp || gramsPerTsp <= 0) return null;
  const tsp = grams / gramsPerTsp;
  return roundTo(tsp, tspStep);
}

export function coldbrewSecondsRange(time_h: string): [number, number] | null {
  const m = time_h.match(/^(\d+)\D+(\d+)$/);
  if (!m) return null;
  return [Number(m[1]) * 3600, Number(m[2]) * 3600];
}