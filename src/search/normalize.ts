/** Remove accents and normalize Hungarian special chars */
export function accentFold(s: string): string {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[őŐ]/g, 'o')
    .replace(/[űŰ]/g, 'u');
}

/** Tokenize string: lower case, accent fold, split on non-word */
export function tokenize(s: string): string[] {
  return accentFold(s.toLowerCase())
    .replace(/[^\w]+/g, ' ')
    .split(' ')
    .filter(Boolean);
}