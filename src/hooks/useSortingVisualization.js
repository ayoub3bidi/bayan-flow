/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ELEMENT_STATES,
  ALGORITHM_TYPES,
  VISUALIZATION_MODES,
} from '../constants/index.js';
import { useVisualization } from './useVisualization.js';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';

/**
 * Thin adapter around useVisualization for sorting algorithms.
 * Owns array + element-states domain state for sorting visualization.
 * All playback logic (play, pause, reset, step navigation, autoplay loop)
 * lives in useVisualization.
 *
 * @param {string} algorithmKey  - Key of the active sorting algorithm.
 * @param {Array}  initialArray  - The array to sort.
 * @param {number} speed         - Autoplay delay in ms.
 * @param {string} mode          - VISUALIZATION_MODES.AUTOPLAY | MANUAL.
 */
export function useSortingVisualization(
  algorithmKey,
  initialArray,
  speed,
  mode = VISUALIZATION_MODES.MANUAL
) {
  const [array, setArray] = useState(initialArray);
  const [states, setStates] = useState(() =>
    Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT)
  );

  // ── Category-specific step executor ────────────────────────────────────────────
  const executeStep = useCallback(step => {
    setArray(step.array);
    setStates(step.states);
  }, []);

  // ── Shared playback engine ──────────────────────────────────────────────────
  const soundContext = useMemo(
    () => ({ algorithmType: ALGORITHM_TYPES.SORTING, algorithmKey }),
    [algorithmKey]
  );
  const engine = useVisualization({ executeStep, speed, mode, soundContext });

  // ── Step loading — owned by this hook ──────────────────────────────────────
  /**
   * Reload steps for the current algorithmKey + array.
   * Stable reference: recreates only when algorithmKey or initialArray changes.
   */
  const loadStepsForCurrentAlgorithm = useCallback(() => {
    setArray(initialArray);
    setStates(Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT));

    if (!algorithmKey || !initialArray?.length) {
      engine.loadSteps([]);
      return;
    }
    const fn =
      CATEGORY_CONFIG[ALGORITHM_TYPES.SORTING].getAlgorithmFn(algorithmKey);
    if (fn) {
      engine.loadSteps(fn(initialArray));
      return;
    }

    engine.loadSteps([]);
    // Omitted `engine` from deps: `engine.loadSteps` is stable (useCallback in
    // useVisualization); listing `engine` would recreate this callback every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, initialArray]);

  useEffect(() => {
    loadStepsForCurrentAlgorithm();
  }, [loadStepsForCurrentAlgorithm]);

  return {
    // Sorting-specific domain state
    array,
    states,
    // Re-runs step loading for the current algorithm + initialArray from props (no new random data).
    reloadSteps: loadStepsForCurrentAlgorithm,
    // Shared playback engine (steps, isPlaying, isComplete, currentStep, …)
    ...engine,
  };
}
