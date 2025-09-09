export type Filters = {
  category?: string;
  subcategory?: string;
  tastes: string[];
  focus: string[];
  serve: { hot: boolean; lukewarm: boolean; iced: boolean; coldbrew: boolean };
  allergens_exclude: string[];
  intensity: string[];
  colors: string[];
  caffeineRange: [number, number];
  tempCRange: [number, number];
  steepRange: [number, number];
  ingredients: string[];
};

export const DEFAULT_FILTERS: Filters = {
  category: undefined,
  subcategory: undefined,
  tastes: [],
  focus: [],
  serve: { hot: false, lukewarm: false, iced: false, coldbrew: false },
  allergens_exclude: [],
  intensity: [],
  colors: [],
  caffeineRange: [0, 100],
  tempCRange: [70, 100],
  steepRange: [1, 8],
  ingredients: [],
};

export type Tea = Record<string, unknown> & {
  id: number | string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  mood_short?: string;
  color?: string;
  intensity?: string;
  caffeine_pct?: number;
  tempC?: number;
  steepMin?: number;
  allergens?: string;
  serve_hot?: string; serve_lukewarm?: string; serve_iced?: string; serve_coldbrew?: string;
  season_recommended?: string[];
  daypart_recommended?: string[];
  [k: `taste_${string}`]: number | undefined;
  [k: `focus_${string}`]: number | undefined;
  [k: `ingerdient-${number}`]: string | undefined;
};