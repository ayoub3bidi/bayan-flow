/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { CATEGORY_CONFIG } from './categoryConfig';
import { ALGORITHM_TYPES } from '../constants';
import { VISUALIZER_REGISTRY } from './visualizerRegistry';
import {
  VIDEO_SCENE_RENDERERS,
  VIDEO_TITLE_FALLBACK,
} from './videoSceneRegistry';
import { COMPLEXITY_DATASETS } from './complexityDatasetRegistry';

describe('CATEGORY_CONFIG runtime completeness', () => {
  Object.values(ALGORITHM_TYPES).forEach(type => {
    describe(`"${type}"`, () => {
      const config = CATEGORY_CONFIG[type];

      it('lists every algorithm key exactly once in groupDefs', () => {
        const keys = config.algorithmKeys;
        const flat = config.groupDefs.flatMap(g => g.algorithms);
        expect(flat.length).toBe(keys.length);
        expect(new Set(flat).size).toBe(keys.length);
        expect(new Set(flat)).toEqual(new Set(keys));
      });

      it('has defaultAlgorithm in algorithmKeys', () => {
        expect(config.algorithmKeys).toContain(config.defaultAlgorithm);
      });

      it('has getAlgorithmFn(key) as function for every algorithmKeys entry', () => {
        const { getAlgorithmFn, algorithmKeys } = config;
        algorithmKeys.forEach(key => {
          expect(typeof getAlgorithmFn(key)).toBe('function');
        });
      });

      it('has required UI and feature fields', () => {
        expect(config.algorithmKeys.length).toBeGreaterThan(0);
        expect(config.groupDefs.length).toBeGreaterThan(0);
        expect(typeof config.i18nTabKey).toBe('string');
        expect(config.i18nTabKey.length).toBeGreaterThan(0);
        expect(typeof config.features?.hasDataRefresh).toBe('boolean');
      });

      it('has a valid sizeControl descriptor', () => {
        const sc = config.sizeControl;
        expect(sc.type === 'slider' || sc.type === 'buttons').toBe(true);
        expect(typeof sc.i18nKey).toBe('string');
        expect(sc.i18nKey.length).toBeGreaterThan(0);
        if (sc.type === 'slider') {
          expect(typeof sc.min).toBe('number');
          expect(typeof sc.max).toBe('number');
          expect(typeof sc.step).toBe('number');
        } else {
          expect(Array.isArray(sc.options)).toBe(true);
          expect(sc.options.length).toBeGreaterThan(0);
        }
      });

      it('is wired to visualizer, video, and complexity datasets', () => {
        expect(
          VISUALIZER_REGISTRY[type],
          `VISUALIZER_REGISTRY missing "${type}"`
        ).toBeDefined();
        expect(
          typeof VIDEO_SCENE_RENDERERS[type],
          `VIDEO_SCENE_RENDERERS missing "${type}"`
        ).toBe('function');
        expect(
          VIDEO_TITLE_FALLBACK[type],
          `VIDEO_TITLE_FALLBACK missing "${type}"`
        ).toBeTruthy();
        const dsKey = config.complexityDataset;
        expect(
          COMPLEXITY_DATASETS[dsKey],
          `COMPLEXITY_DATASETS missing "${dsKey}" (from complexityDataset)`
        ).toBeDefined();
      });
    });
  });
});
