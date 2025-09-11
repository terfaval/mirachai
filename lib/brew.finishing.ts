export function scaleDoseText(doseText: string, volume_ml: number): string {
  const base = 250;
  const factor = volume_ml / base;

  const norm = doseText.trim().toLowerCase();
  const parts = norm.split("/");
  if (parts.length < 2) return doseText;

  const amount = parts[0].trim();
  const unit = amount.includes("tk") ? "tk" : amount.includes("ml") ? "ml" : amount.includes("szelet") ? "szelet" : null;

  const range = amount.match(/([\d.,]+)\s*[–-]\s*([\d.,]+)/);
  const single = amount.match(/([\d.,]+)/);

  const fmt = (val: number, step=0.25) => (Math.round(val/step)*step).toString().replace(".", ",");
  const fmtMl = (val: number) => String(Math.round(val/5)*5);

  const scaleNum = (n: number, u: string) => {
    if (u === "tk") return fmt(n * factor, 0.25) + " tk";
    if (u === "ml") return fmtMl(n * factor) + " ml";
    if (u === "szelet") return String(Math.max(1, Math.round(n * factor))) + " szelet";
    return String(n);
  };

  let scaled: string;
  if (range && unit) {
    const a = parseFloat(range[1].replace(",", ".")), b = parseFloat(range[2].replace(",", "."));
    scaled = `${scaleNum(a, unit)}–${scaleNum(b, unit)}`;
  } else if (single && unit) {
    const n = parseFloat(single[1].replace(",", "."));
    scaled = scaleNum(n, unit);
  } else {
    scaled = amount;
  }
  return `${scaled} / ${base} ml → ${volume_ml} ml`;
}