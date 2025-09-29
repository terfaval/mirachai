import { useCallback } from "react";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
};

export default function ChefServingsControl({ value, onChange, min = 1 }: Props) {
  const decrease = useCallback(() => {
    const next = Math.max(min, value - 1);
    onChange(next);
  }, [value, onChange, min]);

  const increase = useCallback(() => {
    const next = value + 1;
    onChange(next);
  }, [value, onChange]);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-medium text-slate-500">Adagok</span>
      <div className="inline-flex items-center rounded-full border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={decrease}
          className="px-3 py-1 text-slate-600 transition hover:text-slate-900 disabled:opacity-30"
          disabled={value <= min}
        >
          −
        </button>
        <span className="px-3 font-semibold text-slate-800">{value}</span>
        <button
          type="button"
          onClick={increase}
          className="px-3 py-1 text-slate-600 transition hover:text-slate-900"
        >
          +
        </button>
      </div>
    </div>
  );
}