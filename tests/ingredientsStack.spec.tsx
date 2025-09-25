import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import IngredientsStack from '@/components/ingredients/IngredientsStack';
import type { PerIngredientTk } from 'lib/teaScaling';

describe('IngredientsStack', () => {
  const sampleItems: PerIngredientTk[] = [
    { name: 'a', percent: 30, tk: 0.75, tkRounded: 0.75 },
    { name: 'b', percent: 20, tk: 0.5, tkRounded: 0.5 },
    { name: 'c', percent: 10, tk: 0.25, tkRounded: 0.25 },
  ];

  it('normalizes ingredient rates to a full 100% width', () => {
    const html = renderToStaticMarkup(
      <IngredientsStack items={sampleItems} />
    );
    const widths = Array.from(html.matchAll(/width:([^%;]+)%/g)).map((m) => parseFloat(m[1]));
    const sum = widths.reduce((a, b) => a + b, 0);
    expect(Math.round(sum)).toBe(100);
  });

  it('renders teaspoon labels without percentages', () => {
    const html = renderToStaticMarkup(
      <IngredientsStack items={sampleItems} />
    );
    const labels = Array.from(html.matchAll(/~([^<]+) tk/g)).map((m) => m[0]);
    expect(labels.length).toBeGreaterThanOrEqual(sampleItems.length);
    const textOnly = html.replace(/style="[^"]*"/g, "");
    expect(textOnly).not.toMatch(/%/);
  });
});