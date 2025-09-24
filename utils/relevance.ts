// utils/relevance.ts
export type Season = "tavasz" | "nyár" | "ősz" | "tél" | "egész évben";
export type Daypart =
  | "reggel" | "délelőtt" | "kora_délután" | "délután"
  | "este" | "lefekvés_előtt" | "étkezés_után" | "bármikor";

export interface Tea {
  id: number;
  name: string;
  caffeine_pct?: number;
  serve_hot?: "TRUE"|"FALSE";
  serve_lukewarm?: "TRUE"|"FALSE";
  serve_iced?: "TRUE"|"FALSE";
  serve_coldbrew?: "TRUE"|"FALSE";
  season_recommended?: string | Season[];
  daypart_recommended?: string | Daypart[];
}

export interface RelevanceCtx {
  seedISODate: string;  // "YYYY-MM-DD"
  hourLocal?: number;   // 0..23
}

function parseList<T extends string>(v?: string | T[]): T[] {
  if (!v) return []; return Array.isArray(v) ? v : v.split(",").map(s=>s.trim()).filter(Boolean) as T[];
}
// --- NORMALIZATION HELPERS ---

// ékezetek eltávolítása, pont/underscore/kötőjel egységesítése
function foldKey(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // remove accents
    .replace(/[.\-]/g, " ")                            // - . -> space
    .replace(/\s+/g, " ")                              // collapse spaces
    .trim();
}

// Daypart aliasok -> kanonikus Daypart
const DAYPART_ALIASES: Record<string, Daypart> = {
  // canonical keys (már fold-olt)
  "reggel": "reggel",
  "delelott": "délelőtt",
  "kora delutan": "kora_délután",
  "delutan": "délután",
  "este": "este",
  "lefekves elott": "lefekvés_előtt",
  "etkezes utan": "étkezés_után",
  "barmikor": "bármikor",

  // közkeletű aliasok
  "egesz nap": "bármikor",
  "egesznap": "bármikor",
  "egesznapos": "bármikor",
  "egesznapon": "bármikor",
  "egesz napon": "bármikor",

  "kora-delutan": "kora_délután",
  "kora_delutan": "kora_délután",

  "lefekves előtt": "lefekvés_előtt",  // vegyes ékezet
  "lefekves-elott": "lefekvés_előtt",
  "lefekves_elott": "lefekvés_előtt",
};

// Season aliasok -> kanonikus Season
const SEASON_ALIASES: Record<string, Season> = {
  "tavasz": "tavasz",
  "nyar": "nyár",
  "osz": "ősz",
  "tel": "tél",
  "egesz evben": "egész évben",
  "egesz ev": "egész évben",
  "egesz evre": "egész évben",
  "egesz év": "egész évben",
};

function parseDayparts(v?: string | Daypart[]): Daypart[] {
  const raw = parseList<string>(v);
  const out: Daypart[] = [];
  for (const s of raw) {
    const k = foldKey(s);
    const norm = DAYPART_ALIASES[k];
    if (norm) out.push(norm);
    // ha már kanonikus formában jött (pl. "délután"), illesszük be:
    else if ((["reggel","délelőtt","kora_délután","délután","este","lefekvés_előtt","étkezés_után","bármikor"] as Daypart[]).includes(s as Daypart)) {
      out.push(s as Daypart);
    }
  }
  return Array.from(new Set(out)); // uniq
}

function parseSeasons(v?: string | Season[]): Season[] {
  const raw = parseList<string>(v);
  const out: Season[] = [];
  for (const s of raw) {
    const k = foldKey(s);
    const norm = SEASON_ALIASES[k];
    if (norm) out.push(norm);
    // ha már kanonikus (pl. "nyár"), hagyjuk
    else if ((["tavasz","nyár","ősz","tél","egész évben"] as Season[]).includes(s as Season)) {
      out.push(s as Season);
    }
  }
  return Array.from(new Set(out)); // uniq
}

// helpers – specificity
function specFactorByCount(k: number, base = 1): number {
  // 1 → 1.00, 2 → 0.88, 3 → 0.76, 4+ → 0.68
  if (k <= 1) return 1 * base;
  if (k === 2) return 0.88 * base;
  if (k === 3) return 0.76 * base;
  return 0.68 * base;
}

function unique<T extends string>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
function getSeasonFromISO(iso: string): Exclude<Season,"egész évben"> {
  const m = new Date(iso + "T12:00:00").getMonth() + 1;
  if (m>=3 && m<=5) return "tavasz";
  if (m>=6 && m<=8) return "nyár";
  if (m>=9 && m<=11) return "ősz";
  return "tél";
}
function nearSeason(a: Exclude<Season,"egész évben">, b: Exclude<Season,"egész évben">) {
  const order = ["tavasz","nyár","ősz","tél"] as const;
  const i = order.indexOf(a), j = order.indexOf(b);
  return Math.min((4+j-i)%4,(4+i-j)%4); // 0..3
}
function currentDaypart(hour?: number): Daypart {
  const h = hour ?? 12;
  if (h < 6)  return "lefekvés_előtt";
  if (h < 10) return "reggel";
  if (h < 12) return "délelőtt";
  if (h < 15) return "kora_délután";
  if (h < 18) return "délután";
  if (h < 22) return "este";
  return "lefekvés_előtt";
}
function isPostMealPreferred(hour?: number) {
  const h = hour ?? 12;
  const windows:[number,number][]= [[7,9],[12,14],[18,20]];
  return windows.some(([a,b]) => h >= a && h <= b + 2);
}

function seasonScore(tea: Tea, ctx: RelevanceCtx): number {
  const nowS = getSeasonFromISO(ctx.seedISODate);
  const recAll = parseSeasons(tea.season_recommended);  // <— ITT
  if (!recAll.length) return 0;

  if (recAll.includes("egész évben")) return 10;

  const rec = unique(recAll as Exclude<Season, "egész évben">[]);
  let bestBase = 0;
  for (const s of rec) {
    const d = nearSeason(nowS, s);
    bestBase = Math.max(bestBase, d === 0 ? 85 : d === 1 ? 45 : d === 2 ? 12 : 0);
  }
  const factor = specFactorByCount(rec.length);
  return Math.round(bestBase * factor);
}

function daypartScore(tea: Tea, ctx: RelevanceCtx): number {
  const now = currentDaypart(ctx.hourLocal);
  const recAll = parseDayparts(tea.daypart_recommended); // <— ITT
  if (!recAll.length) return 0;

  // Speciális bónuszok (nem skálázzuk specificitással)
  let special = 0;
  if (recAll.includes("étkezés_után") && isPostMealPreferred(ctx.hourLocal)) {
    special = Math.max(special, 25);
  }
  if (recAll.includes("lefekvés_előtt")) {
    const h = ctx.hourLocal ?? 12;
    if (h >= 21 || h <= 1) special = Math.max(special, 45);
  }
  if (recAll.includes("bármikor")) {
    return Math.max(8, special);
  }

  const baseSet: Daypart[] = recAll.filter(
    (d): d is Daypart => d !== "étkezés_után" && d !== "lefekvés_előtt" && d !== "bármikor"
  );

  const neighbors: Record<Daypart, ReadonlyArray<Daypart>> = {
    reggel: ["délelőtt"],
    délelőtt: ["reggel","kora_délután"],
    kora_délután: ["délelőtt","délután","étkezés_után"],
    délután: ["kora_délután","este","étkezés_után"],
    este: ["délután","lefekvés_előtt","étkezés_után"],
    lefekvés_előtt: ["este"],
    étkezés_után: ["kora_délután","délután","este"],
    bármikor: []
  };

  const opposites: Record<Daypart, ReadonlyArray<Daypart>> = {
    reggel: ["este","lefekvés_előtt"],
    délelőtt: ["lefekvés_előtt"],
    kora_délután: ["lefekvés_előtt"],
    délután: ["lefekvés_előtt"],
    este: ["reggel"],
    lefekvés_előtt: ["reggel","délelőtt","kora_délután"],
    étkezés_után: [],
    bármikor: []
  };

  const exact = baseSet.includes(now) ? 60 : 0;
  const neighbor = exact ? 0 : ((neighbors[now] ?? []).some(n => baseSet.includes(n)) ? 12 : 0);
  const oppositeHit = (opposites[now] ?? []).some(n => baseSet.includes(n));
  const oppositePenalty = oppositeHit ? -40 : 0;

  const specFactor = specFactorByCount(baseSet.length);
  const base = Math.round((exact + neighbor + oppositePenalty) * specFactor);

  return Math.max(base, special);
}

function servingScore(tea: Tea, ctx: RelevanceCtx): number {
  const s = getSeasonFromISO(ctx.seedISODate);
  const h = ctx.hourLocal ?? 12;
  const icedOK = tea.serve_iced === "TRUE" || tea.serve_coldbrew === "TRUE";
  const hotOK  = tea.serve_hot === "TRUE" || tea.serve_lukewarm === "TRUE";

  // Este (20:00+): forró preferált
  if (h >= 20 || h < 6) {
    if (hotOK) return 12;
    if (icedOK) return -12;
  }

  // Nappali: szezon szerinti preferencia
  if (s === "nyár") {
    if (icedOK) return 25;
    if (!hotOK) return -10;
  } else if (s === "tél") {
    if (hotOK) return 15;
    if (icedOK) return -10;
  } else {
    if (icedOK || hotOK) return 8;
  }
  return 0;
}
function caffeineScore(tea: Tea, ctx: RelevanceCtx): number {
  const c = tea.caffeine_pct ?? 0;
  const h = ctx.hourLocal ?? 12;

  // Reggel: enyhe plusz koffeinre
  if (h <= 11) return Math.min(30, Math.round(c * 0.3));

  // Este: nagy bünti, koffeinmentes külön jutalom
  if (h >= 17) {
    if (c === 0) return 30;                       // esti 0% bónusz
    return -Math.min(150, Math.round(c * 1.5));   // brutál bünti
  }
  return 0;
}
export function computeRelevance(tea: Tea, ctx: RelevanceCtx): number {
  let s = 0;
  s += seasonScore(tea, ctx);
  s += daypartScore(tea, ctx);
  s += servingScore(tea, ctx);
  s += caffeineScore(tea, ctx);
  return s;
}
export function tieBreak(a: Tea, b: Tea) {
  const by = (a.name || "").localeCompare(b.name || "", "hu", { sensitivity: "base" });
  return by !== 0 ? by : (a.id - b.id);
}