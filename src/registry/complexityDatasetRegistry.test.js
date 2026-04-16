/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import {
  COMPLEXITY_DATASETS,
  DEFAULT_COMPLEXITY_DATASET,
} from './complexityDatasetRegistry';

describe('COMPLEXITY_DATASETS', () => {
  it('exposes sorting, pathfinding, and searching maps', () => {
    expect(COMPLEXITY_DATASETS.sorting).toBeDefined();
    expect(COMPLEXITY_DATASETS.pathfinding).toBeDefined();
    expect(COMPLEXITY_DATASETS.searching).toBeDefined();
    expect(typeof COMPLEXITY_DATASETS.sorting).toBe('object');
    expect(typeof COMPLEXITY_DATASETS.pathfinding).toBe('object');
    expect(typeof COMPLEXITY_DATASETS.searching).toBe('object');
  });
});

describe('DEFAULT_COMPLEXITY_DATASET', () => {
  it('is a key of COMPLEXITY_DATASETS', () => {
    expect(COMPLEXITY_DATASETS[DEFAULT_COMPLEXITY_DATASET]).toBeDefined();
  });
});
