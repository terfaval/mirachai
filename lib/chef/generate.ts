import { slugify } from "./slug";
import { RecipeConcept, RecipeCore, RecipeIngredient, RecipeMode, RecipeStep } from "./types";

const SUPERFOODS = [
  "chia", "goji", "spirulina", "maca", "quinoa", "brokkoli", "avokádó", "gyömbér"
];

const PROFILE_DESCRIPTIONS = {
  mediterran: "Füstös olívaolaj, friss fűszerek, mediterrán könnyedség",
  balkan: "Rusztikus zöldségek és gabonák balkáni hangulatban",
  azsiai: "Umami gazdagság egzotikus superfoodokkal",
  salata: "Ropogós zöldek funkcionális toppingokkal"
} as const;

const DEFAULT_STEPS: ((context: {
  focus: string[];
  query: string;
  mode: RecipeMode;
}) => RecipeStep[]) = ({ focus, query, mode }) => {
  const highlight = focus[0] ?? "superfood";
  const prepTarget = mode === "by_dish" ? query : "a hozzávalók";

  return [
    {
      id: "step-1",
      text: `Készítsd elő ${prepTarget} alapját, majd forgasd össze a ${highlight} feltéttel.`,
      minutes: 10,
    },
    {
      id: "step-2",
      text: "Pirítsd vagy párold röviden, hogy az ízek összeérjenek.",
      minutes: 8,
    },
    {
      id: "step-3",
      text: "Tálald friss zöldekkel és extra ropogóssággal.",
      minutes: 2,
    },
  ];
};

function pickSuperfoods(): string[] {
  const shuffled = [...SUPERFOODS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

function buildIngredients(query: string, mode: RecipeMode, focus: string[]): RecipeIngredient[] {
  const baseTokens = mode === "by_ingredients"
    ? query.split(",").map((token) => token.trim()).filter(Boolean)
    : query.split(" ").map((token) => token.trim()).filter(Boolean);

  const essentials = baseTokens.length > 0 ? baseTokens : ["alap", "zöldség"];

  const focusExtras = focus.map((item) => `${item} boost`);
  const combined = [...essentials, ...focusExtras];

  return combined.map((token, index) => ({
    id: `ing-${index}`,
    name: token,
    amount: 1 + index * 0.5,
    unit: index % 2 === 0 ? "adag" : "csésze",
  }));
}

export function generateConcepts(query: string, mode: RecipeMode): RecipeConcept[] {
  const superfoods = pickSuperfoods();
  return superfoods.map((focus, index) => ({
    id: `${slugify(query)}-${index}`,
    title: `${query.trim()} ${focus} remix`.trim(),
    profile: (Object.keys(PROFILE_DESCRIPTIONS) as Array<RecipeConcept["profile"]>)[index % 4],
    summary: PROFILE_DESCRIPTIONS[(Object.keys(PROFILE_DESCRIPTIONS) as Array<RecipeConcept["profile"]>)[index % 4]],
    focus: [focus, superfoods[(index + 1) % superfoods.length]],
  }));
}

export function conceptToDraft(
  concept: RecipeConcept,
  query: string,
  mode: RecipeMode
): RecipeCore {
  const focus = concept.focus.length > 0 ? concept.focus : pickSuperfoods();
  const ingredients = buildIngredients(query, mode, focus);

  return {
    id: `draft-${concept.id}-${Date.now()}`,
    slug: slugify(concept.title),
    title: concept.title,
    profile: concept.profile,
    mode,
    healthFocus: focus,
    servingsBase: 2,
    totalMinutes: 20,
    ingredients,
    steps: DEFAULT_STEPS({ focus, query, mode }),
    summary: concept.summary,
    createdAt: new Date().toISOString(),
    version: 0,
  };
}

export function hydrateExistingRecipe(recipe: RecipeCore): RecipeCore {
  return {
    ...recipe,
    ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient })),
    steps: recipe.steps.map((step) => ({ ...step })),
  };
}