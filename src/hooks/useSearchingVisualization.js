/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  ELEMENT_STATES,
  ALGORITHM_TYPES,
  VISUALIZATION_MODES,
} from '../constants/index.js';
import { soundManager } from '../utils/soundManager.js';
import { useVisualization } from './useVisualization.js';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';

function pickTargetFromArray(arr) {
  if (!arr?.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Visualization controller for searching algorithms on a sorted array.
 *
 * @param {string} algorithmKey
 * @param {number[]} initialArray — sorted ascending (see CATEGORY_CONFIG.generateData)
 * @param {number} speed
 * @param {string} mode
 */
export function useSearchingVisualization(
  algorithmKey,
  initialArray,
  speed,
  mode = VISUALIZATION_MODES.MANUAL
) {
  const [array, setArray] = useState(initialArray);
  const [states, setStates] = useState(() =>
    Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT)
  );
  const [targetValue, setTargetValue] = useState(null);

  const executeStep = useCallback(step => {
    setArray(step.array);
    setStates(step.states);
    if (step.targetValue !== undefined && step.targetValue !== null) {
      setTargetValue(step.targetValue);
    }

    const hasComparing = step.states.includes(ELEMENT_STATES.COMPARING);
    if (hasComparing) {
      const idx = step.states.indexOf(ELEMENT_STATES.COMPARING);
      soundManager.playCompare(step.array[idx]);
    }
  }, []);

  const engine = useVisualization({ executeStep, speed, mode });

  const loadStepsForCurrentAlgorithm = useCallback(() => {
    setArray(initialArray);
    setStates(Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT));

    if (!algorithmKey || !initialArray?.length) {
      setTargetValue(null);
      engine.loadSteps([]);
      return;
    }

    const target = pickTargetFromArray(initialArray);
    setTargetValue(target);

    const fn =
      CATEGORY_CONFIG[ALGORITHM_TYPES.SEARCHING].getAlgorithmFn(algorithmKey);
    if (fn && target !== null) {
      engine.loadSteps(fn(initialArray, target));
      return;
    }

    engine.loadSteps([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, initialArray]);

  useEffect(() => {
    loadStepsForCurrentAlgorithm();
  }, [loadStepsForCurrentAlgorithm]);

  return {
    array,
    states,
    targetValue,
    reloadSteps: loadStepsForCurrentAlgorithm,
    ...engine,
  };
}
