export function getMandalaPath(category: string): string {
  return `/Mandala_${encodeURIComponent(category)}.svg`;
}