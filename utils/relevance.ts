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
  const rec = parseList<Season>(tea.season_recommended);
  if (!rec.length) return 0;
  let best = 0;
  for (const s of rec) {
    if (s === "egész évben") { best = Math.max(best, 25); continue; }
    const d = nearSeason(nowS, s);
    best = Math.max(best, d===0?100 : d===1?50 : d===2?15 : 0);
  }
  return best;
}
function daypartScore(tea: Tea, ctx: RelevanceCtx): number {
  const now = currentDaypart(ctx.hourLocal);
  const rec = parseList<Daypart>(tea.daypart_recommended);
  if (!rec.length) return 0;
  let special = 0;
  if (rec.includes("étkezés_után") && isPostMealPreferred(ctx.hourLocal)) special = Math.max(special, 25);
  if (rec.includes("lefekvés_előtt")) {
    const h = ctx.hourLocal ?? 12;
    if (h >= 21 || h <= 1) special = Math.max(special, 30);
  }
  if (rec.includes("bármikor")) return Math.max(15, special);
  const neighbors: Record<Daypart, Daypart[]> = {
    reggel:["délelőtt"],
    délelőtt:["reggel","kora_délután"],
    kora_délután:["délelőtt","délután","étkezés_után"],
    délután:["kora_délután","este","étkezés_után"],
    este:["délután","lefekvés_előtt","étkezés_után"],
    lefekvés_előtt:["este"],
    étkezés_után:["kora_délután","délután","este"],
    bármikor:[]
  };
  const exact = rec.includes(now) ? 40 : 0;
  const neighbor = exact ? 0 : (neighbors[now]?.some(n => rec.includes(n)) ? 20 : 0);
  return Math.max(exact + neighbor, special);
}
function servingScore(tea: Tea, ctx: RelevanceCtx): number {
  const s = getSeasonFromISO(ctx.seedISODate);
  const icedOK = tea.serve_iced==="TRUE" || tea.serve_coldbrew==="TRUE";
  const hotOK  = tea.serve_hot==="TRUE" || tea.serve_lukewarm==="TRUE";
  if (s === "nyár") { if (icedOK) return 25; if (!hotOK) return -10; }
  else if (s === "tél") { if (hotOK) return 15; if (icedOK) return -10; }
  else { if (icedOK || hotOK) return 8; }
  return 0;
}
function caffeineScore(tea: Tea, ctx: RelevanceCtx): number {
  const c = tea.caffeine_pct ?? 0;
  const h = ctx.hourLocal ?? 12;
  if (h <= 11) return Math.min(30, Math.round(c * 0.3));
  if (h >= 17) return -Math.min(100, Math.round(c * 1.0));
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