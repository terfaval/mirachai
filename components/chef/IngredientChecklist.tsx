import { IngredientStatus, RecipeIngredient } from "@/lib/chef/types";

type Props = {
  ingredients: RecipeIngredient[];
  statuses: Record<string, IngredientStatus>;
  onToggle: (id: string) => void;
};

export function IngredientChecklist({ ingredients, statuses, onToggle }: Props) {
  return (
    <ul className="space-y-2">
      {ingredients.map((ingredient) => {
        const status = statuses[ingredient.id] ?? "basket";
        const isBasket = status === "basket";
        return (
          <li
            key={ingredient.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm"
          >
            <div>
              <p className="font-medium text-slate-800">
                {ingredient.name}
                {ingredient.note ? (
                  <span className="ml-2 text-xs text-slate-400">{ingredient.note}</span>
                ) : null}
              </p>
              <p className="text-sm text-slate-500">
                {ingredient.amount} {ingredient.unit ?? ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onToggle(ingredient.id)}
              className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                isBasket
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-sky-100 text-sky-700 hover:bg-sky-200"
              }`}
            >
              {isBasket ? "🧺" : "✔️"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}