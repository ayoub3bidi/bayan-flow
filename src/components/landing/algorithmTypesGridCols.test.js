/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { getAlgorithmTypesGridColsClass } from './algorithmTypesGridCols.js';

describe('getAlgorithmTypesGridColsClass', () => {
  it('returns two-column layout for two modes', () => {
    expect(getAlgorithmTypesGridColsClass(2)).toBe('md:grid-cols-2');
  });

  it('returns two- and three-column layout for three modes', () => {
    expect(getAlgorithmTypesGridColsClass(3)).toBe(
      'md:grid-cols-2 lg:grid-cols-3'
    );
  });

  it('returns layout with xl four-column for four or more modes', () => {
    expect(getAlgorithmTypesGridColsClass(4)).toBe(
      'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    );
    expect(getAlgorithmTypesGridColsClass(10)).toBe(
      'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    );
  });
});
