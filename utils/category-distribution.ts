// utils/category-distribution.ts
import type { Tea } from "./filter";

/** ---- determinisztikus RNG + hash ---- */
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
function shuffleDeterministic<T>(arr: T[], seed: number): T[] {
  const rand = mulberry32(seed >>> 0);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Kategóriánként elosztja a teákat, és körkörösen (round-robin) vesz belőlük,
 * hogy a rács jól “szétszórt” legyen. Minden keverés **determininsztikus** a seed alapján.
 *
 * @param teas      bemeneti lista
 * @param perPage   oldalméret (disztribúció célja)
 * @param perRow    rács oszlopszám (pl. 3)
 * @param seed      determinisztikus keverési mag; 0/undefined → nincs keverés (stabil)
 */
export function distributeByCategory(
  teas: Tea[],
  perPage: number = 9,
  perRow: number = 3,
  seed: number = 0
): Tea[] {
  if (!teas.length) return [];

  // 1) csoportosítás kategóriánként
  const byCat = new Map<string, Tea[]>();
  for (const t of teas) {
    const list = byCat.get(t.category) ?? [];
    list.push(t);
    byCat.set(t.category, list);
  }

  // 2) kategória-sorrend: determinisztikusan keverjük a seed alapján
  const categories = Array.from(byCat.keys());
  const catOrder =
    seed ? shuffleDeterministic(categories, seed) : categories;

  // 3) kategórián belüli sorrend: szintén determinisztikus, külön maggal
  for (const c of categories) {
    const list = byCat.get(c)!;
    byCat.set(
      c,
      seed ? shuffleDeterministic(list, (seed ^ hash(String(c))) >>> 0) : list
    );
  }

  // 4) round-robin kivétel a kategorikus listákból
  const queues = catOrder.map((c) => ({ c, items: byCat.get(c)! }));
  const out: Tea[] = [];
  let cursor = 0;

  while (queues.some((q) => q.items.length)) {
    const q = queues[cursor % queues.length];
    if (q.items.length) out.push(q.items.shift()!);
    cursor++;
  }

  // 5) (opcionális) igazítás sorokhoz: ha kell, itt lehetne még lapokra törni perPage/perRow szerint
  // Jelenleg az elosztás csak a "szétszórást" biztosítja; a lapozás az oldalon történik.

  return out;
}
