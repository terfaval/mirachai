import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import TeaGrid from '../components/TeaGrid';

// ensure legacy JSX runtime has React in scope
(globalThis as any).React = React;

describe('TeaGrid pagination', () => {
  it('renders dots when >9 teas', () => {
    const teas = Array.from({ length: 20 }).map((_, i) => (
      { id: String(i + 1), name: `T${i}`, category: 'def' } as any
    ));
    const html = renderToStaticMarkup(<TeaGrid allTeas={teas} />);
    const dots = html.match(/aria-label="\d+\. oldal"/g) || [];
    expect(dots.length).toBeGreaterThanOrEqual(3);
  });
});