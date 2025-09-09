import * as React from "react";

type SliderProps = {
  value?: [number, number] | number[];
  defaultValue?: [number, number] | number[];
  onValueChange?: (v: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className,
}: SliderProps) {
  const init = (): [number, number] => {
    const v = (value ?? defaultValue ?? [min, max]) as number[];
    const l = typeof v[0] === "number" ? v[0] : min;
    const r = typeof v[1] === "number" ? v[1] : max;
    return [Math.min(l, r), Math.max(l, r)];
  };

  const [range, setRange] = React.useState<[number, number]>(init);

  React.useEffect(() => {
    if (Array.isArray(value) && value.length) {
      const l = value[0] ?? min;
      const r = value[1] ?? max;
      setRange([Math.min(l, r), Math.max(l, r)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Array.isArray(value) ? value[0] : undefined, Array.isArray(value) ? value[1] : undefined]);

  const update = (next: [number, number]) => {
    const [l, r] = next[0] <= next[1] ? next : [next[1], next[0]];
    setRange([l, r]);
    onValueChange?.([l, r]);
  };

  return (
    <div className={["relative flex items-center gap-2", className].filter(Boolean).join(" ")}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={range[0]}
        onChange={(e) => update([Number(e.target.value), range[1]])}
        className="w-full"
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={range[1]}
        onChange={(e) => update([range[0], Number(e.target.value)])}
        className="w-full"
      />
    </div>
  );
}
