import React, { useMemo } from "react";
import Dropdown from "./Dropdown";
import MultiSelectDropdown from "./MultiSelectDropdown";
import Slider from "./Slider";
import Chip from "./Chip";
import { getCategoryColors } from "../../utils/colorMap";
import { getMandalaPath } from "../../../utils/mandala";
import { getTasteIcon } from "../../utils/tasteIcons";
import { SERVE_MODE_DEFINITIONS } from "../../utils/serveModes";
import { getMethodIcon } from "@/utils/brewMethods";
import type { NormalizeResult, TokenValue } from "../../../lib/normalize";
import {
  CAFFEINE_BUCKET_OPTIONS,
  FOCUS_AXIS_LABELS,
  INTENSITY_BUCKET_OPTIONS,
  TASTE_MODE_OPTIONS,
  createEmptyFilterState,
  type FilterState
} from "../../../lib/tea-filters";
import { FOCUS_AXES, type FocusAxis } from "../../../lib/normalize";

type ToggleKey = "subcategories" | "tastes" | "dayparts" | "seasons" | "allergensExclude";

export type FilterPanelData = Pick<
  NormalizeResult,
  |
    "categories"
    | "subcategories"
    | "tastes"
    | "intensities"
    | "caffeineLevels"
    | "dayparts"
    | "seasons"
    | "serveModes"
    | "ingredients"
    | "allergens"
    | "methods"
> & {
  methodCounts?: Record<string, number>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  value: FilterState;
  onChange: (next: FilterState) => void;
  data: FilterPanelData;
};

const toggleValue = <T extends string>(list: readonly T[], value: T): T[] =>
  list.includes(value) ? list.filter(item => item !== value) : [...list, value];

const capitalize = (label: string) => label.charAt(0).toUpperCase() + label.slice(1);

function renderTokenButton(
  token: TokenValue,
  selected: boolean,
  onToggle: () => void,
  className = "",
  icon?: { src: string; alt?: string },
) {
  return (
    <button
      key={token.slug}
      type="button"
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full border text-sm transition-colors flex items-center gap-2 ${
        selected ? "bg-gray-900 text-white border-gray-900" : "bg-white hover:bg-gray-50"
      } ${className}`}
    >
      {icon ? (
        <img
          src={icon.src}
          alt={icon.alt ?? ""}
          className="h-5 w-5"
          aria-hidden={icon.alt ? undefined : true}
        />
      ) : null}
      {capitalize(token.label.replace(/_/g, " "))}
    </button>
  );
}

export default function FilterPanel({ open, onClose, value, onChange, data }: Props) {
  const intensityOptions = useMemo(
    () => INTENSITY_BUCKET_OPTIONS.filter(option => data.intensities.includes(option.id)),
    [data.intensities]
  );

  const caffeineOptions = useMemo(
    () => CAFFEINE_BUCKET_OPTIONS.filter(option => data.caffeineLevels.includes(option.id)),
    [data.caffeineLevels]
  );

  if (!open) return null;

  const resetFilters = () => onChange(createEmptyFilterState());

  const updateFocus = (axis: FocusAxis, level: number) => {
    const nextFocus = { ...value.focusMin };
    if (level <= 0) delete nextFocus[axis];
    else nextFocus[axis] = level;
    onChange({ ...value, focusMin: nextFocus });
  };

  const renderTokenGrid = (
    tokens: TokenValue[],
    current: string[],
    key: ToggleKey,
    iconFor?: (token: TokenValue) => { src: string; alt?: string } | null,
  ) => (
    <div className="flex flex-wrap gap-2">
      {tokens.map(token => {
        const icon = iconFor ? iconFor(token) : null;
        return renderTokenButton(
          token,
          current.includes(token.slug),
          () => onChange({ ...value, [key]: toggleValue(current, token.slug) }),
          "",
          icon ?? undefined,
        );
      })}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-screen bg-white z-50 shadow-2xl border-l w-full sm:w-2/3 lg:w-[40vw]">
        <div className="h-full flex flex-col">
          <div className="p-4 flex items-center justify-between border-b">
            <h3 className="font-semibold text-lg">Szűrők</h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm hover:bg-gray-50"
              >
                Alaphelyzet
              </button>
              <button onClick={onClose} className="px-3 py-1.5 rounded-full border text-sm">
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-8">
            <section>
              <h4 className="font-medium mb-3">Kategóriák</h4>
              <div className="flex flex-wrap gap-2">
                {data.categories.map(category => {
                  const selected = value.categories.includes(category.slug);
                  const colors = getCategoryColors(category.label);
                  const icon = getMandalaPath(category.label);
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() =>
                        onChange({
                          ...value,
                          categories: toggleValue(value.categories, category.slug)
                        })
                      }
                      className="px-3 py-1.5 rounded-full border text-sm transition-colors flex items-center gap-2"
                      style={{
                        borderColor: colors.dark,
                        backgroundColor: selected ? colors.dark : undefined,
                        color: selected ? colors.white : undefined
                      }}
                    >
                      <img src={icon} alt="" className="h-6 w-6 rounded-full border border-white/30" aria-hidden />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h4 className="font-medium mb-3">Alkategóriák</h4>
              {renderTokenGrid(data.subcategories, value.subcategories, "subcategories")}
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Ízprofil</h4>
                <div className="flex gap-2">
                  {TASTE_MODE_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onChange({ ...value, tasteMode: option.id })}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                        value.tasteMode === option.id
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              {renderTokenGrid(data.tastes, value.tastes, "tastes", token => ({
                src: getTasteIcon(token.slug),
                alt: token.label,
              }))}
            </section>

            <section>
              <h4 className="font-medium mb-3">Fókusz tengelyek</h4>
              <div className="grid grid-cols-1 gap-4">
                {FOCUS_AXES.map(axis => (
                  <Slider
                    key={axis}
                    min={0}
                    max={3}
                    step={1}
                    value={value.focusMin[axis] ?? 0}
                    onChange={val => updateFocus(axis, val)}
                    label={FOCUS_AXIS_LABELS[axis]}
                  />
                ))}
              </div>
            </section>

            {intensityOptions.length > 0 && (
              <section>
                <h4 className="font-medium mb-3">Intenzitás</h4>
                <div className="flex flex-wrap gap-2">
                  {intensityOptions.map(option => {
                    const selected = value.intensities.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...value,
                            intensities: toggleValue(value.intensities, option.id)
                          })
                        }
                        className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                          selected
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {caffeineOptions.length > 0 && (
              <section>
                <h4 className="font-medium mb-3">Koffein szint</h4>
                <div className="flex flex-wrap gap-2">
                  {caffeineOptions.map(option => {
                    const selected = value.caffeine.includes(option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...value,
                            caffeine: toggleValue(value.caffeine, option.id)
                          })
                        }
                        className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                          selected
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h4 className="font-medium mb-3">Ajánlott napszak</h4>
              {renderTokenGrid(data.dayparts, value.dayparts, "dayparts")}
            </section>

            <section>
              <h4 className="font-medium mb-3">Ajánlott évszak</h4>
              {renderTokenGrid(data.seasons, value.seasons, "seasons")}
            </section>

            <section>
              <h4 className="font-medium mb-3">Szervírozás</h4>
              <div className="flex flex-wrap gap-2">
                {data.serveModes.map(mode => {
                  const selected = value.serve.includes(mode.id);
                  const meta = SERVE_MODE_DEFINITIONS[mode.id];
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        onChange({ ...value, serve: toggleValue(value.serve, mode.id) })
                      }
                      className={`px-3 py-1.5 rounded-full border text-sm transition-colors flex items-center gap-2 ${
                        selected
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {meta ? <img src={meta.icon} alt="" className="h-5 w-5" aria-hidden /> : null}
                      {mode.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h4 className="font-medium mb-3">Összetevők (OR logika)</h4>
              <Dropdown label="Válassz" wide>
                <MultiSelectDropdown
                  items={data.ingredients}
                  selected={value.ingredients}
                  onChange={items => onChange({ ...value, ingredients: items })}
                />
              </Dropdown>
              <div className="mt-3 flex flex-wrap gap-2">
                {value.ingredients.map(item => (
                  <Chip
                    key={item}
                    label={item}
                    onRemove={() =>
                      onChange({
                        ...value,
                        ingredients: value.ingredients.filter(current => current !== item)
                      })
                    }
                  />
                ))}
              </div>
            </section>

            {data.allergens.length > 0 && (
              <section>
                <h4 className="font-medium mb-3">Allergének kizárása</h4>
                {renderTokenGrid(data.allergens, value.allergensExclude, "allergensExclude")}
              </section>
            )}

            {data.methods.length > 0 && (
              <section>
                <h4 className="font-medium mb-3">Főzési metódus</h4>
                <div className="flex flex-wrap gap-2">
                  {data.methods.map(method => {
                    const selected = value.methods.includes(method.id);
                    const count = data.methodCounts ? data.methodCounts[method.id] ?? 0 : undefined;
                    const disabled = count !== undefined && count <= 0;
                    const iconSrc = getMethodIcon(method.id);
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() =>
                          onChange({ ...value, methods: toggleValue(value.methods, method.id) })
                        }
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                          selected
                            ? "bg-gray-900 text-white border-gray-900"
                            : disabled
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                              : "bg-white hover:bg-gray-50"
                        }`}
                        disabled={disabled}
                        title={method.label}
                      >
                        {iconSrc ? <img src={iconSrc} alt="" className="h-5 w-5" aria-hidden /> : null}
                        <span className="flex-1 truncate text-left">{method.label}</span>
                        {count !== undefined ? (
                          <span className="ml-auto text-xs font-medium text-gray-500">
                            {count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}