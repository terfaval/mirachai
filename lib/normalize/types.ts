// lib/normalize/types.ts

// —— Buckets
export type CaffeineBucket = 'none' | 'low' | 'medium' | 'high';
export const CAFFEINE_BUCKETS = ['none', 'low', 'medium', 'high'] as const;

export type IntensityBucket = 'light' | 'balanced' | 'strong';
export const INTENSITY_BUCKETS = ['light', 'balanced', 'strong'] as const;

// —— Üzemmódok, íz-mód
export type ServeMode = 'hot' | 'iced' | 'coldbrew' | 'lukewarm';
export type ServeModeKey = ServeMode;
export interface ServeModeMeta { id: ServeMode; label: string; }
export type TasteMode = 'present' | 'dominant';

// —— Figyelem-tengelyek (UI „axis”)
export type FocusAxis = 'immunity' | 'focus' | 'detox' | 'relax' ;
export const FOCUS_AXES = ['immunity' , 'focus' , 'detox' , 'relax' ] as const;

// —— Token típusok a FilterPanelhez
export type TokenValue = { slug: string; label: string };

// —— Brew-profil (minimum, később szigorítható)
export interface BrewProfileDocument {
  id: string;
  title?: string;
  methods?: Array<{ id: string; label?: string }>;
}

// —— NormalizeResult (amit a kód több helyen vár)
import type { NormalizedTea } from './teas';
export interface NormalizeResult {
  teas: NormalizedTea[];
  categories: TokenValue[];
  subcategories: TokenValue[];
  tastes: TokenValue[];
  intensities: Array<import('./types').IntensityBucket>;
  caffeineLevels: Array<import('./types').CaffeineBucket>;
  dayparts: TokenValue[];
  seasons: TokenValue[];
  serveModes: ServeModeMeta[];
  ingredients: string[];
  allergens: TokenValue[];
  methods: Array<{ id: string; label: string }>;
}
