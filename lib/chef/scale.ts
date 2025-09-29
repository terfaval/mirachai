import { RecipeIngredient } from "./types";

export function scaleIngredients(
  ingredients: RecipeIngredient[],
  fromServings: number,
  toServings: number
): RecipeIngredient[] {
  const safeFrom = fromServings > 0 ? fromServings : 1;
  const ratio = toServings / safeFrom;

  return ingredients.map((ingredient) => {
    const scaledAmount = Number.isFinite(ratio)
      ? Math.round(ingredient.amount * ratio * 10) / 10
      : ingredient.amount;

    return {
      ...ingredient,
      amount: Number.isFinite(scaledAmount) ? scaledAmount : ingredient.amount,
    };
  });
}