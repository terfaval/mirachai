import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect } from 'vitest';
import PaginationBar from '../components/PaginationBar';

// ensure legacy JSX runtime has React in scope
(globalThis as any).React = React;

describe('PaginationBar', () => {
  it('renders dots when more than one page', () => {
    const totalPages = 3;
    const html = renderToStaticMarkup(
      <PaginationBar page={1} totalPages={totalPages} onSelect={() => {}} />
    );
    const dots = html.match(/aria-label="\d+\. oldal"/g) || [];
    expect(dots.length).toBe(totalPages);
  });
});