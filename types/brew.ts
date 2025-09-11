export type EquipmentRef = { code: string; howto_ref?: string };

export type FlavorSuggestion = {
  hint: string;
  dose: string;
  when?: string;
};

export type NotesPerStep = {
  amount?: string; temp?: string; steep?: string; finish?: string;
};

export type BrewProfile =
  | {
      profile_id: "hot_standard" | "essence";
      label: string;
      equipment: EquipmentRef[];
      water_temp_c: number;
      ratio_g_per_100ml: number;
      time_s: number;
      rounding_g?: number;
      spoon_equiv?: { teaspoon_g: number; tablespoon_g: number };
      notes_per_step?: NotesPerStep;
      finish_message?: string;
      flavor_suggestions?: FlavorSuggestion[];
    }
  | {
      profile_id: "cold_brew";
      label: string;
      equipment: EquipmentRef[];
      water_temp_c: number;
      ratio_g_per_100ml: number;
      time_h: string; // "6–12"
      rounding_g?: number;
      spoon_equiv?: { teaspoon_g: number; tablespoon_g: number };
      notes_per_step?: NotesPerStep;
      finish_message?: string;
      flavor_suggestions?: FlavorSuggestion[];
    }
  | {
      profile_id: "gongfu";
      label: string;
      equipment: EquipmentRef[];
      water_temp_c: number;
      ratio_g_per_100ml: number;
      multi_infusions: number[]; // mp lista
      rounding_g?: number;
      spoon_equiv?: { teaspoon_g: number; tablespoon_g: number };
      notes_per_step?: NotesPerStep;
      finish_message?: string;
      flavor_suggestions?: FlavorSuggestion[];
    };

export type BrewTeaProfiles = {
  tea_slug: string;
  tea_name: string;
  grams_per_tsp: { measured: number | null; estimated: number };
  profiles: BrewProfile[];
};

export type EquipmentGuide = {
  code: string;
  name: string;
  desc: string;
  capacity_ml_range?: [number, number];
  best_methods?: string[];
  best_tea_types?: string[];
  steps: string[];
  do?: string[];
  dont?: string[];
  cleaning?: string;
};