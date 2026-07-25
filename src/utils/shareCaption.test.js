/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { generateShareCaption } from './shareCaption';

describe('generateShareCaption', () => {
  it('returns correct metadata for sorting algorithm', () => {
    const result = generateShareCaption('Bubble Sort');

    expect(result.title).toBe('Bubble Sort Visualization — Bayan Flow');
    expect(result.caption).toBe(
      'Bubble Sort Algorithm. Step-by-step visualization from Bayan Flow.'
    );
    expect(result.fullShareText).toContain('Bubble Sort Algorithm.');
    expect(result.fullShareText).toContain('bayanflow.com/app');
  });

  it('returns correct metadata for pathfinding algorithm', () => {
    const result = generateShareCaption('A* Search');

    expect(result.caption).toBe(
      'A* Search Algorithm. Step-by-step visualization from Bayan Flow.'
    );
  });

  it('returns correct metadata for tree traversal', () => {
    const result = generateShareCaption('In-order Traversal');

    expect(result.caption).toBe(
      'In-order Traversal Algorithm. Step-by-step visualization from Bayan Flow.'
    );
  });

  it('returns correct metadata for graph algorithm', () => {
    const result = generateShareCaption("Dijkstra's");

    expect(result.caption).toBe(
      "Dijkstra's Algorithm. Step-by-step visualization from Bayan Flow."
    );
  });

  it('returns correct metadata for searching algorithm', () => {
    const result = generateShareCaption('Binary Search');

    expect(result.caption).toBe(
      'Binary Search Algorithm. Step-by-step visualization from Bayan Flow.'
    );
  });

  it('falls back gracefully with null input', () => {
    const result = generateShareCaption(null);

    expect(result.title).toBe('Algorithm Visualization — Bayan Flow');
    expect(result.caption).toBe(
      'Algorithm. Step-by-step visualization from Bayan Flow.'
    );
    expect(result.fullShareText).toContain('bayanflow.com');
  });

  it('falls back gracefully with empty string', () => {
    const result = generateShareCaption('');

    expect(result.title).toBe('Algorithm Visualization — Bayan Flow');
    expect(result.caption).toBe(
      'Algorithm. Step-by-step visualization from Bayan Flow.'
    );
  });

  it('does not double "Algorithm" when name already ends with it', () => {
    const result = generateShareCaption('Topological Sort Algorithm');

    expect(result.caption).toBe(
      'Topological Sort Algorithm. Step-by-step visualization from Bayan Flow.'
    );
  });
});
