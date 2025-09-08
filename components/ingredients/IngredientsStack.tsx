import React from 'react';
import { Ingredient } from '../../src/types/tea';

interface Props {
  ingredients: Ingredient[];
  colorScale: Record<string, string>;
}

export default function IngredientsStack({ ingredients, colorScale }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex text-xs font-medium">
        {ingredients.map((ing) => (
          <div
            key={ing.name}
            className="text-center"
            style={{ width: `${ing.rate}%` }}
          >
            {ing.name}
          </div>
        ))}
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden"
        role="progressbar"
        aria-label="Hozzávalók aránya"
      >
        {ingredients.map((ing) => (
          <div
            key={ing.name}
            className="h-4"
            style={{ width: `${ing.rate}%`, backgroundColor: colorScale[ing.name] }}
          />
        ))}
      </div>
      <div className="flex text-xs">
        {ingredients.map((ing) => (
          <div
            key={ing.name}
            className="text-center"
            style={{ width: `${ing.rate}%` }}
          >
            {ing.rate}%
          </div>
        ))}
      </div>
    </div>
  );
}