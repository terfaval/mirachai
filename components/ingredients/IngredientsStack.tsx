import React, { useState } from 'react';
import { Ingredient } from '../../src/types/tea';

interface Props {
  ingredients: Ingredient[];
  colorScale: Record<string, string>;
}

function CupIcon({ selected }: { selected: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={selected ? 'text-black' : 'text-gray-400'}
    >
      <path d="M5 3h14v10a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V3z" />
      <path d="M21 8h1a3 3 0 0 1 0 6h-1" />
    </svg>
  );
}

function KettleIcon({ selected }: { selected: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={selected ? 'text-black' : 'text-gray-400'}
    >
      <path d="M3 19h18l-1-11H4l-1 11z" />
      <path d="M7 8V5h10v3" />
    </svg>
  );
}

export default function IngredientsStack({ ingredients, colorScale }: Props) {
  return (
    <div className="space-y-4">
      {ingredients.map((ing) => (
        <IngredientRow key={ing.name} ingredient={ing} color={colorScale[ing.name]} />
      ))}
    </div>
  );
}

function IngredientRow({ ingredient, color }: { ingredient: Ingredient; color: string }) {
  const [mode, setMode] = useState<'cup' | 'kettle' | null>(null);
  const toggle = (m: 'cup' | 'kettle') => setMode((prev) => (prev === m ? null : m));
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{ingredient.name}</div>
        <div className="flex gap-2">
          <button
            aria-label="1 adag"
            onClick={() => toggle('cup')}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <CupIcon selected={mode === 'cup'} />
          </button>
          <button
            aria-label="4 adag"
            onClick={() => toggle('kettle')}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <KettleIcon selected={mode === 'kettle'} />
          </button>
        </div>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-2"
        role="progressbar"
        aria-valuenow={ingredient.rate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${ingredient.name} arány`}
      >
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${ingredient.rate}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs mt-1">{ingredient.rate}%</div>
      {mode && (
        <div className="text-xs mt-2">{mode === 'cup' ? '1 ek' : '4 ek'}</div>
      )}
    </div>
  );
}