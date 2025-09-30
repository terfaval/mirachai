// utils/mandala.ts
// Kategória → SVG fájl explicit mapping (public/teacard_background gyökérből szolgálva)

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

const BASE_PATH = "/teacard_background";

const MAP: Record<TeaCategory, string> = {
  "Álom Kapu":            `${BASE_PATH}/Mandala_Alom_Kapu.svg`,
  "Afrika Frissessége":  `${BASE_PATH}/Mandala_Szavannai_Frissesseg.svg`,
  "Évszakok Zamata":     `${BASE_PATH}/Mandala_Evszakok_Zamata.svg`,
  "Európai Gyógyfüvek":  `${BASE_PATH}/Mandala_Europai_Gyogyfuvek.svg`,
  "Andoki Lendület":     `${BASE_PATH}/Mandala_Andoki_Lendulet.svg`,
  "Finom Védelem":       `${BASE_PATH}/Mandala_Finom_Vedelem.svg`,
  "Csendes Idő":         `${BASE_PATH}/Mandala_Csendes_Ido.svg`,
  "Tiszta Fókusz":       `${BASE_PATH}/Mandala_Tiszta_Fokusz.svg`,
  "Indiai Chai":         `${BASE_PATH}/Mandala_Indiai_Chai.svg`,
  "Hűs Kortyok":         `${BASE_PATH}/Mandala_Husito_Kortyok.svg`,
  "Japán Zöld":          `${BASE_PATH}/Mandala_Japan_Zold.svg`,
  "Közel-Kelet Illata":  `${BASE_PATH}/Mandala_Kozel-Kelet_Illata.svg`,
  "Kínai Klasszikus":    `${BASE_PATH}/Mandala_Kinai_Klasszikusok.svg`,
};

const FALLBACK = `${BASE_PATH}/Mandala.svg`;

export function getMandalaPath(category: string): string {
  return (MAP as Record<string, string>)[category] ?? FALLBACK;
}