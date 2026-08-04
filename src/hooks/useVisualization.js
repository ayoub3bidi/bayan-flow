/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * useVisualization — generic, category-agnostic playback engine.
 *
 * Owns all step-navigation state (currentStep, isPlaying, isComplete, etc.)
 * and the autoplay loop. Category-specific hooks pass an `executeStep` callback
 * that applies one step to their own domain state (array/grid/tree/…).
 *
 * @param {Object}   options
 * @param {Function} options.executeStep - (step: Object) => void — applies a step's
 *   payload to the caller's local domain state. Must be a stable reference
 *   (wrapped in useCallback).
 * @param {number}   options.speed       - Autoplay delay in ms (from ANIMATION_SPEEDS).
 * @param {string}   options.mode        - VISUALIZATION_MODES.AUTOPLAY | MANUAL.
 *
 * @returns {{
 *   steps: Array,
 *   isPlaying: boolean,
 *   isAutoplayActive: boolean,
 *   currentStep: number,
 *   totalSteps: number,
 *   description: string,
 *   isComplete: boolean,
 *   mode: string,
 *   loadSteps: (steps: Array) => void,
 *   play: () => void,
 *   pause: () => void,
 *   reset: () => void,
 *   replay: () => void,
 *   stepForward: () => void,
 *   stepBackward: () => void,
 *   seekToStep: (index: number) => void,
 * }}
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ANIMATION_SPEEDS, VISUALIZATION_MODES } from '../constants/index.js';
import { getSoundEventsForStep } from '../utils/soundEvents.js';
import { soundManager } from '../utils/soundManager.js';

export function useVisualization({
  executeStep,
  speed,
  mode = VISUALIZATION_MODES.MANUAL,
  soundContext = null,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [description, setDescription] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);

  const animationRef = useRef(null);
  const stepsRef = useRef([]);
  const autoplayTimeoutRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const clearAutoplayTimeout = useCallback(() => {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  // Keep stepsRef in sync so autoplay closure always sees the latest steps.
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // Stable helper: apply a step and update description.
  const applyStep = useCallback(
    (step, { emitSound = false, stepIndex = 0 } = {}) => {
      executeStep(step);
      setDescription(step.description ?? '');
      if (emitSound && soundContext) {
        const previousStep =
          stepIndex > 0 ? stepsRef.current[stepIndex - 1] : null;
        const soundEvents = getSoundEventsForStep({
          ...soundContext,
          step,
          previousStep,
          stepIndex,
          totalSteps: stepsRef.current.length,
        });
        if (soundEvents.length > 0) {
          soundManager.playEvents(soundEvents, {
            ...soundContext,
            speed,
            stepIndex,
          });
        }
      }
    },
    [executeStep, soundContext, speed]
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearAutoplayTimeout();
      animationRef.current = null;
    };
  }, [clearAutoplayTimeout]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const loadSteps = useCallback(
    algorithmSteps => {
      clearAutoplayTimeout();
      setIsPlaying(false);
      setIsAutoplayActive(false);
      animationRef.current = null;
      stepsRef.current = algorithmSteps; // sync ref immediately for same-tick access
      setSteps(algorithmSteps);
      setCurrentStep(0);
      setIsComplete(false);

      if (algorithmSteps.length > 0) {
        applyStep(algorithmSteps[0]);
      } else {
        setDescription('');
      }
    },
    [clearAutoplayTimeout, applyStep]
  );

  // Stable autoplay scheduler: applies one step and schedules the next.
  const scheduleNext = useCallback(
    idx => {
      if (!animationRef.current || idx >= stepsRef.current.length) {
        setIsPlaying(false);
        setIsAutoplayActive(false);
        clearAutoplayTimeout();
        if (idx >= stepsRef.current.length) setIsComplete(true);
        return;
      }

      applyStep(stepsRef.current[idx], { emitSound: true, stepIndex: idx });
      setCurrentStep(idx);

      if (idx === stepsRef.current.length - 1) {
        setIsComplete(true);
        setIsPlaying(false);
        setIsAutoplayActive(false);
        clearAutoplayTimeout();
        return;
      }

      clearAutoplayTimeout();
      autoplayTimeoutRef.current = setTimeout(
        () => scheduleNext(idx + 1),
        speed
      );
    },
    [applyStep, speed, clearAutoplayTimeout]
  );

  const play = useCallback(() => {
    if (stepsRef.current.length === 0 || isComplete) return;

    // ── Manual: advance one step ───────────────────────────────────────────
    if (mode === VISUALIZATION_MODES.MANUAL) {
      if (currentStep < stepsRef.current.length - 1) {
        const next = currentStep + 1;
        applyStep(stepsRef.current[next], { emitSound: true, stepIndex: next });
        setCurrentStep(next);
        if (next === stepsRef.current.length - 1) setIsComplete(true);
      }
      return;
    }

    // ── Autoplay ───────────────────────────────────────────────────────────
    clearAutoplayTimeout();
    setIsPlaying(true);
    setIsAutoplayActive(true);
    animationRef.current = true;

    scheduleNext(currentStep);
  }, [
    currentStep,
    isComplete,
    mode,
    scheduleNext,
    clearAutoplayTimeout,
    applyStep,
  ]);

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
      applyStep(stepsRef.current[0]);
    }
  }, [pause, applyStep]);

  /**
   * Atomically reset to step 0 and start autoplay.
   * Needed because play() early-returns while isComplete is still true in its
   * closure, so reset(); play() in the same tick is a no-op.
   */
  const replay = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    if (mode !== VISUALIZATION_MODES.AUTOPLAY) return;

    clearAutoplayTimeout();
    setIsComplete(false);
    setCurrentStep(0);
    setIsPlaying(true);
    setIsAutoplayActive(true);
    animationRef.current = true;
    scheduleNext(0);
  }, [mode, clearAutoplayTimeout, scheduleNext]);

  const stepForward = useCallback(() => {
    if (currentStep < stepsRef.current.length - 1) {
      const next = currentStep + 1;
      applyStep(stepsRef.current[next], { emitSound: true, stepIndex: next });
      setCurrentStep(next);
      if (next === stepsRef.current.length - 1) setIsComplete(true);
    }
  }, [currentStep, applyStep]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      applyStep(stepsRef.current[prev]);
      setCurrentStep(prev);
      setIsComplete(false);
    }
  }, [currentStep, applyStep]);

  const seekToStep = useCallback(
    index => {
      const count = stepsRef.current.length;
      if (count === 0) return;
      const target = Math.max(0, Math.min(index, count - 1));
      if (target === currentStep) return;

      // ── Seek while autoplay is running: keep playing from the new spot ───
      if (isPlaying && mode === VISUALIZATION_MODES.AUTOPLAY) {
        clearAutoplayTimeout();
        scheduleNext(target);
        return;
      }

      // ── Manual / paused: silent jump to the requested step ───────────────
      applyStep(stepsRef.current[target]);
      setCurrentStep(target);
      setIsComplete(target === count - 1);
    },
    [
      currentStep,
      isPlaying,
      mode,
      scheduleNext,
      clearAutoplayTimeout,
      applyStep,
    ]
  );

  // Keep animationRef consistent with isPlaying.
  useEffect(() => {
    if (isPlaying) animationRef.current = true;
  }, [isPlaying]);

  // Ultra-fast autoplay is too quick for the step caption to be useful.
  const isUltraFastAutoplay =
    mode === VISUALIZATION_MODES.AUTOPLAY &&
    speed === ANIMATION_SPEEDS.ULTRA_FAST;

  return {
    steps,
    isPlaying,
    isAutoplayActive,
    currentStep,
    totalSteps: steps.length,
    description: isUltraFastAutoplay ? '' : description,
    isComplete,
    mode,
    loadSteps,
    play,
    pause,
    reset,
    replay,
    stepForward,
    stepBackward,
    seekToStep,
  };
}
