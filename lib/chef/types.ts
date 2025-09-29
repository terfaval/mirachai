export type RecipeMode = "by_dish" | "by_ingredients";

export type ChefProfile = "mediterran" | "balkan" | "azsiai" | "salata";

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit?: string;
  note?: string;
}

export interface RecipeStep {
  id: string;
  text: string;
  minutes?: number | null;
}

export interface RecipeCore {
  id: string;
  slug: string;
  title: string;
  profile: ChefProfile;
  mode: RecipeMode;
  healthFocus: string[];
  servingsBase: number;
  totalMinutes?: number | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  summary?: string;
  createdAt: string;
  version: number;
}

export interface RecipeConcept {
  id: string;
  title: string;
  profile: ChefProfile;
  summary: string;
  focus: string[];
}

export type IngredientStatus = "basket" | "have";