import type { ServeModeMeta } from '@/utils/serveModes';

export type BrewMethodRatioSummary = {
  text: string;
  gPer100ml?: number | null;
};

export type SparklingMixingSummary = {
  type: 'sparkling';
  concentrateStrength?: string | null;
  serveDilution?: string | null;
};

export type TextureMixingSummary = {
  type: 'texture';
  agarMinPct?: number | null;
  agarMaxPct?: number | null;
  lecithinPct?: number | null;
};

export type LayeredMixingSummary = {
  type: 'layered';
  baseStrengths?: string | null;
  notes?: string | null;
};

export type BrewMethodMixingSummary =
  | SparklingMixingSummary
  | TextureMixingSummary
  | LayeredMixingSummary;

export type BrewMethodSummary = {
  id: string;
  name: string;
  description?: string;
  oneLiner?: string;
  gear: string[];
  equipment: string[];
  serveModes: ServeModeMeta[];
  icon: string;
  ratio?: BrewMethodRatioSummary;
  mixing?: BrewMethodMixingSummary | null;
  stepsText?: string;
};