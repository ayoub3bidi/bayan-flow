/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { Worker } from 'node:worker_threads';
import { describe, it, expect, vi, afterAll } from 'vitest';
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
const HANG_LIMIT_MS = 20_000;

/**
 * Generators run synchronously, so Vitest's own timeout can never fire on an
 * infinite loop. A watchdog thread kills the test process instead, naming the
 * case, so the run fails in seconds rather than hanging CI.
 */
const watchdogMemory = new SharedArrayBuffer(8 + 256);
const watchdogState = new Int32Array(watchdogMemory, 0, 2); // [case number, running]
const watchdogLabel = new Uint8Array(watchdogMemory, 8, 256);
const watchdog = new Worker(
  `
  const { workerData } = require('node:worker_threads');
  const state = new Int32Array(workerData.memory, 0, 2);
  const label = new Uint8Array(workerData.memory, 8, 256);
  let seen = -1;
  let since = Date.now();
  setInterval(() => {
    const caseNumber = Atomics.load(state, 0);
    if (!Atomics.load(state, 1) || caseNumber !== seen) {
      seen = caseNumber;
      since = Date.now();
      return;
    }
    if (Date.now() - since > workerData.limitMs) {
      const name = Buffer.from(label).toString('utf8').replace(/\\0[\\s\\S]*$/, '');
      require('node:fs').writeSync(
        2,
        '\\nGenerator did not terminate within ' + workerData.limitMs / 1000 + ' s: ' + name + '\\n'
      );
      process.kill(process.pid, 'SIGKILL');
    }
  }, 250);
  `,
  { eval: true, workerData: { memory: watchdogMemory, limitMs: HANG_LIMIT_MS } }
);
watchdog.unref();
afterAll(() => watchdog.terminate());

function underWatchdog(label, fn) {
  watchdogLabel.fill(0);
  watchdogLabel.set(new TextEncoder().encode(label).subarray(0, 255));
  Atomics.add(watchdogState, 0, 1);
  Atomics.store(watchdogState, 1, 1);
  try {
    return fn();
  } finally {
    Atomics.store(watchdogState, 1, 0);
  }
}

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
  const label = `${key} @ ${size}${scenarioId ? ` / ${scenarioId}` : ''}`;
  return underWatchdog(label, () => {
    const input = runner.input?.(size);
    const startedAt = performance.now();
    const { result, unmount } = renderHook(() =>
      runner.useRun(key, size, scenarioId, input)
    );
    const elapsed = performance.now() - startedAt;
    const { steps } = result.current;
    unmount();
    return { steps, elapsed };
  });
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
