/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { CATEGORY_CONFIG } from './categoryConfig';
import { isNodeLinkSearchingAlgorithm } from './searchingSubstrate';
import {
  ALGORITHM_TYPES,
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
  DEFAULT_ARRAY_SIZE,
  DEFAULT_GRID_SIZE,
  DEFAULT_SEARCH_GRAPH_NODE_COUNT,
  DEFAULT_TREE_NODE_COUNT,
  DEFAULT_GRAPH_NODE_COUNT,
  SEARCH_GRAPH_NODE_COUNT,
} from '../constants';
import { getExportTiming } from '../video/constants';
import { useSortingVisualization } from '../hooks/useSortingVisualization';
import { usePathfindingVisualization } from '../hooks/usePathfindingVisualization';
import { useSearchingVisualization } from '../hooks/useSearchingVisualization';
import { useTreeTraversalVisualization } from '../hooks/useTreeTraversalVisualization';
import { useGraphAlgorithmVisualization } from '../hooks/useGraphAlgorithmVisualization';

// Run the real generators: the global setup stubs constants and grid helpers.
vi.mock('../constants', async importOriginal => importOriginal());
vi.mock('../constants/index.js', async importOriginal => importOriginal());
vi.mock('../utils/gridHelpers', async importOriginal => importOriginal());
vi.mock('../utils/gridHelpers.js', async importOriginal => importOriginal());

const SPEED = ANIMATION_SPEEDS.MEDIUM;
const MODE = VISUALIZATION_MODES.MANUAL;
const MAX_GENERATION_MS = 3000;

/**
 * Calls each category hook like VisualizerApp does. Inputs are built once per
 * case (like app state), never inside the render.
 */
const RUNNERS = {
  [ALGORITHM_TYPES.SORTING]: {
    defaultSize: DEFAULT_ARRAY_SIZE,
    input: size => CATEGORY_CONFIG[ALGORITHM_TYPES.SORTING].generateData(size),
    useRun: (key, size, _scenarioId, array) =>
      useSortingVisualization(key, array, SPEED, MODE),
  },
  [ALGORITHM_TYPES.PATHFINDING]: {
    defaultSize: DEFAULT_GRID_SIZE,
    useRun: (key, size) => usePathfindingVisualization(key, size, SPEED, MODE),
  },
  [ALGORITHM_TYPES.SEARCHING]: {
    defaultSize: DEFAULT_ARRAY_SIZE,
    input: size =>
      CATEGORY_CONFIG[ALGORITHM_TYPES.SEARCHING].generateData(size),
    useRun: (key, size, _scenarioId, array) =>
      useSearchingVisualization(
        key,
        array,
        SPEED,
        MODE,
        isNodeLinkSearchingAlgorithm(key)
          ? Math.min(
              Math.max(size, SEARCH_GRAPH_NODE_COUNT.min),
              SEARCH_GRAPH_NODE_COUNT.max
            )
          : DEFAULT_SEARCH_GRAPH_NODE_COUNT
      ),
  },
  [ALGORITHM_TYPES.TREE_TRAVERSAL]: {
    defaultSize: DEFAULT_TREE_NODE_COUNT,
    useRun: (key, size) =>
      useTreeTraversalVisualization(key, SPEED, MODE, size),
  },
  [ALGORITHM_TYPES.GRAPH_ALGORITHM]: {
    defaultSize: DEFAULT_GRAPH_NODE_COUNT,
    useRun: (key, size, scenarioId = null) =>
      useGraphAlgorithmVisualization(key, SPEED, MODE, size, scenarioId),
  },
};

function sizesFor(config, defaultSize) {
  const control = config.sizeControl;
  const sizes =
    control.type === 'slider' ? [control.min, control.max] : control.options;
  return [...new Set([...sizes, defaultSize])];
}

function generate(runner, key, size, scenarioId) {
  const input = runner.input?.(size);
  const startedAt = performance.now();
  const { result, unmount } = renderHook(() =>
    runner.useRun(key, size, scenarioId, input)
  );
  const elapsed = performance.now() - startedAt;
  const { steps } = result.current;
  unmount();
  return { steps, elapsed };
}

describe('every registered algorithm generates steps through its category hook', () => {
  Object.values(ALGORITHM_TYPES).forEach(type => {
    const config = CATEGORY_CONFIG[type];
    const runner = RUNNERS[type];

    it(`has a smoke-test runner for "${type}"`, () => {
      expect(runner).toBeDefined();
    });
    if (!runner) return;

    config.algorithmKeys.forEach(key => {
      it(`${type} / ${key}: terminates at every size and exports at the default size`, () => {
        for (const size of sizesFor(config, runner.defaultSize)) {
          const { steps, elapsed } = generate(runner, key, size);
          expect(steps.length, `${key} @ ${size}`).toBeGreaterThan(0);
          expect(elapsed, `${key} @ ${size}`).toBeLessThan(MAX_GENERATION_MS);

          if (size === runner.defaultSize) {
            expect(
              getExportTiming(steps.length).exceedsLimit,
              `${key} default export length`
            ).toBe(false);
          }
        }

        if (type === ALGORITHM_TYPES.GRAPH_ALGORITHM) {
          const { result, unmount } = renderHook(() =>
            runner.useRun(key, runner.defaultSize)
          );
          const scenarios = result.current.scenarioOptions;
          unmount();
          for (const { id } of scenarios) {
            const { steps } = generate(runner, key, runner.defaultSize, id);
            expect(steps.length, `${key} / ${id}`).toBeGreaterThan(0);
          }
        }
      });
    });
  });
});
