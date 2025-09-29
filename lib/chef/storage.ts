import { slugify } from "./slug";
import { RecipeCore } from "./types";

const STORAGE_KEY = "mirachai.saved_recipes.v1";

type RecipePayload = Omit<RecipeCore, "slug"> & { slug?: string };

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    console.warn("LocalStorage is not available", error);
    return null;
  }
}

function readRecipes(): RecipeCore[] {
  const storage = getLocalStorage();
  if (!storage) {
    return [];
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as RecipeCore[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn("Failed to parse saved recipes", error);
  }

  return [];
}

function writeRecipes(recipes: RecipeCore[]) {
  const storage = getLocalStorage();
  if (!storage) {
    return;
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function normalizeRecipe(recipe: RecipePayload): RecipeCore {
  const slug = slugify(recipe.slug ?? recipe.title);

  return {
    ...recipe,
    slug,
  } as RecipeCore;
}

export const RecipeStorage = {
  list(): RecipeCore[] {
    return readRecipes();
  },
  get(id: string): RecipeCore | null {
    const recipes = readRecipes();
    return recipes.find((recipe) => recipe.id === id) ?? null;
  },
  save(recipe: RecipePayload): RecipeCore {
    const normalized = normalizeRecipe(recipe);
    const recipes = readRecipes();
    const index = recipes.findIndex((item) => item.id === normalized.id);

    if (index >= 0) {
      recipes[index] = normalized;
    } else {
      recipes.push(normalized);
    }

    writeRecipes(recipes);
    return normalized;
  },
  remove(id: string) {
    const recipes = readRecipes();
    const next = recipes.filter((recipe) => recipe.id !== id);
    writeRecipes(next);
  },
  findByQuery(mustHave: string[], dish?: string): RecipeCore[] {
    const normalizedMustHave = mustHave
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const normalizedDish = dish?.trim().toLowerCase();

    return readRecipes().filter((recipe) => {
      const dishMatch = normalizedDish
        ? recipe.title.toLowerCase().includes(normalizedDish)
        : true;

      const mustHaveMatch = normalizedMustHave.every((needle) =>
        recipe.ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(needle)
        )
      );

      return dishMatch && mustHaveMatch;
    });
  },
};