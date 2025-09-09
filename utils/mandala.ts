// utils/mandala.ts
// Kategória → SVG fájl explicit mapping (public/ gyökérből szolgálva)

export type TeaCategory =
  | "Álom Kapu"
  | "Afrika Frissessége"
  | "Évszakok Zamata"
  | "Európai Gyógyfüvek"
  | "Andoki Lendület"
  | "Finom Védelem"
  | "Csendes Idő"
  | "Tiszta Fókusz"
  | "Indiai Chai"
  | "Hűs Kortyok"
  | "Japán Zöld"
  | "Közel-Kelet Illata"
  | "Kínai Klasszikus";

const MAP: Record<TeaCategory, string> = {
  "Álom Kapu":            "/Mandala_Alom_Kapu.svg",
  "Afrika Frissessége":  "/Mandala_Szavannai_Frissesseg.svg",
  "Évszakok Zamata":      "/Mandala_Evszakok_Zamata.svg",
  "Európai Gyógyfüvek":   "/Mandala_Europai_Gyogyfuvek.svg",
  "Andoki Lendület":      "/Mandala_Andoki_Lendulet.svg",
  "Finom Védelem":        "/Mandala_Finom_Vedelem.svg",
  "Csendes Idő":          "/Mandala_Csendes_Ido.svg",
  "Tiszta Fókusz":        "/Mandala_Tiszta_Fokusz.svg",
  "Indiai Chai":          "/Mandala_Indiai_Chai.svg",
  "Hűs Kortyok":          "/Mandala_Husito_Kortyok.svg",
  "Japán Zöld":           "/Mandala_Japan_Zold.svg",
  "Közel-Kelet Illata":   "/Mandala_Kozel-Kelet_Illata.svg",
  "Kínai Klasszikus":     "/Mandala_Kinai_Klasszikusok.svg",
};

const FALLBACK = "/Mandala.svg";

export function getMandalaPath(category: string): string {
  return (MAP as Record<string, string>)[category] ?? FALLBACK;
}
