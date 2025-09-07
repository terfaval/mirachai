import { accentFold } from './normalize';

export const SYN_RAW: Record<string, string> = {
  "citromhéj": "citromhej",
  "citrom hej": "citromhej",
  "rózsa": "rozsa",
  "rózsaszirom": "rozsa",
  "black": "fekete",
  "green": "zold",
  "chai": "chai",
  "pirított": "porkolt",
  "porkolt": "porkolt",
  "jeges": "jeges",
  "iced": "jeges",
  "jegest": "jeges",
  "pikans": "csipos"
};

export const SYN: Record<string, string> = Object.fromEntries(
  Object.entries(SYN_RAW).map(([k, v]) => [accentFold(k), accentFold(v)])
);

export const mapSyn = (t: string) => SYN[accentFold(t)] ?? accentFold(t);