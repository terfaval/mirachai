import { normalizeServeFlags } from './teaTransforms';

export type ServeModeKey = 'hot' | 'lukewarm' | 'iced' | 'coldbrew';

export type ServeModeMeta = {
  id: ServeModeKey;
  label: string;
  icon: string;
  color: string;
};

export const SERVE_MODE_ORDER: ServeModeKey[] = ['hot', 'lukewarm', 'iced', 'coldbrew'];

export const SERVE_MODE_DEFINITIONS: Record<ServeModeKey, ServeModeMeta> = {
  hot: {
    id: 'hot',
    label: 'Forrón',
    icon: '/icons/serve_hot.svg',
    color: '#e11d48',
  },
  lukewarm: {
    id: 'lukewarm',
    label: 'Langyosan',
    icon: '/icons/serve_lukewarm.svg',
    color: '#fb923c',
  },
  iced: {
    id: 'iced',
    label: 'Jegesen',
    icon: '/icons/serve_iced.svg',
    color: '#60a5fa',
  },
  coldbrew: {
    id: 'coldbrew',
    label: 'Coldbrew',
    icon: '/icons/serve_coldbrew.svg',
    color: '#4ade80',
  },
};

const SERVE_KEY_LOOKUP: Record<string, ServeModeKey> = {
  hot: 'hot',
  lukewarm: 'lukewarm',
  iced: 'iced',
  cold: 'coldbrew',
  coldbrew: 'coldbrew',
};

const FALLBACK_FLAGS: Record<ServeModeKey, boolean> = {
  hot: true,
  lukewarm: false,
  iced: false,
  coldbrew: false,
};

export function getServeModeMeta(keys: Iterable<ServeModeKey>): ServeModeMeta[] {
  const set = new Set<ServeModeKey>();
  for (const key of keys) {
    if (!SERVE_MODE_DEFINITIONS[key] || set.has(key)) {
      continue;
    }
    set.add(key);
  }
  return SERVE_MODE_ORDER.filter((key) => set.has(key)).map((key) => SERVE_MODE_DEFINITIONS[key]);
}

export function getTeaServeModes(tea: any): ServeModeMeta[] {
  const flags = tea ? normalizeServeFlags(tea) : FALLBACK_FLAGS;
  const selected = new Set<ServeModeKey>();
  for (const key of SERVE_MODE_ORDER) {
    if (flags[key]) {
      selected.add(key);
    }
  }
  if (!selected.size) {
    selected.add('hot');
  }
  return SERVE_MODE_ORDER.filter((key) => selected.has(key)).map((key) => SERVE_MODE_DEFINITIONS[key]);
}

export type MethodServeModeOptions = {
  methodId?: string | null;
  tempC?: number | string | null;
  descriptionMeta?: Record<string, unknown> | null;
  explicitModes?: Array<string | ServeModeKey> | null;
};

export function getMethodServeModes(
  options: MethodServeModeOptions,
  tea?: any,
): ServeModeMeta[] {
  const keys = deriveServeModeKeys(options, tea);
  return getServeModeMeta(keys);
}

function deriveServeModeKeys(
  options: MethodServeModeOptions,
  tea?: any,
): ServeModeKey[] {
  const flags = tea ? normalizeServeFlags(tea) : FALLBACK_FLAGS;
  const methodId = String(options.methodId ?? '').toLowerCase();
  const tempRaw = options.tempC;
  const tempC = typeof tempRaw === 'number' ? tempRaw : Number(tempRaw);
  const meta = options.descriptionMeta ?? {};
  const selected = new Set<ServeModeKey>();

  const push = (key: ServeModeKey, force = false) => {
    if (!SERVE_MODE_DEFINITIONS[key]) {
      return;
    }
    if (!force && !flags[key]) {
      return;
    }
    selected.add(key);
  };

  const collectExplicit = (values?: Array<string | ServeModeKey> | null) => {
    if (!values) {
      return;
    }
    for (const value of values) {
      const normalized = SERVE_KEY_LOOKUP[String(value).replace(/^serve_/i, '').toLowerCase()];
      if (normalized) {
        push(normalized, true);
      }
    }
  };

  collectExplicit(options.explicitModes);
  const metaServe = Array.isArray((meta as any)?.serve_modes)
    ? ((meta as any).serve_modes as Array<string | ServeModeKey>)
    : undefined;
  collectExplicit(metaServe);

  const metaIced = Boolean((meta as any)?.ice_ready);
  const metaCold = Boolean((meta as any)?.coldbrew_ok);

  const idSuggestsCold =
    methodId.includes('coldbrew') ||
    methodId.includes('cold_brew') ||
    methodId.includes('nitro');
  const idSuggestsIced =
    methodId.includes('iced') ||
    methodId.includes('flash_chill') ||
    methodId.includes('ice') ||
    methodId.includes('sparkling') ||
    methodId.includes('tonic');

  const temperatureSuggestsCold = Number.isFinite(tempC) && tempC !== null && tempC <= 25;
  const temperatureSuggestsHot = Number.isFinite(tempC) && tempC !== null && tempC >= 60;

  if (metaCold || idSuggestsCold || temperatureSuggestsCold) {
    push('coldbrew', true);
    push('iced', metaCold || idSuggestsCold || metaIced);
  }

  if (metaIced || idSuggestsIced) {
    push('iced', true);
  }

  const shouldAddHot =
    selected.size === 0 ||
    methodId.includes('hot') ||
    (!idSuggestsCold && !idSuggestsIced && !temperatureSuggestsCold);

  if (shouldAddHot || temperatureSuggestsHot) {
    push('hot', shouldAddHot || temperatureSuggestsHot);
    if (flags.lukewarm) {
      push('lukewarm');
    }
  }

  if (!selected.size) {
    for (const key of SERVE_MODE_ORDER) {
      if (flags[key]) {
        selected.add(key);
      }
    }
  }

  if (!selected.size) {
    selected.add('hot');
  }

  return SERVE_MODE_ORDER.filter((key) => selected.has(key));
}