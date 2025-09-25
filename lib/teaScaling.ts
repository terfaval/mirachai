// Drop-in skálázó util tk-alapon (UI-ra 0.25 tk kerekítés), ek-kijelzéssel.
// Nem használ grammozást, csak teáskanalat. Legacy (ingredient-1.., rate-1..) és új (ingredients[]) formátumot is kezel.

export type IngredientPercent = { name: string; percent: number };

export type TeaLike = {
  name: string;
  quantity_250ml?: number; // tk / 250 ml (ha nincs, a ratioHint-ből kinyerhető)
  ingredients?: IngredientPercent[]; // új stílus
  // Legacy stílus:
  [key: `rate-${number}`]: number | undefined;
  [key: `ingredient-${number}`]: string | undefined;
};

export type ScaleOptions = {
  volumeMl?: number; // ha nincs: cups * 250 ml
  cups?: number; // 1 csésze = 250 ml
  strengthMultiplier?: number; // pl. jeges: 2
  roundStepTk?: number; // default 0.25
};

export type PerIngredientTk = {
  name: string;
  percent: number;
  tk: number; // nyers tk
  tkRounded: number; // UI-hoz kerekített tk
};

export type ScaleResult = {
  baseTkPer250ml: number;
  totalVolumeMl: number;
  totalTk: number;
  totalEk: number;
  remainderTk: number;
  formattedEkTk: string; // pl. "1 ek + 0.5 tk" vagy "1.5 tk"
  perIngredient: PerIngredientTk[];
};

const DEFAULT_ROUND_STEP_TK = 0.25;

/** 0.25 tk lépcsős kerekítés (alapértelmezett) */
export function roundTk(x: number, step = DEFAULT_ROUND_STEP_TK): number {
  const eps = 1e-6;
  return Math.max(0, Math.round((x + eps) / step) * step);
}

/** 1 ek = 3 tk felbontás */
export function toEkTk(totalTk: number, step = DEFAULT_ROUND_STEP_TK) {
  const ek = Math.floor(totalTk / 3);
  const remainder = roundTk(totalTk - ek * 3, step);
  return { ek, remainder };
}

export function formatEkTk(totalTk: number, step = DEFAULT_ROUND_STEP_TK): string {
  const { ek, remainder } = toEkTk(totalTk, step);
  if (ek > 0 && remainder > 0) return `${ek} ek + ${trim(remainder)} tk`;
  if (ek > 0) return `${ek} ek`;
  return `${trim(roundTk(totalTk, step))} tk`;
}

function trim(n: number) {
  return Number.isInteger(n) ? `${n}` : `${n}`;
}

/** ingredients[] előnyben; ha nincs, legacy mezőkből épít */
export function getIngredients(tea: TeaLike): IngredientPercent[] {
  if (tea.ingredients && tea.ingredients.length) return normalizePercents(tea.ingredients);
  const items: IngredientPercent[] = [];
  for (let i = 1; i <= 8; i++) {
    const name = tea[`ingredient-${i}`] as string | undefined;
    const percent = tea[`rate-${i}`] as number | undefined;
    if (name && typeof percent === "number") items.push({ name, percent });
  }
  return normalizePercents(items);
}

/** Ha nem pont 100% a vége, normáljuk 100-ra */
function normalizePercents(items: IngredientPercent[]): IngredientPercent[] {
  const sum = items.reduce((s, it) => s + (it.percent || 0), 0);
  if (!sum) return items;
  return items.map(it => ({ ...it, percent: (it.percent * 100) / sum }));
}

/** Alap tk/250 ml: quantity_250ml vagy ratioHint ("1.5 tk / 250 ml") */
export function getBaseTkPer250ml(tea: TeaLike, ratioHint?: string): number {
  if (typeof tea.quantity_250ml === "number" && tea.quantity_250ml > 0) return tea.quantity_250ml;
  if (ratioHint) {
    const m = ratioHint.match(/([\d.,]+)\s*tk\s*\/\s*250\s*ml/i);
    if (m) return parseFloat(m[1].replace(",", "."));
  }
  return 1; // biztonságos default
}

/** Fő skálázó: mindent tk-ban számol, per-összetevő felosztással, ek-kijelzéssel */
export function scaleTea(
  tea: TeaLike,
  options: ScaleOptions = {},
  ratioHint?: string
): ScaleResult {
  const step = options.roundStepTk ?? DEFAULT_ROUND_STEP_TK;
  const baseTk = getBaseTkPer250ml(tea, ratioHint);
  const cups = options.cups ?? (options.volumeMl ? options.volumeMl / 250 : 1);
  const volumeMl = options.volumeMl ?? cups * 250;
  const strength = options.strengthMultiplier ?? 1;

  const totalTk = baseTk * (volumeMl / 250) * strength;

  const ingredients = getIngredients(tea);
  const perRaw = ingredients.map(it => ({
    name: it.name,
    percent: it.percent,
    tk: totalTk * (it.percent / 100),
  }));

  const perRounded = balancedRound(perRaw, step);
  const { ek: totalEk, remainder: remainderTk } = toEkTk(totalTk, step);

  return {
    baseTkPer250ml: baseTk,
    totalVolumeMl: volumeMl,
    totalTk,
    totalEk,
    remainderTk,
    formattedEkTk: formatEkTk(totalTk, step),
    perIngredient: perRounded,
  };
}

/** Kiegyensúlyozott kerekítés: összeg megtartása mellett 0.25 tk rácsra */
function balancedRound(items: { name: string; percent: number; tk: number }[], step: number): PerIngredientTk[] {
  const rounded = items.map(it => ({ ...it, tkRounded: roundTk(it.tk, step) }));
  const sumRaw = items.reduce((s, it) => s + it.tk, 0);
  const sumRounded = rounded.reduce((s, it) => s + it.tkRounded, 0);
  const diff = sumRaw - sumRounded;

  if (Math.abs(diff) < step / 2) return rounded;

  const dir = diff > 0 ? +1 : -1;
  const need = Math.round(Math.abs(diff) / step);
  const sortedIdx = [...rounded.keys()].sort((a, b) => items[b].tk - items[a].tk);

  let remaining = need;
  let i = 0;
  while (remaining > 0 && i < sortedIdx.length) {
    const idx = sortedIdx[i];
    const next = rounded[idx].tkRounded + dir * step;
    if (next >= 0) {
      rounded[idx].tkRounded = next;
      remaining--;
    }
    i++;
    if (i === sortedIdx.length && remaining > 0) i = 0;
  }
  return rounded;
}