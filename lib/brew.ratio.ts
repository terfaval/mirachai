export type RatioKind = 'direct' | 'range' | 'parts' | 'unknown';

export type RatioBounds = {
  min: number;
  max: number;
};

export type ParsedRatio =
  | {
      kind: 'direct';
      gramsPerMl: number;
      raw: string;
      gramsBounds?: RatioBounds;
      teaspoonGrams?: number | null;
      tablespoonGrams?: number | null;
    }
  | {
      kind: 'range';
      bounds: RatioBounds;
      raw: string;
      teaspoonGrams?: number | null;
      tablespoonGrams?: number | null;
    }
  | {
      kind: 'parts';
      raw: string;
      teaPart: number;
      waterPart: number;
      waterPartMax?: number;
      teaspoonGrams?: number | null;
      tablespoonGrams?: number | null;
      exampleBounds?: RatioBounds;
    }
  | {
      kind: 'unknown';
      raw: string;
    };

const NUMBER_RANGE = /([\d.,]+)(?:\s*[-–]\s*([\d.,]+))?/;

function toNumber(value: string | undefined | null): number | null {
  if (!value) {
    return null;
  }
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return parsed;
}

function parseNumberRange(token: string | undefined | null): RatioBounds | null {
  if (!token) {
    return null;
  }
  const match = token.match(NUMBER_RANGE);
  if (!match) {
    return null;
  }
  const min = toNumber(match[1]);
  const max = match[2] ? toNumber(match[2]) : min;
  if (min == null || max == null) {
    return null;
  }
  const orderedMin = Math.min(min, max);
  const orderedMax = Math.max(min, max);
  return { min: orderedMin, max: orderedMax };
}

function parseTeaspoonHint(source: string): number | null {
  const match = source.match(/([\d.,]+)\s*(?:tk|teáskanál)/i);
  if (!match) {
    return null;
  }
  const tsp = toNumber(match[1]);
  if (tsp == null || tsp <= 0) {
    return null;
  }

  const gramsMatch = source.match(/~\s*([\d.,]+)\s*g/);
  if (!gramsMatch) {
    return null;
  }
  const grams = toNumber(gramsMatch[1]);
  if (grams == null || grams <= 0) {
    return null;
  }
  return grams / tsp;
}

function parseTablespoonHint(source: string): number | null {
  const match = source.match(/([\d.,]+)\s*(?:ek|evőkanál)/i);
  if (!match) {
    return null;
  }
  const tbsp = toNumber(match[1]);
  if (tbsp == null || tbsp <= 0) {
    return null;
  }

  const gramsMatch = source.match(/~\s*([\d.,]+)\s*g/);
  if (!gramsMatch) {
    return null;
  }
  const grams = toNumber(gramsMatch[1]);
  if (grams == null || grams <= 0) {
    return null;
  }
  return grams / tbsp;
}

function parsePartsExpression(source: string): {
  teaPart: number;
  waterPart: number;
  waterPartMax?: number;
} | null {
  const partsMatch = source.match(/(\d+(?:[.,]\d+)?)\s*[:×x]\s*(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))?/);
  if (!partsMatch) {
    return null;
  }
  const teaPart = toNumber(partsMatch[1]);
  const waterPart = toNumber(partsMatch[2]);
  const waterPartMax = partsMatch[3] ? toNumber(partsMatch[3]) : null;
  if (teaPart == null || teaPart <= 0 || waterPart == null || waterPart <= 0) {
    return null;
  }
  return {
    teaPart,
    waterPart,
    waterPartMax: waterPartMax ?? undefined,
  };
}

export function parseRatio(ratio: string | null | undefined): ParsedRatio {
  if (!ratio || typeof ratio !== 'string') {
    return { kind: 'unknown', raw: '' };
  }

  const raw = ratio.trim();
  if (!raw) {
    return { kind: 'unknown', raw };
  }

  const gramsMatch = raw.match(/([\d.,]+(?:\s*[-–]\s*[\d.,]+)?)\s*g\b/i);
  const mlMatch = raw.match(/([\d.,]+(?:\s*[-–]\s*[\d.,]+)?)\s*ml\b/i);
  const teaspoonHint = parseTeaspoonHint(raw);
  const tablespoonHint = parseTablespoonHint(raw);

  const gramsBounds = gramsMatch ? parseNumberRange(gramsMatch[1]) : null;
  const mlBounds = mlMatch ? parseNumberRange(mlMatch[1]) : null;

  if (gramsBounds && mlBounds) {
    const minRatio = gramsBounds.min / mlBounds.max;
    const maxRatio = gramsBounds.max / mlBounds.min;
    if (Number.isFinite(minRatio) && Number.isFinite(maxRatio)) {
      if (Math.abs(minRatio - maxRatio) < 1e-4) {
        return {
          kind: 'direct',
          raw,
          gramsPerMl: minRatio,
          gramsBounds: gramsBounds.min === gramsBounds.max ? undefined : gramsBounds,
          teaspoonGrams: teaspoonHint,
          tablespoonGrams: tablespoonHint,
        };
      }
      return {
        kind: 'range',
        raw,
        bounds: {
          min: Math.min(minRatio, maxRatio),
          max: Math.max(minRatio, maxRatio),
        },
        teaspoonGrams: teaspoonHint,
        tablespoonGrams: tablespoonHint,
      };
    }
  }

  const parts = parsePartsExpression(raw);
  if (parts) {
    const exampleBounds = gramsBounds && mlBounds ? {
      min: gramsBounds.min / mlBounds.max,
      max: gramsBounds.max / mlBounds.min,
    } : undefined;
    return {
      kind: 'parts',
      raw,
      teaPart: parts.teaPart,
      waterPart: parts.waterPart,
      waterPartMax: parts.waterPartMax,
      teaspoonGrams: teaspoonHint,
      tablespoonGrams: tablespoonHint,
      exampleBounds,
    };
  }

  return { kind: 'unknown', raw };
}

function round(value: number, precision = 1): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function scaleByVolume(
  targetMl: number,
  parsedRatio: ParsedRatio,
  options?: {
    strength?: number; // 0..1, only for range ratios
    teaspoonOverride?: number | null;
    tablespoonOverride?: number | null;
  },
): { grams: number | null; teaspoons: number | null; tablespoons: number | null } {
  if (!targetMl || targetMl <= 0) {
    return { grams: null, teaspoons: null, tablespoons: null };
  }

  let gramsPerMl: number | null = null;

  if (parsedRatio.kind === 'direct') {
    gramsPerMl = parsedRatio.gramsPerMl;
  } else if (parsedRatio.kind === 'range') {
    const strength = options?.strength ?? 0.5;
    const clamped = Math.min(Math.max(strength, 0), 1);
    gramsPerMl = parsedRatio.bounds.min + (parsedRatio.bounds.max - parsedRatio.bounds.min) * clamped;
  } else if (parsedRatio.kind === 'parts') {
    const example = parsedRatio.exampleBounds;
    if (example) {
      const strength = options?.strength ?? 0.5;
      const clamped = Math.min(Math.max(strength, 0), 1);
      gramsPerMl = example.min + (example.max - example.min) * clamped;
    }
  }

  if (gramsPerMl == null || !Number.isFinite(gramsPerMl)) {
    return { grams: null, teaspoons: null, tablespoons: null };
  }

  const grams = round(targetMl * gramsPerMl, 1);
  const teaspoonWeight = options?.teaspoonOverride ?? (parsedRatio.kind !== 'unknown' ? parsedRatio.teaspoonGrams ?? null : null);
  const tablespoonWeight = options?.tablespoonOverride ?? (parsedRatio.kind !== 'unknown' ? parsedRatio.tablespoonGrams ?? null : null);

  const teaspoons = teaspoonWeight && teaspoonWeight > 0 ? round(grams / teaspoonWeight, 1) : null;
  const tablespoons = tablespoonWeight && tablespoonWeight > 0 ? round(grams / tablespoonWeight, 2) : null;

  return { grams, teaspoons, tablespoons };
}

export function shouldShowTimer(steepMaxMin: number | null | undefined): boolean {
  if (steepMaxMin == null) {
    return false;
  }
  return steepMaxMin <= 30;
}