export type StringOrArray = string | string[] | null | undefined;

export function toStringArray(v: StringOrArray): string[] {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
}