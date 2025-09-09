export type Tea = Record<string, unknown> & {
  id: number|string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  mood_short?: string;
  color?: string;
  intensity?: string;
  caffeine_pct?: number;
  allergens?: string;
  serve_hot?: string;
  serve_lukewarm?: string;
  serve_iced?: string;
  serve_coldbrew?: string;
  tempC?: number;
  steepMin?: number;
  season_recommended?: string[];
  daypart_recommended?: string[];
};

export type Posting = { id: string; f: "name"|"desc"|"ing"|"cat"|"sub"|"tag"; tf: number };

export type BuiltIndex = {
  docs: Map<string, Tea>;
  inv: Map<string, Posting[]>;
  trigrams: Map<string, Set<string>>;
  df: Map<string, number>;
  N: number;
};

export type SearchHit = {
  id: string;
  name: string;
  score: number;
  snippet: string;
  why: string[];
  category?: string;
  subcategory?: string;
  caffeine_pct?: number;
};

export type SearchResult = SearchHit;

export type ParsedQuery = {
  tokens: string[];
  must: string[];
  not: string[];
  facets: {
    category?: string[];
    subcategory?: string[];
    taste?: string[];
    focus?: string[];
    serve?: string[];
    allergens_not?: string[];
    intensity?: string[];
    color?: string[];
  };
  ranges: {
    caffeine_lt?: number; caffeine_gt?: number;
    tempC_lt?: number; tempC_gt?: number;
    steepMin_lt?: number; steepMin_gt?: number;
  };
  rawTokens?: string[];
};