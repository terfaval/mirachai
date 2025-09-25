import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import IngredientsStack from '@/components/ingredients/IngredientsStack';

describe('IngredientsStack', () => {
  it('normalizes ingredient rates to a full 100% width', () => {
    const html = renderToStaticMarkup(
      <IngredientsStack
        ingredients={[
          { name: 'a', rate: 30 },
          { name: 'b', rate: 20 },
          { name: 'c', rate: 10 },
        ]}
      />
    );
    const widths = Array.from(html.matchAll(/width:([^%;]+)%/g)).map(m => parseFloat(m[1]));
    const sum = widths.reduce((a, b) => a + b, 0);
    expect(Math.round(sum)).toBe(100);
  });

it('reorders ingredients to avoid adjacent identical colors', () => {
    const html = renderToStaticMarkup(
      <IngredientsStack
        ingredients={[
          { name: 'foo', rate: 1 },
          { name: 'bar', rate: 1 },
          { name: 'almahéj', rate: 1 }, // ismert összetevő más színnel
        ]}
      />
    );
    const colors = Array.from(
      html.matchAll(/background-color:([^;]+);/g)
    ).map((m) => m[1]);
    for (let i = 0; i < colors.length - 1; i++) {
      expect(colors[i]).not.toBe(colors[i + 1]);
    }
  });
});