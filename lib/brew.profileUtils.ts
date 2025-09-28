export const SIMPLE_RATIO_REGEX = /^\s*(\d+(?:[.,]\d+)?)\s*g\s*:\s*(\d+(?:[.,]\d+)?)\s*ml\s*$/i;

export type SimpleRatio = {
  leafGrams: number;
  waterMl: number;
};

const validatedSources = new WeakSet<object>();

function toNumber(value: string): number | null {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseSimpleRatio(input: string | null | undefined): SimpleRatio | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  const match = trimmed.match(SIMPLE_RATIO_REGEX);
  if (!match) {
    return null;
  }

  const leaf = toNumber(match[1]);
  const water = toNumber(match[2]);
  if (leaf == null || water == null || leaf <= 0 || water <= 0) {
    return null;
  }

  return { leafGrams: leaf, waterMl: water };
}

export function computeGramsPer100Ml(ratio: SimpleRatio | null): number | null {
  if (!ratio) {
    return null;
  }
  const value = (ratio.leafGrams / ratio.waterMl) * 100;
  return Number.isFinite(value) ? value : null;
}

export function validateBrewProfiles(profiles: unknown, context = 'brew_profiles.json'): void {
  if (!profiles || typeof profiles !== 'object') {
    return;
  }

  if (validatedSources.has(profiles as object)) {
    return;
  }
  validatedSources.add(profiles as object);

  if (!Array.isArray(profiles)) {
    return;
  }

  for (const profile of profiles) {
    if (!profile || typeof profile !== 'object') {
      continue;
    }
    const teaName = typeof (profile as any).name === 'string' ? (profile as any).name : (profile as any).id;
    const methods = Array.isArray((profile as any).methods) ? (profile as any).methods : [];
    for (const method of methods) {
      if (!method || typeof method !== 'object') {
        continue;
      }
      const ratioRaw = (method as any).ratio;
      if (ratioRaw == null) {
        continue;
      }
      const ratioText = typeof ratioRaw === 'string' ? ratioRaw.trim() : String(ratioRaw);
      if (!SIMPLE_RATIO_REGEX.test(ratioText)) {
        console.warn(
          `[brew_profiles] Ratio format mismatch in ${context} for ${teaName ?? 'unknown tea'} / ${(method as any).method_id ?? 'unknown method'}: "${ratioText}"`,
        );
      }
    }
  }
}