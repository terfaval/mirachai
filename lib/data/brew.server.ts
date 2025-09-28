import fs from 'node:fs/promises';
import path from 'node:path';

import { computeGramsPer100Ml, parseSimpleRatio, validateBrewProfiles } from '@/lib/brew.profileUtils';
import { slugify } from '@/lib/normalize';
import { readTeas, type Tea } from '@/lib/data/teas.server';
import { normalizeGear } from '@/utils/equipment';
import { getMethodServeModes } from '@/utils/serveModes';
import { getMethodIcon } from '@/utils/brewMethods';
import type { BrewMethodMixingSummary, BrewMethodRatioSummary, BrewMethodSummary } from '@/types/brewMethods';

const DATA_DIR = path.join(process.cwd(), 'data');
const BREW_PROFILES_PATH = path.join(DATA_DIR, 'brew_profiles.json');
const BREW_DESCRIPTIONS_PATH = path.join(DATA_DIR, 'brew_descriptions.json');

export type BrewProfileDocument = {
  id?: number | string;
  tea_slug?: string;
  name?: string;
  methods?: BrewProfileMethod[];
};

export type BrewProfileMethod = {
  method_id?: string;
  title?: string;
  notes?: string | string[];
  gear?: unknown[];
  tempC?: number | string;
};

export type BrewDescriptionDocument = {
  method?: string;
  tea?: string;
  one_liner?: string;
  meta?: Record<string, unknown> | null;
};

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content) as T;
}

export async function readBrewProfiles(): Promise<BrewProfileDocument[]> {
  const profiles = await readJsonFile<BrewProfileDocument[]>(BREW_PROFILES_PATH);
  validateBrewProfiles(profiles, 'lib/data/brew.server.ts');
  return profiles;
}

export async function readBrewDescriptions(): Promise<BrewDescriptionDocument[]> {
  return readJsonFile<BrewDescriptionDocument[]>(BREW_DESCRIPTIONS_PATH);
}

export async function getBrewMethodsForTea(teaId: string): Promise<BrewMethodSummary[]> {
  const [teas, profiles, descriptions] = await Promise.all([
    readTeas(),
    readBrewProfiles(),
    readBrewDescriptions(),
  ]);

  const tea = findTea(teas, teaId);
  const profile = findProfileForTea(profiles, teaId, tea);
  if (!profile) {
    return [];
  }

  return buildMethodSummaries(profile, descriptions, tea);
}

function findTea(teas: Tea[], teaId: string): Tea | undefined {
  const normalized = slugify(String(teaId));
  return teas.find(tea => {
    const id = tea?.id != null ? String(tea.id) : undefined;
    if (id && (id === teaId || slugify(id) === normalized)) {
      return true;
    }
    const slug = slugify(((tea as any)?.slug ?? tea.name ?? id ?? '').toString());
    return slug === normalized;
  });
}

function findProfileForTea(
  profiles: BrewProfileDocument[],
  teaId: string,
  tea: Tea | undefined,
): BrewProfileDocument | undefined {
  const numericId = Number(teaId);
  if (!Number.isNaN(numericId)) {
    const matchById = profiles.find(profile => Number(profile.id) === numericId);
    if (matchById) {
      return matchById;
    }
  }

  const candidates = new Set<string>();
  candidates.add(slugify(String(teaId)));
  if (tea) {
    if (tea.id != null) {
      candidates.add(slugify(String(tea.id)));
    }
    const teaSlug = (tea as any)?.slug ?? tea.name ?? teaId;
    if (teaSlug) {
      candidates.add(slugify(String(teaSlug)));
    }
  }

  for (const profile of profiles) {
    const slug = slugify(
      String(profile.tea_slug ?? profile.name ?? profile.id ?? '').toString(),
    );
    if (candidates.has(slug)) {
      return profile;
    }
  }

  return undefined;
}

function buildRatioSummary(method: BrewProfileMethod): BrewMethodRatioSummary | undefined {
  const ratioRaw = (method as any)?.ratio;
  if (typeof ratioRaw !== 'string' || ratioRaw.trim().length === 0) {
    return undefined;
  }
  const ratioText = ratioRaw.trim();
  const parsed = parseSimpleRatio(ratioText);
  const gPer100 = computeGramsPer100Ml(parsed);
  return {
    text: ratioText,
    gPer100ml: gPer100 ?? null,
  };
}

function buildMixingSummary(method: BrewProfileMethod): BrewMethodMixingSummary | null {
  const raw = (method as any)?.mixing;
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const type = String((raw as any).type ?? '').trim().toLowerCase();
  if (type === 'sparkling') {
    return {
      type: 'sparkling',
      concentrateStrength: typeof (raw as any).concentrate_strength === 'string'
        ? (raw as any).concentrate_strength
        : null,
      serveDilution: typeof (raw as any).serve_dilution === 'string' ? (raw as any).serve_dilution : null,
    };
  }
  if (type === 'texture') {
    const gelling = (method as any)?.gelling_pct ?? {};
    const foaming = (method as any)?.foaming_pct ?? {};
    const agarMin = typeof gelling?.agar_min_pct === 'number' ? gelling.agar_min_pct : null;
    const agarMax = typeof gelling?.agar_max_pct === 'number' ? gelling.agar_max_pct : null;
    const lecithin = typeof foaming?.lecithin_pct === 'number' ? foaming.lecithin_pct : null;
    return {
      type: 'texture',
      agarMinPct: agarMin,
      agarMaxPct: agarMax,
      lecithinPct: lecithin,
    };
  }
  if (type === 'layered') {
    return {
      type: 'layered',
      baseStrengths: typeof (raw as any).base_strengths === 'string' ? (raw as any).base_strengths : null,
      notes: typeof (raw as any).notes === 'string' ? (raw as any).notes : null,
    };
  }
  return null;
}

function buildMethodSummaries(
  profile: BrewProfileDocument,
  descriptions: BrewDescriptionDocument[],
  tea: Tea | undefined,
): BrewMethodSummary[] {
  const methods = Array.isArray(profile.methods) ? profile.methods : [];
  const teaName = (tea as any)?.name ?? profile.name ?? '';
  const teaSlug = slugify(String((tea as any)?.slug ?? teaName ?? profile.tea_slug ?? ''));
  const results: BrewMethodSummary[] = [];
  const seen = new Set<string>();

  for (const method of methods) {
    if (!method) continue;
    const methodIdRaw = method.method_id;
    const methodId = typeof methodIdRaw === 'string' ? methodIdRaw.trim() : String(methodIdRaw ?? '').trim();
    if (!methodId || seen.has(methodId)) {
      continue;
    }
    seen.add(methodId);

    const description = findDescriptionForMethod(descriptions, methodId, teaSlug);
    const oneLiner = typeof description?.one_liner === 'string' ? description.one_liner.trim() : undefined;
    const notes = Array.isArray(method.notes)
      ? method.notes.find(value => typeof value === 'string')
      : typeof method.notes === 'string'
        ? method.notes
        : undefined;

    const descriptionToolsRaw = toArray(description?.meta && (description.meta as any).tools).flatMap(value => {
      if (typeof value === 'string') return [value];
      if (value == null) return [];
      return [String(value)];
    });

    const methodGearRaw = toArray(method.gear).flatMap(value => {
      if (typeof value === 'string') return [value];
      if (value == null) return [];
      return [String(value)];
    });

    const gear = normalizeGear(methodGearRaw);
    const equipment = normalizeGear([...methodGearRaw, ...descriptionToolsRaw]);

    results.push({
      id: methodId,
      name: formatMethodName(methodId, method.title),
      description: oneLiner ?? notes ?? undefined,
      oneLiner,
      gear,
      equipment,
      serveModes: getMethodServeModes(
        {
          methodId,
          tempC: method.tempC ?? null,
          descriptionMeta: (description?.meta as Record<string, unknown> | null) ?? null,
        },
        tea,
      ),
      icon: getMethodIcon(methodId),
      ratio: buildRatioSummary(method),
      mixing: buildMixingSummary(method),
    });
  }

  return results;
}

function findDescriptionForMethod(
  descriptions: BrewDescriptionDocument[],
  methodId: string,
  teaSlug: string,
): BrewDescriptionDocument | undefined {
  const methodKey = String(methodId);
  const candidates = descriptions.filter(entry => String(entry.method) === methodKey);

  const direct = candidates.find(entry => slugify(String(entry.tea ?? '')) === teaSlug);
  if (direct) {
    return direct;
  }

  const fallbackDefault = candidates.find(entry => entry.tea === '__DEFAULT__');
  if (fallbackDefault) {
    return fallbackDefault;
  }

  return candidates[0];
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

function formatMethodName(methodId: string, title?: unknown): string {
  if (typeof title === 'string' && title.trim().length > 0) {
    return title.trim();
  }
  return methodId
    .split(/[_-]+/g)
    .filter(segment => segment.length > 0)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}