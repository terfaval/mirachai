import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ChefServingsControl from "@/components/chef/ServingsControl";
import { ConceptCard } from "@/components/chef/ConceptCard";
import { IngredientChecklist } from "@/components/chef/IngredientChecklist";
import { detectMode } from "@/lib/chef/detect";
import { conceptToDraft, generateConcepts, hydrateExistingRecipe } from "@/lib/chef/generate";
import { scaleIngredients } from "@/lib/chef/scale";
import { RecipeStorage } from "@/lib/chef/storage";
import {
  IngredientStatus,
  RecipeConcept,
  RecipeCore,
  RecipeMode,
} from "@/lib/chef/types";

function splitIngredients(query: string): string[] {
  return query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function defaultStatuses(ingredients: RecipeCore["ingredients"]): Record<string, IngredientStatus> {
  return ingredients.reduce<Record<string, IngredientStatus>>((acc, ingredient) => {
    acc[ingredient.id] = "basket";
    return acc;
  }, {});
}

export default function ChefPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<RecipeMode | null>(null);
  const [concepts, setConcepts] = useState<RecipeConcept[]>([]);
  const [verifiedResults, setVerifiedResults] = useState<RecipeCore[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [draft, setDraft] = useState<RecipeCore | null>(null);
  const [servings, setServings] = useState(1);
  const [ingredientStatuses, setIngredientStatuses] = useState<Record<string, IngredientStatus>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lastSearch, setLastSearch] = useState<{
    mustHave: string[];
    dish?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (draft) {
      setServings(draft.servingsBase > 0 ? draft.servingsBase : 1);
      setIngredientStatuses(defaultStatuses(draft.ingredients));
    } else {
      setIngredientStatuses({});
    }
  }, [draft]);

  useEffect(() => {
    if (!mounted || !lastSearch) {
      return;
    }

    const matches = RecipeStorage.findByQuery(lastSearch.mustHave, lastSearch.dish);
    setVerifiedResults(matches);
  }, [mounted, lastSearch]);

  const scaledIngredients = useMemo(() => {
    if (!draft) {
      return [];
    }

    return scaleIngredients(draft.ingredients, draft.servingsBase, servings);
  }, [draft, servings]);

  const handleSearch = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      setMessage(null);

      const trimmed = query.trim();
      if (!trimmed) {
        setMessage("Adj meg egy keresési kifejezést!");
        return;
      }

      const detected = detectMode(trimmed);
      if (!detected) {
        setMessage("Nem sikerült meghatározni a keresés módját.");
        return;
      }

      setMode(detected);
      setDraft(null);
      setSearchPerformed(true);

      const mustHave = detected === "by_ingredients" ? splitIngredients(trimmed) : [];
      const dish = detected === "by_dish" ? trimmed : undefined;
      setConcepts(generateConcepts(trimmed, detected));
      setLastSearch({ mustHave, dish });

      if (mounted) {
        const matches = RecipeStorage.findByQuery(mustHave, dish);
        setVerifiedResults(matches);
      } else {
        setVerifiedResults([]);
      }
    },
    [query, mounted]
  );

  const handleSelectConcept = useCallback(
    (concept: RecipeConcept) => {
      if (!mode) {
        return;
      }

      const draftRecipe = conceptToDraft(concept, query.trim(), mode);
      setDraft(draftRecipe);
      setMessage(null);
    },
    [mode, query]
  );

  const handleSelectVerified = useCallback((id: string) => {
    const recipe = RecipeStorage.get(id);
    if (!recipe) {
      setMessage("Nem található a recept a könyvtárban.");
      return;
    }

    setMode(recipe.mode);
    setDraft(hydrateExistingRecipe(recipe));
    setMessage(null);
  }, []);

  const toggleIngredientStatus = useCallback((id: string) => {
    setIngredientStatuses((prev) => {
      const next = { ...prev };
      next[id] = prev[id] === "have" ? "basket" : "have";
      return next;
    });
  }, []);

  const handleCopyShoppingList = useCallback(async () => {
    if (!draft) {
      return;
    }

    const basketItems = scaledIngredients.filter((ingredient) =>
      (ingredientStatuses[ingredient.id] ?? "basket") === "basket"
    );

    if (basketItems.length === 0) {
      setMessage("Nincs tétel a bevásárlólistában.");
      return;
    }

    const lines = basketItems.map((item) =>
      `${item.name} — ${item.amount} ${item.unit ?? ""}`.trim()
    );

    const text = lines.join("\n");

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setMessage("Bevásárlólista vágólapra másolva!");
      } else {
        throw new Error("Clipboard not supported");
      }
    } catch (error) {
      console.warn("Failed to copy shopping list", error);
      setMessage("Nem sikerült másolni. Másold ki kézzel: \n" + text);
    }
  }, [draft, ingredientStatuses, scaledIngredients]);

  const handleVerifyAndSave = useCallback(() => {
    if (!draft) {
      return;
    }

    const payload: RecipeCore = {
      ...draft,
      createdAt: draft.createdAt ?? new Date().toISOString(),
      version: 1,
    };

    const saved = RecipeStorage.save(payload);
    setDraft(saved);
    setMessage("Recept elmentve a könyvtárba!");

    if (lastSearch) {
      const matches = RecipeStorage.findByQuery(lastSearch.mustHave, lastSearch.dish);
      setVerifiedResults(matches);
    }
  }, [draft, lastSearch]);

  const handleDelete = useCallback(() => {
    if (!draft) {
      return;
    }

    RecipeStorage.remove(draft.id);
    setDraft(null);
    setMessage("Recept eltávolítva.");

    if (lastSearch) {
      const matches = RecipeStorage.findByQuery(lastSearch.mustHave, lastSearch.dish);
      setVerifiedResults(matches);
    }
  }, [draft, lastSearch]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto w-full max-w-6xl px-4 pt-16">
        <header className="max-w-3xl">
          <h1 className="text-4xl font-bold text-slate-900">Mirachai Chef</h1>
          <p className="mt-2 text-lg text-slate-600">
            Reform receptek egészséges csavarral – keress kedvenc ételeidre vagy hozzávalókra,
            és alkoss új superfood kombinációkat.
          </p>
        </header>

        <form className="mt-8 flex gap-3" onSubmit={handleSearch}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ételnév vagy hozzávalók…"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-lg shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <button
            type="submit"
            className="rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Keresés
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-800">
            {message}
          </p>
        ) : null}

        {searchPerformed ? (
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Új koncepciók</h2>
                <p className="text-sm text-slate-500">
                  AI-ready superfood inspirációk a megadott keresésre.
                </p>
              </div>
              <div className="grid gap-4">
                {concepts.map((concept) => (
                  <ConceptCard key={concept.id} concept={concept} onSelect={handleSelectConcept} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  Verifikált találatok a receptkönyvből
                </h2>
                <p className="text-sm text-slate-500">
                  Korábban mentett, ellenőrzött reform receptek.
                </p>
              </div>
              {verifiedResults.length > 0 ? (
                <div className="space-y-3">
                  {verifiedResults.map((recipe) => (
                    <button
                      key={recipe.id}
                      type="button"
                      onClick={() => handleSelectVerified(recipe.id)}
                      className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">{recipe.title}</h3>
                        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
                          v{recipe.version}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{recipe.summary}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-6 text-sm text-slate-400">
                  Nincs még mentett recept ehhez a kereséshez. Próbálj ki egy új koncepciót!
                </p>
              )}
            </section>
          </div>
        ) : null}

        {draft ? (
          <section className="mt-12 rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{draft.title}</h2>
                <p className="mt-2 max-w-2xl text-slate-500">{draft.summary}</p>
              </div>
              <ChefServingsControl value={servings} onChange={setServings} />
            </div>

            <div className="mt-10 grid gap-12 lg:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-800">Hozzávalók</h3>
                  <button
                    type="button"
                    onClick={handleCopyShoppingList}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    Bevásárlólista másolása
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Jelöld, hogy mely tételek vannak meg vagy kerülnek a kosárba.
                </p>
                <div className="mt-4">
                  <IngredientChecklist
                    ingredients={scaledIngredients}
                    statuses={ingredientStatuses}
                    onToggle={toggleIngredientStatus}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800">Elkészítés</h3>
                <ol className="mt-4 space-y-4">
                  {draft.steps.map((step, index) => (
                    <li key={step.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                        Lépés {index + 1}
                      </p>
                      <p className="mt-1 text-base text-slate-700">{step.text}</p>
                      {step.minutes ? (
                        <p className="mt-2 text-xs font-medium text-slate-400">{step.minutes} perc</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleVerifyAndSave}
                className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-emerald-600"
              >
                Verifikálás és mentés
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
              >
                Törlés
              </button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}