export type CategoryColor = {
  category: string;
  main: string;
  light: string;
  dark: string;
  complementary: string;
  alternative: string;
  white: string;
};

const colorScale: CategoryColor[] = [
  { category: "Álom Kapu", main:"#C8B8DB", light:"#E5DEED", dark:"#2D1E3E", complementary:"#CBDBB8", alternative:"#D9B8DB", white:"#FFFFFF" },
  { category: "Afrika Frissességei", main:"#E26B39", light:"#F7DFD4", dark:"#521F0A", complementary:"#39B0E2", alternative:"#E2BC39", white:"#FFFFFF" },
  { category: "Évszakok Zamata", main:"#6DA544", light:"#E4EFDC", dark:"#2B421A", complementary:"#7C44A5", alternative:"#44A54A", white:"#FFFFFF" },
  // … folytasd a saját palettáddal
];

export function getCategoryColors(name: string) {
  return colorScale.find(c => c.category === name) ?? {
    category: name,
    main: "#DDD",
    light: "#F5F5F5",
    dark: "#333",
    complementary: "#DDD",
    alternative: "#EEE",
    white: "#FFFFFF"
  };
}
