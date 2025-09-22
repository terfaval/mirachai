import brewProfiles from '@/data/brew_profiles.json';
import brewDescriptions from '@/data/brew_descriptions.json';
import type { Tea } from '@/utils/filter';
import { getMethodServeModes, type ServeModeMeta } from './serveModes';

export type BrewMethodSummary = {
  id: string;
  name: string;
  description?: string;
  equipment: string[];
  serveModes: ServeModeMeta[];
  icon: string;
};

type BrewProfileDocument = (typeof brewProfiles)[number];
type BrewProfileMethod = BrewProfileDocument['methods'] extends Array<infer T>
  ? T extends Record<string, unknown>
    ? T
    : never
  : never;
type BrewDescriptionDocument = (typeof brewDescriptions)[number];

const METHOD_ICON_MAP: Record<string, string> = {
  ayurvedic_decoction: '/methods/icon_ayurvedic_decoction.svg',
  coldbrew: '/methods/icon_coldbrew.svg',
  experimental_texture: '/methods/icon_experimental_texture.svg',
  gongfu: '/methods/icon_standard_hot.svg',
  hot_standard: '/methods/icon_standard_hot.svg',
  iced_flash_chill: '/methods/icon_iced_tea.svg',
  infused_spirits: '/methods/icon_infused_spirit.svg',
  latte: '/methods/icon_layered_brew.svg',
  layered_brew: '/methods/icon_layered_brew.svg',
  matcha_whisking: '/methods/icon_matcha_whisking.svg',
  moroccan_mint: '/methods/icon_moroccan_mint.svg',
  nitro_tea: '/methods/icon_nitro_tea.svg',
  samovar: '/methods/icon_samovar.svg',
  smoked_tea: '/methods/icon_smoked_tea.svg',
  sparkling_tea: '/methods/icon_sparkling_tea.svg',
  stovetop_chai: '/methods/icon_ayurvedic_decoction.svg',
  tea_concentrate: '/methods/icon_tea_concentrate.svg',
  tonic_style: '/methods/icon_tonic_style.svg',
  wellness_shot: '/methods/icon_wellness_shot.svg',
  yerba_mate: '/methods/icon_yerba_mate.svg',
};

const METHOD_ICON_FALLBACK = '/methods/icon_standard_hot.svg';

export function getBrewMethodsForTea(tea: Tea): BrewMethodSummary[] {
  const profile = findProfileForTea(tea);
  if (!profile || !Array.isArray(profile.methods)) {
    return [];
  }

  const results: BrewMethodSummary[] = [];
  const seen = new Set<string>();
  const teaName = profile.name ?? tea.name ?? '';

  for (const method of profile.methods as BrewProfileMethod[]) {
    const methodIdRaw = (method as any)?.method_id;
    const methodId = typeof methodIdRaw === 'string' ? methodIdRaw.trim() : String(methodIdRaw ?? '').trim();
    if (!methodId || seen.has(methodId)) {
      continue;
    }
    seen.add(methodId);

    const description = findDescriptionForMethod(teaName, methodId);
    const oneLiner = typeof description?.one_liner === 'string' ? description.one_liner.trim() : undefined;
    const notes = Array.isArray((method as any)?.notes)
      ? ((method as any).notes as Array<unknown>).find((note) => typeof note === 'string')
      : typeof (method as any)?.notes === 'string'
        ? ((method as any).notes as string)
        : undefined;

    const equipment = uniqueStrings([
      ...toArray(description?.meta && (description.meta as any).tools),
      ...toArray((method as any)?.gear),
    ]);

    results.push({
      id: methodId,
      name: formatMethodName(methodId, (method as any)?.title),
      description: oneLiner ?? notes ?? undefined,
      equipment,
      serveModes: getMethodServeModes(
        {
          methodId,
          tempC: (method as any)?.tempC ?? null,
          descriptionMeta: (description?.meta as Record<string, unknown> | null) ?? null,
        },
        tea,
      ),
      icon: guessMethodIcon(methodId),
    });
  }

  return results;
}

function findProfileForTea(tea: Tea): BrewProfileDocument | undefined {
  const profiles = brewProfiles as BrewProfileDocument[];
  const teaId = (tea as any)?.id ?? tea.id;
  if (teaId != null) {
    const numericId = Number(teaId);
    if (!Number.isNaN(numericId)) {
      const matchById = profiles.find((profile) => Number(profile.id) === numericId);
      if (matchById) {
        return matchById;
      }
    }
  }

  const candidates = [
    (tea as any)?.slug,
    tea.name,
    (tea as any)?.name,
    teaId != null ? String(teaId) : undefined,
  ]
    .map(slugify)
    .filter((value) => value.length > 0);

  for (const candidate of candidates) {
    const matchBySlug = profiles.find((profile) => {
      const profileSlug = slugify(((profile as any)?.slug ?? profile.name ?? profile.id ?? ''));
      return profileSlug === candidate;
    });
    if (matchBySlug) {
      return matchBySlug;
    }
  }

  return undefined;
}

function findDescriptionForMethod(teaName: string, methodId: string): BrewDescriptionDocument | undefined {
  const descriptions = brewDescriptions as BrewDescriptionDocument[];
  const methodKey = String(methodId);
  const teaSlug = slugify(teaName);
  const candidates = descriptions.filter((entry) => String(entry.method) === methodKey);

  const direct = candidates.find((entry) => slugify(entry.tea ?? '') === teaSlug);
  if (direct) {
    return direct;
  }

  const fallbackDefault = candidates.find((entry) => entry.tea === '__DEFAULT__');
  if (fallbackDefault) {
    return fallbackDefault;
  }

  return candidates[0];
}

function formatMethodName(methodId: string, title?: unknown): string {
  if (typeof title === 'string' && title.trim().length > 0) {
    return title.trim();
  }
  return methodId
    .split(/[_-]+/g)
    .filter((segment) => segment.length > 0)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function guessMethodIcon(methodId: string): string {
  const normalized = methodId.toLowerCase();
  return METHOD_ICON_MAP[normalized] ?? METHOD_ICON_FALLBACK;
}

function toArray(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  if (value == null) {
    return [];
  }
  return [value];
}

function uniqueStrings(values: unknown[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const text = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
    if (!text) {
      continue;
    }
    const key = text.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(text);
  }
  return result;
}

function slugify(value: unknown): string {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}