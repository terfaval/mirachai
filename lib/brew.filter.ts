// lib/brew.filter.ts
export type FilterState = 'required' | 'optional' | 'not_needed';

export interface GearInfoLike {
  filter_required?: boolean | null;
  allow_no_filter?: boolean | null;
}

/**
 * Egységes szűrő-állapot levezetés a brew profilból.
 * - Ha nincs semmilyen flag -> 'not_needed'
 * - Ha filter_required === true -> 'required'
 * - Egyéb esetben -> 'optional'
 */
export function getFilterState(gear?: GearInfoLike | null): FilterState {
  const hasAny =
    typeof gear?.filter_required === 'boolean' ||
    typeof gear?.allow_no_filter === 'boolean';

  if (!hasAny) return 'not_needed';
  if (gear?.filter_required === true) return 'required';
  return 'optional';
}
