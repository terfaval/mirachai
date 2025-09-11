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
});