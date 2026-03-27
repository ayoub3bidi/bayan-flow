/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { CATEGORY_CONFIG } from './categoryConfig';
import { ALGORITHM_TYPES } from '../constants';

describe('CATEGORY_CONFIG', () => {
  it('has an entry for every ALGORITHM_TYPE', () => {
    Object.values(ALGORITHM_TYPES).forEach(type => {
      expect(
        CATEGORY_CONFIG[type],
        `Missing CATEGORY_CONFIG entry for type "${type}"`
      ).toBeDefined();
    });
  });

  describe('each entry', () => {
    Object.values(ALGORITHM_TYPES).forEach(type => {
      describe(`"${type}"`, () => {
        it('has a non-empty defaultAlgorithm string', () => {
          expect(typeof CATEGORY_CONFIG[type].defaultAlgorithm).toBe('string');
          expect(CATEGORY_CONFIG[type].defaultAlgorithm.length).toBeGreaterThan(
            0
          );
        });

        it('has a non-empty i18nPrefix string', () => {
          expect(typeof CATEGORY_CONFIG[type].i18nPrefix).toBe('string');
          expect(CATEGORY_CONFIG[type].i18nPrefix.length).toBeGreaterThan(0);
        });

        it('getAlgorithmFn returns a function for the defaultAlgorithm', () => {
          const { getAlgorithmFn, defaultAlgorithm } = CATEGORY_CONFIG[type];
          const fn = getAlgorithmFn(defaultAlgorithm);
          expect(typeof fn).toBe('function');
        });

        it('getAlgorithmFn returns undefined for an unknown key', () => {
          const fn = CATEGORY_CONFIG[type].getAlgorithmFn('__nonexistent__');
          expect(fn).toBeUndefined();
        });

        it('generateData returns a non-null value', () => {
          const data = CATEGORY_CONFIG[type].generateData();
          expect(data).not.toBeNull();
          expect(data).not.toBeUndefined();
        });

        it('generateData accepts a custom size', () => {
          const data = CATEGORY_CONFIG[type].generateData(5);
          expect(data).toBeDefined();
        });

        it('has sizeBinding "array" or "grid"', () => {
          expect(['array', 'grid']).toContain(
            CATEGORY_CONFIG[type].sizeBinding
          );
        });

        it('has complexityDataset sorting or pathfinding', () => {
          expect(['sorting', 'pathfinding']).toContain(
            CATEGORY_CONFIG[type].complexityDataset
          );
        });
      });
    });
  });
});
