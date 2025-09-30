// lib/chef/rules.ts
export const Profiles = {
  mediterran: {
    prefer: ["olívaolaj","paradicsom","hüvelyes","citrom","zöldfűszer","quinoa"],
    avoid: ["vaj_túl_sok","tejszínes_nehezék"],
    superfoods: ["quinoa","chia","tahini","olívabogyó"]
  },
  balkan: {
    prefer: ["padlizsán","paprika","joghurt","bulgur","köles","kapor"],
    superfoods: ["dió","szezám","csicseriliszt"]
  },
  azsiai: {
    prefer: ["lime levél","gyömbér","szójaszósz","rizs","quinoa","koriander"],
    superfoods: ["alga","shiitake","edamame","szezámmag"]
  },
  salata: {
    prefer: ["levelesek","uborka","paprika","avokádó","magvak","hüvelyes","quinoa"],
    superfoods: ["quinoa","csírák","chia","lenmag","dió","tahini"]
  }
} as const;

export const HealthHeuristics = {
  bullets: [
    "több rost", "alacsonyabb zsiradék", "teljes értékű fehérje",
    "kevesebb hozzáadott cukor", "ω-3 zsírsav forrás", "probiotikus elem"
  ],
  reduce: ["vaj", "tejszín", "cukor"],
  encourage: ["hüvelyesek", "teljes értékű gabona", "magvak", "olívaolaj"],
  // preferált komplett-fehérje párosítás jelzés a prompthoz:
  complete_pairs_hint: "Preferáld a komplett fehérjét adó kombinációkat (hüvelyes + gabona)."
} as const;
