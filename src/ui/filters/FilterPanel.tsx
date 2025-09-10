import React, { useMemo } from "react";
import Dropdown from "./Dropdown";
import MultiSelectDropdown from "./MultiSelectDropdown";
import Slider from "./Slider";
import Chip from "./Chip";
import { getCategoryColors } from "../../utils/colorMap";

export type FilterState = {
  categories: string[];
  ingredients: string[];
  tastes: Record<string, number>;
  focuses: Record<string, number>;
  intensity?: number;
  steepMin?: number;
  caffeine?: number;
  allergens: string[];
  dayparts: string[];
  seasons: string[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  value: FilterState;
  onChange: (f: FilterState) => void;
  allCategories: string[];
  allIngredients: string[];
  allTastes: string[];
  allFocuses: string[];
  allAllergens: string[];
  allDayparts: string[];
  allSeasons: string[];
};

const toggle = (arr: string[], v: string) =>
  arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

export default function FilterPanel({
  open,
  onClose,
  value,
  onChange,
  allCategories,
  allIngredients,
  allTastes,
  allFocuses,
  allAllergens,
  allDayparts,
  allSeasons
}: Props) {
  const categories = useMemo(
    () => [...value.categories, ...allCategories.filter(c => !value.categories.includes(c))],
    [value.categories, allCategories]
  );

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-screen bg-white z-50 shadow-2xl border-l w-full sm:w-2/3 lg:w-[40vw]">
        <div className="h-full flex flex-col">
          <div className="p-4 flex items-center justify-between border-b">
            <h3 className="font-semibold">Szűrők</h3>
            <button onClick={onClose} className="px-2 py-1 rounded-lg border">×</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Categories */}
            <section>
              <h4 className="font-medium mb-3">Kategória</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(c => {
                  const col = getCategoryColors(c);
                  const selected = value.categories.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() =>
                        onChange({ ...value, categories: selected ? value.categories.filter(x => x !== c) : [c, ...value.categories] })
                      }
                      onMouseEnter={e => {
                        if (!selected) e.currentTarget.style.backgroundColor = col.main;
                      }}
                      onMouseLeave={e => {
                        if (!selected) e.currentTarget.style.backgroundColor = "";
                      }}
                      style={{
                        borderColor: col.dark,
                        backgroundColor: selected ? col.dark : undefined,
                        color: selected ? col.white : undefined
                      }}
                      className="px-3 py-1.5 rounded-full border text-sm"
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Ingredients */}
            <section>
              <h4 className="font-medium mb-3">Hozzávalók</h4>
              <Dropdown label="Válassz" wide>
                <MultiSelectDropdown
                  items={allIngredients}
                  selected={value.ingredients}
                  onChange={items => onChange({ ...value, ingredients: items })}
                />
              </Dropdown>
              <div className="mt-2 flex flex-wrap gap-2">
                {value.ingredients.map(i => (
                  <Chip key={i} label={i} onRemove={() => onChange({ ...value, ingredients: value.ingredients.filter(x => x !== i) })} />
                ))}
              </div>
            </section>

            {/* Tastes */}
            <section>
              <h4 className="font-medium mb-3">Íz</h4>
              <Dropdown label="Adj hozzá">
                <select
                  className="w-full px-2 py-1 border rounded-xl"
                  onChange={e => {
                    const v = e.target.value;
                    if (v) {
                      onChange({ ...value, tastes: { ...value.tastes, [v]: 1 } });
                      e.target.value = "";
                    }
                  }}
                  value=""
                >
                  <option value="">Válassz…</option>
                  {allTastes.filter(t => !(t in value.tastes)).map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Dropdown>
              <div className="mt-2 space-y-2">
                {Object.entries(value.tastes).map(([t, v]) => (
                  <div key={t} className="p-2 rounded-xl border flex items-center gap-2">
                    <span className="capitalize flex-1">{t}</span>
                    <Slider value={v} min={1} max={3} onChange={val => onChange({ ...value, tastes: { ...value.tastes, [t]: val } })} />
                    <button
                      onClick={() => {
                        const { [t]: _omit, ...rest } = value.tastes;
                        onChange({ ...value, tastes: rest });
                      }}
                      className="px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Focus */}
            <section>
              <h4 className="font-medium mb-3">Fókusz</h4>
              <Dropdown label="Adj hozzá">
                <select
                  className="w-full px-2 py-1 border rounded-xl"
                  onChange={e => {
                    const v = e.target.value;
                    if (v) {
                      onChange({ ...value, focuses: { ...value.focuses, [v]: 1 } });
                      e.target.value = "";
                    }
                  }}
                  value=""
                >
                  <option value="">Válassz…</option>
                  {allFocuses.filter(t => !(t in value.focuses)).map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Dropdown>
              <div className="mt-2 space-y-2">
                {Object.entries(value.focuses).map(([t, v]) => (
                  <div key={t} className="p-2 rounded-xl border flex items-center gap-2">
                    <span className="capitalize flex-1">{t}</span>
                    <Slider value={v} min={1} max={3} onChange={val => onChange({ ...value, focuses: { ...value.focuses, [t]: val } })} />
                    <button
                      onClick={() => {
                        const { [t]: _omit, ...rest } = value.focuses;
                        onChange({ ...value, focuses: rest });
                      }}
                      className="px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Intensity / Steep / Caffeine */}
            <section className="flex flex-col gap-4">
              <Dropdown label="Intenzitás" rightAlign>
                <Slider value={value.intensity ?? 0} min={0} max={3} onChange={val => onChange({ ...value, intensity: val })} />
              </Dropdown>
              <Dropdown label="Áztatás" rightAlign>
                <Slider value={value.steepMin ?? 0} min={0} max={10} onChange={val => onChange({ ...value, steepMin: val })} />
              </Dropdown>
              <Dropdown label="Koffein" rightAlign>
                <Slider value={value.caffeine ?? 0} min={0} max={3} onChange={val => onChange({ ...value, caffeine: val })} />
              </Dropdown>
            </section>

            {/* Allergens */}
            <section>
              <h4 className="font-medium mb-3">Allergének</h4>
              <Dropdown label="Válassz" wide>
                <div className="grid grid-cols-2 gap-2">
                  {allAllergens.map(a => {
                    const selected = value.allergens.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => onChange({ ...value, allergens: toggle(value.allergens, a) })}
                        className="px-2 py-1 rounded-lg border text-sm"
                        style={{ backgroundColor: selected ? "#333" : undefined, color: selected ? "#fff" : undefined }}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </Dropdown>
              <div className="mt-2 flex flex-wrap gap-2">
                {value.allergens.map(a => (
                  <Chip key={a} label={a} onRemove={() => onChange({ ...value, allergens: value.allergens.filter(x => x !== a) })} />
                ))}
              </div>
            </section>

            {/* Dayparts */}
            <section>
              <h4 className="font-medium mb-3">Napszak</h4>
              <Dropdown label="Válassz" wide>
                <div className="grid grid-cols-2 gap-2">
                  {allDayparts.map(a => {
                    const selected = value.dayparts.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => onChange({ ...value, dayparts: toggle(value.dayparts, a) })}
                        className="px-2 py-1 rounded-lg border text-sm"
                        style={{ backgroundColor: selected ? "#333" : undefined, color: selected ? "#fff" : undefined }}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </Dropdown>
              <div className="mt-2 flex flex-wrap gap-2">
                {value.dayparts.map(a => (
                  <Chip key={a} label={a} onRemove={() => onChange({ ...value, dayparts: value.dayparts.filter(x => x !== a) })} />
                ))}
              </div>
            </section>

            {/* Seasons */}
            <section>
              <h4 className="font-medium mb-3">Évszak</h4>
              <Dropdown label="Válassz" wide>
                <div className="grid grid-cols-2 gap-2">
                  {allSeasons.map(a => {
                    const selected = value.seasons.includes(a);
                    return (
                      <button
                        key={a}
                        type="button"
                        onClick={() => onChange({ ...value, seasons: toggle(value.seasons, a) })}
                        className="px-2 py-1 rounded-lg border text-sm"
                        style={{ backgroundColor: selected ? "#333" : undefined, color: selected ? "#fff" : undefined }}
                      >
                        {a}
                      </button>
                    );
                  })}
                </div>
              </Dropdown>
              <div className="mt-2 flex flex-wrap gap-2">
                {value.seasons.map(a => (
                  <Chip key={a} label={a} onRemove={() => onChange({ ...value, seasons: value.seasons.filter(x => x !== a) })} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>
    </>
  );
}