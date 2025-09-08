export type Scale1to3 = 1 | 2 | 3;
export type Functions = {
  immun: Scale1to3;
  relax: Scale1to3;
  focus: Scale1to3;
  detox: Scale1to3;
};

export type Ingredient = {
  name: string;
  rate: number; // % (0–100)
};

export type Tea = {
  name: string;
  category: string;
  subcategory: string;
  description: string;
  taste: Record<string, Scale1to3>;
  intensity: Scale1to3;
  functions: Functions;
  ingredients: Ingredient[];
  color: string;
  tempC: number;
  steepMin: string | number;
  serve_hot: boolean;
  serve_lukewarm: boolean;
  serve_iced: boolean;
  serve_coldbrew: boolean;
  descriptionDisplayAsTitanOne?: boolean;
};