import servingInfoData from '@/data/serving_info_full.json';

export type ServingTemperature = 'hot' | 'cold' | 'either';
export type ServingSweetening =
  | 'unsweetened'
  | 'light_honey'
  | 'sugar_syrup'
  | 'fruit_slices'
  | 'no_recommendation';
export type ServingGarnish = 'none' | 'mint_leaf' | 'citrus' | 'optional';

export type ServingInfo = {
  temperature: ServingTemperature;
  sweetening: ServingSweetening;
  garnish: ServingGarnish;
  notes: string;
};

export const SERVING_INFO_FALLBACK: ServingInfo = {
  temperature: 'either',
  sweetening: 'no_recommendation',
  garnish: 'optional',
  notes: 'Nincs specifikus tálalási ajánlás.',
};

type ServingInfoMap = Record<string, ServingInfo | undefined>;

const RAW_SERVING_INFO = servingInfoData as ServingInfoMap;

const SERVING_INFO_LOOKUP: Record<string, ServingInfo> = {};

const TEMPERATURE_VALUES: ServingTemperature[] = ['hot', 'cold', 'either'];
const SWEETENING_VALUES: ServingSweetening[] = [
  'unsweetened',
  'light_honey',
  'sugar_syrup',
  'fruit_slices',
  'no_recommendation',
];
const GARNISH_VALUES: ServingGarnish[] = ['none', 'mint_leaf', 'citrus', 'optional'];

for (const [key, value] of Object.entries(RAW_SERVING_INFO)) {
  if (!value) {
    continue;
  }
  const normalized = key.trim();
  if (!normalized) {
    continue;
  }
  SERVING_INFO_LOOKUP[normalized] = normalizeServingInfo(value);
}

function normalizeServingInfo(entry: ServingInfo): ServingInfo {
  return {
    temperature: normalizeTemperature(entry.temperature),
    sweetening: normalizeSweetening(entry.sweetening),
    garnish: normalizeGarnish(entry.garnish),
    notes: typeof entry.notes === 'string' && entry.notes.trim().length > 0 ? entry.notes : SERVING_INFO_FALLBACK.notes,
  };
}

function normalizeTemperature(value: unknown): ServingTemperature {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (TEMPERATURE_VALUES.includes(normalized as ServingTemperature)) {
      return normalized as ServingTemperature;
    }
  }
  return SERVING_INFO_FALLBACK.temperature;
}

function normalizeSweetening(value: unknown): ServingSweetening {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (SWEETENING_VALUES.includes(normalized as ServingSweetening)) {
      return normalized as ServingSweetening;
    }
  }
  return SERVING_INFO_FALLBACK.sweetening;
}

function normalizeGarnish(value: unknown): ServingGarnish {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (GARNISH_VALUES.includes(normalized as ServingGarnish)) {
      return normalized as ServingGarnish;
    }
  }
  return SERVING_INFO_FALLBACK.garnish;
}

export function getServingInfoForMethod(
  methodId: string | null | undefined,
): { info: ServingInfo; isFallback: boolean; methodId: string | null } {
  if (!methodId) {
    return { info: SERVING_INFO_FALLBACK, isFallback: true, methodId: null };
  }

  const direct = SERVING_INFO_LOOKUP[methodId];
  if (direct) {
    return { info: direct, isFallback: false, methodId: methodId }; // keep original id for logging clarity
  }

  const trimmed = methodId.trim();
  if (trimmed && SERVING_INFO_LOOKUP[trimmed]) {
    return { info: SERVING_INFO_LOOKUP[trimmed], isFallback: false, methodId: trimmed };
  }

  return { info: SERVING_INFO_FALLBACK, isFallback: true, methodId: trimmed || methodId };
}