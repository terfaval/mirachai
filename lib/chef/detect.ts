import { RecipeMode } from "./types";

export function detectMode(query: string): RecipeMode | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.includes(",")) {
    return "by_ingredients";
  }

  return "by_dish";
}