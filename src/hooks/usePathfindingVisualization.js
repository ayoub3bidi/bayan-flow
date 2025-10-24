/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  GRID_ELEMENT_STATES,
  VISUALIZATION_MODES,
  DEFAULT_GRID_SIZE,
} from '../constants';
import { generateRandomStartEnd, createEmptyGrid } from '../utils/gridHelpers';

/**
 * @param {number} gridSize - Size of the grid (N x N)
 * @param {number} speed - Animation speed in milliseconds
 * @param {string} mode - Visualization mode (autoplay or manual)
 * @returns {Object} - Visualization state and control methods
 */
export function usePathfindingVisualization(
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [description, setDescription] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);

  const animationRef = useRef(null);
  const stepsRef = useRef([]);
  const autoplayTimeoutRef = useRef(null);

  // Centralized cleanup function
  const clearAutoplayTimeout = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  // Keep stepsRef in sync
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoplayTimeout();
      animationRef.current = null;
    };
  }, [clearAutoplayTimeout]);

  // Initialize grid with random start/end
  const generateNewGrid = useCallback(() => {
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
    setCurrentStep(0);
    setDescription('');
    setIsComplete(false);
    setIsPlaying(false);
    setIsAutoplayActive(false);
    setSteps([]);
    clearAutoplayTimeout();
  }, [gridSize, clearAutoplayTimeout]);

  // Initialize on mount
  useEffect(() => {
    generateNewGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate grid when size changes
  useEffect(() => {
    generateNewGrid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  const loadSteps = useCallback(
    algorithmSteps => {
      clearAutoplayTimeout();
      setSteps(algorithmSteps);
      setCurrentStep(0);
      setIsComplete(false);

      if (algorithmSteps.length > 0) {
        const firstStep = algorithmSteps[0];
        setGrid(firstStep.grid);
        setStates(firstStep.states);
        setDescription(firstStep.description);
      }
    },
    [clearAutoplayTimeout]
  );

  const computeEffectiveDelay = baseDelay => {
    // Use the user's selected speed directly without modification
    // The speed constants are already well-calibrated:
    // SLOW: 8000ms, MEDIUM: 4800ms, FAST: 2400ms, VERY_FAST: 1200ms
    return baseDelay;
  };

  const play = useCallback(() => {
    if (stepsRef.current.length === 0 || isComplete) return;

    if (mode === VISUALIZATION_MODES.MANUAL) {
      if (currentStep < stepsRef.current.length - 1) {
        const nextStep = currentStep + 1;
        const step = stepsRef.current[nextStep];
        setGrid(step.grid);
        setStates(step.states);
        setDescription(step.description);
        setCurrentStep(nextStep);

        if (nextStep === stepsRef.current.length - 1) {
          setIsComplete(true);
        }
      }
      return;
    }

    // Autoplay
    clearAutoplayTimeout();
    setIsPlaying(true);
    setIsAutoplayActive(true);
    animationRef.current = true;

    const runAutoplay = stepIndex => {
      if (!animationRef.current || stepIndex >= stepsRef.current.length) {
        setIsPlaying(false);
        setIsAutoplayActive(false);
        clearAutoplayTimeout();
        if (stepIndex >= stepsRef.current.length) {
          setIsComplete(true);
        }
        return;
      }

      const step = stepsRef.current[stepIndex];
      setGrid(step.grid);
      setStates(step.states);
      setDescription(step.description);
      setCurrentStep(stepIndex);

      if (stepIndex === stepsRef.current.length - 1) {
        setIsComplete(true);
        setIsPlaying(false);
        setIsAutoplayActive(false);
        clearAutoplayTimeout();
        return;
      }

      const totalSteps = stepsRef.current.length || 0;
      const effectiveDelay = computeEffectiveDelay(speed, gridSize, totalSteps);

      clearAutoplayTimeout();
      autoplayTimeoutRef.current = setTimeout(() => {
        runAutoplay(stepIndex + 1);
      }, effectiveDelay);
    };

    runAutoplay(currentStep);
  }, [currentStep, speed, isComplete, mode, gridSize, clearAutoplayTimeout]);

  const pause = useCallback(() => {
    animationRef.current = null;
    setIsPlaying(false);
    setIsAutoplayActive(false);
    clearAutoplayTimeout();
  }, [clearAutoplayTimeout]);

  const reset = useCallback(() => {
    pause();
    setCurrentStep(0);
    setIsComplete(false);

    if (stepsRef.current.length > 0) {
      const firstStep = stepsRef.current[0];
      setGrid(firstStep.grid);
      setStates(firstStep.states);
      setDescription(firstStep.description);
    }
  }, [pause]);

  const stepForward = useCallback(() => {
    if (currentStep < stepsRef.current.length - 1) {
      const nextStep = currentStep + 1;
      const step = stepsRef.current[nextStep];
      setGrid(step.grid);
      setStates(step.states);
      setDescription(step.description);
      setCurrentStep(nextStep);

      if (nextStep === stepsRef.current.length - 1) {
        setIsComplete(true);
      }
    }
  }, [currentStep]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      const step = stepsRef.current[prevStep];
      setGrid(step.grid);
      setStates(step.states);
      setDescription(step.description);
      setCurrentStep(prevStep);
      setIsComplete(false);
    }
  }, [currentStep]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = true;
    }
  }, [isPlaying]);

  return {
    grid,
    states,
    start,
    end,
    isPlaying,
    isAutoplayActive,
    currentStep,
    totalSteps: steps.length,
    description,
    isComplete,
    mode,
    loadSteps,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
    generateNewGrid,
  };
}
