import type { ServeModeMeta } from '@/utils/serveModes';

export type BrewMethodSummary = {
  id: string;
  name: string;
  description?: string;
  oneLiner?: string;
  gear: string[];
  equipment: string[];
  serveModes: ServeModeMeta[];
  icon: string;
};