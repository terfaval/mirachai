import React from 'react';
import { Ingredient } from '../../src/types/tea';

interface Props {
  ingredients: Ingredient[];
  colorScale: Record<string, string>;
}

export default function IngredientsStack({ ingredients, colorScale }: Props) {
  return (
    <div
      className="w-full flex h-16 rounded-full overflow-hidden"
      role="progressbar"
      aria-label="Hozzávalók aránya"
    >
      {ingredients.map((ing) => (
        <div
          key={ing.name}
          className="relative h-full"
          style={{ width: `${ing.rate}%`, backgroundColor: colorScale[ing.name] }}
        >
          <div className="absolute left-2 top-2 text-white">
            <div className="text-lg font-bold leading-none">
              {Math.round(ing.rate)}%
            </div>
            <div className="text-xs leading-none">{ing.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}