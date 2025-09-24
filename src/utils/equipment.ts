const EQUIPMENT_ICON_BASE = '/teasets';

export type EquipmentAliasGroup = {
  canonicalName: string;
  icon: string;
  aliases: string[];
};

const EQUIPMENT_GROUPS: EquipmentAliasGroup[] = [
  {
    canonicalName: 'agar/zselésítő',
    icon: `${EQUIPMENT_ICON_BASE}/icon_gel.svg`,
    aliases: [
      'agar/zselésítő',
      'agar',
      'zselésítő',
      'pecsétgyanta',
      'agar/pecsétgyanta vagy zselésítő',
      'agar vagy zselésítő',
    ],
  },
  {
    canonicalName: 'befőttes üveg',
    icon: `${EQUIPMENT_ICON_BASE}/icon_jar.svg`,
    aliases: ['befőttes üveg', 'tárolóüveg', 'tárolóüveg (befőttes üveg)'],
  },
  {
    canonicalName: 'csattos palack',
    icon: `${EQUIPMENT_ICON_BASE}/icon_snapbottle.svg`,
    aliases: [
      'csattos palack',
      'zárható üveg',
      'zárható üveg (csattos palack)',
      'fermentáló palack',
      'fermentáló palack (PET vagy flip-top)',
    ],
  },
  {
    canonicalName: 'bambusz ecset (chasen)',
    icon: `${EQUIPMENT_ICON_BASE}/icon_chawan.svg`,
    aliases: ['bambusz ecset (chasen)', 'bambusz ecset', 'chasen'],
  },
  {
    canonicalName: 'csésze',
    icon: `${EQUIPMENT_ICON_BASE}/icon_cup.svg`,
    aliases: ['csésze', 'chawan'],
  },
  {
    canonicalName: 'kis pohár',
    icon: `${EQUIPMENT_ICON_BASE}/icon_tinycup.svg`,
    aliases: ['tiny cup', 'kis pohár', 'tiny cup / kis pohár'],
  },
  {
    canonicalName: 'shot pohár',
    icon: `${EQUIPMENT_ICON_BASE}/icon_shotglass.svg`,
    aliases: ['shot pohár'],
  },
  {
    canonicalName: 'bögre',
    icon: `${EQUIPMENT_ICON_BASE}/icon_mug.svg`,
    aliases: ['bögre'],
  },
  {
    canonicalName: 'kancsó',
    icon: `${EQUIPMENT_ICON_BASE}/icon_jug.svg`,
    aliases: ['kancsó', 'vízkiöntő', 'vízmérő/kancsó', 'vízmérő / kancsó', 'vízmérő'],
  },
  {
    canonicalName: 'teáskanna',
    icon: `${EQUIPMENT_ICON_BASE}/icon_teapot.svg`,
    aliases: [
      'teáskanna',
      'kis teáskanna koncentrátumhoz',
      'kisméretű teáskanna',
      'teáskanna vagy lábas',
      'kis teáskanna',
    ],
  },
  {
    canonicalName: 'yi xing kanna',
    icon: `${EQUIPMENT_ICON_BASE}/icon_yixing.svg`,
    aliases: ['yi xing kanna'],
  },
  {
    canonicalName: 'gaiwan',
    icon: `${EQUIPMENT_ICON_BASE}/icon_gaiwan.svg`,
    aliases: ['gaiwan', 'gaiwan/yi xing kanna', 'gaiwan, yi xing kanna'],
  },
  {
    canonicalName: 'calabash',
    icon: `${EQUIPMENT_ICON_BASE}/icon_calabash.svg`,
    aliases: ['calabash', 'calabash (tökhéj) vagy bögre'],
  },
  {
    canonicalName: 'bombilla',
    icon: `${EQUIPMENT_ICON_BASE}/icon_bombilla.svg`,
    aliases: ['bombilla', 'bombilla (szűrős szívószál)'],
  },
  {
    canonicalName: 'kanál',
    icon: `${EQUIPMENT_ICON_BASE}/icon_spoon.svg`,
    aliases: ['kanál', 'keverőkanál', 'kanál (rétegezéshez)'],
  },
  {
    canonicalName: 'botmixer',
    icon: `${EQUIPMENT_ICON_BASE}/icon_smokegun.svg`,
    aliases: ['botmixer', 'botmixer (habhoz)', 'immersion blender'],
  },
  {
    canonicalName: 'chashaku',
    icon: `${EQUIPMENT_ICON_BASE}/icon_chashaku.svg`,
    aliases: ['chashaku', 'kanál (chashaku)'],
  },
  {
    canonicalName: 'lábas',
    icon: `${EQUIPMENT_ICON_BASE}/icon_pot.svg`,
    aliases: ['lábas', 'kis lábas', 'hőforrás'],
  },
  {
    canonicalName: 'szűrő/szűrőpapír/szita',
    icon: `${EQUIPMENT_ICON_BASE}/icon_filter_ok.svg`,
    aliases: [
      'szűrő',
      'finom szűrő',
      'finom szűrő/papír',
      'finom szűrő/szűrőpapír',
      'szűrőpapír',
      'papír',
      'finom szita',
      'szűrő / szűrőpapír / szita',
    ],
  },
  {
    canonicalName: 'füstölőpisztoly',
    icon: `${EQUIPMENT_ICON_BASE}/icon_smokegun.svg`,
    aliases: ['füstölőpisztoly', 'füstölő pisztoly', 'smoke gun'],
  },
  {
    canonicalName: 'tölcsér',
    icon: `${EQUIPMENT_ICON_BASE}/icon_funnel.svg`,
    aliases: ['tölcsér'],
  },
  {
    canonicalName: 'jég',
    icon: `${EQUIPMENT_ICON_BASE}/icon_ice.svg`,
    aliases: ['jég', 'hűtő'],
  },
  {
    canonicalName: 'tej',
    icon: `${EQUIPMENT_ICON_BASE}/icon_milkjug.svg`,
    aliases: ['tej (növényi is lehet)', 'tej'],
  },
  {
    canonicalName: 'édesítés',
    icon: `${EQUIPMENT_ICON_BASE}/icon_sweetening.svg`,
    aliases: ['cukor', 'édesítés', 'cukor / édesítés'],
  },
  {
    canonicalName: 'vízforraló',
    icon: `${EQUIPMENT_ICON_BASE}/icon_teaready.svg`,
    aliases: ['vízforraló'],
  },
  {
    canonicalName: 'csapolófej',
    icon: `${EQUIPMENT_ICON_BASE}/icon_tap.svg`,
    aliases: ['csapolófej', 'csapolófej/pohár'],
  },
  {
    canonicalName: 'mini keg',
    icon: `${EQUIPMENT_ICON_BASE}/icon_minikeg.svg`,
    aliases: ['mini keg', 'minikeg'],
  },
  {
    canonicalName: 'N₂ patron',
    icon: `${EQUIPMENT_ICON_BASE}/icon_n2patron.svg`,
    aliases: ['N₂ patron', 'N2 patron', 'nitro patron'],
  },
  {
    canonicalName: 'palack',
    icon: `${EQUIPMENT_ICON_BASE}/icon_bottle.svg`,
    aliases: [
      'palack',
      'pohár/palack',
      'pohár / palack',
      'colbrew üveg',
      'coldbrew üveg',
      'zárható edény cold brew-höz',
    ],
  },
  {
    canonicalName: 'szóda palack',
    icon: `${EQUIPMENT_ICON_BASE}/icon_soda.svg`,
    aliases: ['szóda palack', 'szódás palack', 'szódás palack vagy szóda', 'szóda'],
  },
  {
    canonicalName: 'pohár',
    icon: `${EQUIPMENT_ICON_BASE}/icon_glass.svg`,
    aliases: ['pohár'],
  },
  {
    canonicalName: 'samovár',
    icon: `${EQUIPMENT_ICON_BASE}/icon_samovar.svg`,
    aliases: ['samovár vagy vízmelegítő', 'samovár'],
  },
  {
    canonicalName: 'vízmelegítő',
    icon: `${EQUIPMENT_ICON_BASE}/icon_kettle.svg`,
    aliases: ['vízmelegítő'],
  },
  {
    canonicalName: 'fedő',
    icon: `${EQUIPMENT_ICON_BASE}/icon_top.svg`,
    aliases: ['fedő', 'fedő/pohárbúra'],
  },
];

const EQUIPMENT_ICON_FALLBACK = `${EQUIPMENT_ICON_BASE}/icon_missing.svg`;

const EXACT_ALIAS_MAP = new Map<string, EquipmentAliasGroup>();
const NORMALIZED_ALIAS_MAP = new Map<string, EquipmentAliasGroup>();
const CANONICAL_ICON_MAP = new Map<string, string>();

for (const group of EQUIPMENT_GROUPS) {
  const aliasSet = new Set<string>([group.canonicalName, ...group.aliases]);
  for (const alias of aliasSet) {
    if (!EXACT_ALIAS_MAP.has(alias)) {
      EXACT_ALIAS_MAP.set(alias, group);
    }
    const normalized = normalizeEquipmentKey(alias);
    if (normalized && !NORMALIZED_ALIAS_MAP.has(normalized)) {
      NORMALIZED_ALIAS_MAP.set(normalized, group);
    }
  }
  CANONICAL_ICON_MAP.set(normalizeEquipmentKey(group.canonicalName), group.icon);
}

const EQUIPMENT_EXCLUSION_KEYS = new Set<string>([
  '',
  'nincs',
  'nem kell',
  'nem szukseges',
  'trash',
  'kuka',
  'none',
]);

const FORCE_SPLIT_KEYS = new Set<string>(['gaiwan yi xing kanna']);

function normalizeEquipmentKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function splitGearValue(value: string): string[] {
  const replaced = value
    .replace(/\s*(?:\b(?:vagy|és)\b)\s*/gi, ',')
    .replace(/[+/;,]+/g, ',');
  return replaced
    .split(',')
    .map((segment) => normalizeWhitespace(segment))
    .filter((segment) => segment.length > 0);
}

function getCanonicalName(value: string): string | undefined {
  const direct = EXACT_ALIAS_MAP.get(value);
  if (direct) {
    return direct.canonicalName;
  }
  const normalized = normalizeEquipmentKey(value);
  if (!normalized) {
    return undefined;
  }
  const normalizedMatch = NORMALIZED_ALIAS_MAP.get(normalized);
  return normalizedMatch?.canonicalName;
}

function shouldForceSplit(value: string): boolean {
  const normalized = normalizeEquipmentKey(value);
  if (!normalized) {
    return false;
  }
  return FORCE_SPLIT_KEYS.has(normalized);
}

export function normalizeGear(gear: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const raw of gear ?? []) {
    const original = typeof raw === 'string' ? raw : String(raw ?? '');
    const cleaned = normalizeWhitespace(original);
    if (!cleaned) {
      continue;
    }

    const directCanonical = shouldForceSplit(cleaned) ? undefined : getCanonicalName(cleaned);
    if (directCanonical) {
      addCanonical(result, seen, directCanonical);
      continue;
    }

    const segments = splitGearValue(cleaned);
    if (!segments.length) {
      addCanonical(result, seen, cleaned);
      continue;
    }

    for (const segment of segments) {
      const canonical = getCanonicalName(segment) ?? segment;
      addCanonical(result, seen, canonical);
    }
  }

  return result;
}

function addCanonical(result: string[], seen: Set<string>, value: string) {
  const label = normalizeWhitespace(value);
  if (!label) {
    return;
  }
  const key = normalizeEquipmentKey(label);
  if (!key || EQUIPMENT_EXCLUSION_KEYS.has(key)) {
    return;
  }
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  const canonical = getCanonicalName(label);
  if (canonical) {
    result.push(canonical);
    return;
  }
  result.push(label);
}

export function getEquipmentIcon(name: string): string {
  const direct = EXACT_ALIAS_MAP.get(name);
  if (direct) {
    return direct.icon;
  }
  const normalized = normalizeEquipmentKey(name);
  if (!normalized) {
    return EQUIPMENT_ICON_FALLBACK;
  }
  const canonical = CANONICAL_ICON_MAP.get(normalized) ?? NORMALIZED_ALIAS_MAP.get(normalized)?.icon;
  return canonical ?? EQUIPMENT_ICON_FALLBACK;
}

export const equipmentGroups = EQUIPMENT_GROUPS;
export const equipmentFallbackIcon = EQUIPMENT_ICON_FALLBACK;