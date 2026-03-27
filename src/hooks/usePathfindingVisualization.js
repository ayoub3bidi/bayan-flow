/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  GRID_ELEMENT_STATES,
  ALGORITHM_TYPES,
  VISUALIZATION_MODES,
  DEFAULT_GRID_SIZE,
} from '../constants/index.js';
import {
  generateRandomStartEnd,
  createEmptyGrid,
} from '../utils/gridHelpers.js';
import { soundManager } from '../utils/soundManager.js';
import { useVisualization } from './useVisualization.js';
import { CATEGORY_CONFIG } from '../registry/categoryConfig.js';

/**
 * Thin adapter around useVisualization for pathfinding algorithms.
 * Owns grid + cell-states domain state, start/end positions, and
 * pathfinding-specific sound effects.
 * All playback logic (play, pause, reset, step nav, autoplay) lives in
 * useVisualization.
 *
 * @param {string} algorithmKey - Key of the active pathfinding algorithm.
 * @param {number} gridSize     - Size of the square grid (N×N)
 * @param {number} speed        - Animation delay in ms
 * @param {string} mode         - VISUALIZATION_MODES.AUTOPLAY | MANUAL
 */
export function usePathfindingVisualization(
  algorithmKey,
  gridSize = DEFAULT_GRID_SIZE,
  speed,
  mode = VISUALIZATION_MODES.MANUAL
) {
  const [grid, setGrid] = useState(() => createEmptyGrid(gridSize, gridSize));
  const [states, setStates] = useState(() =>
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(GRID_ELEMENT_STATES.DEFAULT))
  );
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  // ── Category-specific step executor ────────────────────────────────────────
  const executeStep = useCallback(step => {
    setGrid(step.grid);
    setStates(step.states);

    const hasOpen = step.states.some(row =>
      row.includes(GRID_ELEMENT_STATES.OPEN)
    );
    const hasPath = step.states.some(row =>
      row.includes(GRID_ELEMENT_STATES.PATH)
    );

    if (hasPath && step.description.toLowerCase().includes('path found')) {
      soundManager.playPathFound();
    } else if (hasOpen) {
      soundManager.playNodeVisit();
    }
  }, []);

  // ── Shared playback engine ─────────────────────────────────────────────────
  const engine = useVisualization({ executeStep, speed, mode });

  // ── Grid management ────────────────────────────────────────────────────────
  const generateNewGrid = useCallback(() => {
    engine.loadSteps([]);

    const newGrid = createEmptyGrid(gridSize, gridSize);
    const { start: newStart, end: newEnd } = generateRandomStartEnd(
      gridSize,
      gridSize
    );

    const newStates = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(GRID_ELEMENT_STATES.DEFAULT));
    newStates[newStart.row][newStart.col] = GRID_ELEMENT_STATES.START;
    newStates[newEnd.row][newEnd.col] = GRID_ELEMENT_STATES.END;

    setGrid(newGrid);
    setStates(newStates);
    setStart(newStart);
    setEnd(newEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize, engine.loadSteps]);

  // Initialize on mount and regenerate when grid size changes.
  useEffect(() => {
    generateNewGrid();
  }, [generateNewGrid]);

  // ── Step loading — owned by this hook ─────────────────────────────────────
  /**
   * Reload steps for the current algorithmKey + grid start/end.
   * Stable reference: recreates only when algorithmKey, start, end, or
   * gridSize changes. Guards against missing algorithmKey or unset positions.
   */
  const loadStepsForCurrentAlgorithm = useCallback(() => {
    if (!algorithmKey || !start || !end) return;
    const fn =
      CATEGORY_CONFIG[ALGORITHM_TYPES.PATHFINDING].getAlgorithmFn(algorithmKey);
    if (fn) {
      const grid = createEmptyGrid(gridSize, gridSize);
      engine.loadSteps(fn(grid, start, end, gridSize, gridSize));
    }
    // engine.loadSteps is stable (useCallback in useVisualization)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithmKey, start, end, gridSize]);

  useEffect(() => {
    loadStepsForCurrentAlgorithm();
  }, [loadStepsForCurrentAlgorithm]);

  return {
    // Pathfinding-specific domain state
    grid,
    states,
    start,
    end,
    generateNewGrid,
    // refresh() — generates a new grid (new start/end), which triggers step
    // reloading automatically via the loadStepsForCurrentAlgorithm effect.
    // Exposed for VisualizerApp's generic handleGenerateArray.
    refresh: generateNewGrid,
    // Shared playback engine (steps, isPlaying, isComplete, currentStep, …)
    ...engine,
  };
}
