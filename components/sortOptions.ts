export type SortKey =
  | 'default'
  | 'relevanceDesc'
  | 'nameAsc'
  | 'nameDesc'
  | 'intensityAsc'
  | 'intensityDesc'
  | 'steepMinAsc'
  | 'steepMinDesc';

export const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'relevanceDesc', label: 'A leginkább releváns teák elől' },
  { key: 'nameAsc', label: 'Teák A-tól Z-ig' },
  { key: 'nameDesc', label: 'Teák Z-től A-ig' },
  { key: 'intensityAsc', label: 'A legkevésbé intenzív teák elől' },
  { key: 'intensityDesc', label: 'A leginkább intenzív teák elől' },
  { key: 'steepMinAsc', label: 'A leggyorsabb teák elől' },
  { key: 'steepMinDesc', label: 'A leglassabb teák elől' },
];