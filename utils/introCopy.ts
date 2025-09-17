export type IntroCopy = {
  h1: string;
  lead: string;
};

const DEFAULT_INTRO_COPY: IntroCopy = {
  h1: 'Teaidő',
  lead: 'Kezdjük el az elkészítést lépésről lépésre.',
};

const FALLBACK_INTRO_COPIES: IntroCopy[] = [
  {
    h1: 'Mirāchai – a te szertartásod',
    lead: 'Lépj be a lassú teafőzés univerzumába – minden csészéhez személyre szabott útmutatóval.',
  },
  {
    h1: 'Tea, ami történetet mesél',
    lead: 'Kapcsolódj a történetekhez és színekhez – mi végigkísérünk az első kortytól az utolsóig.',
  },
  {
    h1: 'Nagyszerű választás!',
    lead: 'Kísérlek végig az elkészítésen – pár kattintás és indul a teázás.',
  },
  {
    h1: 'Kiváló döntés!',
    lead: 'Beállítjuk a módszert és a mennyiséget, aztán jönnek a pontos lépések.',
  },
  {
    h1: 'Fedezd fel a Mirāchai világát',
    lead: 'Minden részletet kiszámolok: víz, idő, arányok és eszközök a tökéletes csészéhez.',
  },
];

const M32_DENOMINATOR = 4294967296; // 2^32

const mulberry32 = (seed: number) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / M32_DENOMINATOR;
  };
};

const hashString = (value: string): number => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return hash >>> 0;
};

const toSeed = (teaId: number | string): number => {
  if (typeof teaId === 'number' && Number.isFinite(teaId)) {
    return teaId;
  }

  const asNumber = Number(teaId);
  if (Number.isFinite(asNumber)) {
    return asNumber;
  }

  return hashString(String(teaId));
};

const sanitizeCopies = (copies?: IntroCopy[] | null): IntroCopy[] => {
  if (!Array.isArray(copies)) {
    return [];
  }

  return copies.filter((copy): copy is IntroCopy => {
    if (!copy) return false;
    const { h1, lead } = copy;
    return typeof h1 === 'string' && h1.trim().length > 0 && typeof lead === 'string' && lead.trim().length > 0;
  });
};

export function pickIntroCopy(teaId: number | string, texts?: IntroCopy[]): IntroCopy {
  const source = sanitizeCopies(texts);
  const pool = source.length ? source : FALLBACK_INTRO_COPIES;

  if (!pool.length) {
    return DEFAULT_INTRO_COPY;
  }

  const rng = mulberry32(toSeed(teaId));
  const index = Math.floor(rng() * pool.length);
  const choice = pool[index] ?? pool[0];

  if (!choice) {
    return DEFAULT_INTRO_COPY;
  }

  const h1 = typeof choice.h1 === 'string' && choice.h1.trim().length > 0 ? choice.h1 : DEFAULT_INTRO_COPY.h1;
  const lead = typeof choice.lead === 'string' && choice.lead.trim().length > 0 ? choice.lead : DEFAULT_INTRO_COPY.lead;

  return { h1, lead };
}