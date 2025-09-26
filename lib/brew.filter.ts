// lib/brew.filter.ts
export type FilterState = 'required' | 'optional' | 'suggested';

export interface GearInfoLike {
  filter_required?: boolean | null;
  allow_no_filter?: boolean | null;
  filterRequired?: boolean | null;
  allowNoFilter?: boolean | null;
}

/**
 * Egységes szűrő-állapot levezetés a brew profilból.
 * - Ha filter_required === true -> 'required'
 * - Ha allow_no_filter === true -> 'optional'
 * - Egyéb esetben -> 'suggested'
 */
export function getFilterState(gear?: GearInfoLike | null): FilterState {
  const filterRequired =
    gear?.filter_required ??
    (typeof gear?.filterRequired === 'boolean' ? gear.filterRequired : undefined);
  const allowNoFilter =
    gear?.allow_no_filter ??
    (typeof gear?.allowNoFilter === 'boolean' ? gear.allowNoFilter : undefined);

  if (filterRequired === true) return 'required';
  if (allowNoFilter === true) return 'optional';
  return 'suggested';
}