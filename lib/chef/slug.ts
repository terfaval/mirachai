const WHITESPACE_REGEX = /\s+/g;
const NON_LATIN_REGEX = /[^a-z0-9-]/g;

export function slugify(input: string): string {
  if (!input) {
    return "";
  }

  const base = input
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(WHITESPACE_REGEX, "-");

  return base.replace(NON_LATIN_REGEX, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
}