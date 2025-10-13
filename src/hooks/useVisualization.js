import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ELEMENT_STATES,
  VISUALIZATION_MODES,
  DEFAULT_ARRAY_SIZE,
} from '../constants';

/**
 * Custom hook for managing visualization state and animation playback
 * @param {number[]} initialArray - The initial array to visualize
 * @param {number} speed - Animation base speed in milliseconds (from ANIMATION_SPEEDS)
 * @param {string} mode - Visualization mode ('autoplay' or 'manual')
 * @returns {Object} Visualization state and controls
 */
export function useVisualization(
  initialArray,
  speed,
  mode = VISUALIZATION_MODES.AUTOPLAY
) {
  const [array, setArray] = useState(initialArray);
  const [states, setStates] = useState(
    Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [description, setDescription] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isAutoplayActive, setIsAutoplayActive] = useState(false);

  const animationRef = useRef(null);
  const stepsRef = useRef([]);
  const autoplayTimeoutRef = useRef(null);

  // keep stepsRef in sync
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // cleanup on unmount: clear any pending timeout
  useEffect(() => {
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
        autoplayTimeoutRef.current = null;
      }
      animationRef.current = null;
    };
  }, []);

  // Reset when array changes (external array update)
  useEffect(() => {
    setArray(initialArray);
    setStates(Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT));
    setCurrentStep(0);
    setDescription('');
    setIsComplete(false);
    setIsPlaying(false);
    setIsAutoplayActive(false);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, [initialArray]);

  const loadSteps = useCallback(algorithmSteps => {
    setSteps(algorithmSteps);
    setCurrentStep(0);
    setIsComplete(false);

    if (algorithmSteps.length > 0) {
      const firstStep = algorithmSteps[0];
      setArray(firstStep.array);
      setStates(firstStep.states);
      setDescription(firstStep.description);
    }
  }, []);

  /**
   * computeEffectiveDelay
   * - scales baseDelay inversely with array length so big arrays don't take forever
   * - caps total run time to MAX_TOTAL_MS when possible
   */
  const computeEffectiveDelay = (baseDelay, arrayLength, totalSteps) => {
    const MAX_TOTAL_MS = 30000; // max total autoplay time default (30s)
    const MIN_DELAY_MS = 30; // lower bound per step
    const MAX_DELAY_MS = 10000; // upper bound per step

    // scale delay by default array size ratio
    const scaled = Math.round(
      baseDelay * (DEFAULT_ARRAY_SIZE / Math.max(1, arrayLength))
    );

    // enforce a cap so total time isn't ridiculous
    let final = scaled;
    if (totalSteps && final * totalSteps > MAX_TOTAL_MS) {
      final = Math.max(MIN_DELAY_MS, Math.floor(MAX_TOTAL_MS / totalSteps));
    }

    return Math.max(MIN_DELAY_MS, Math.min(final, MAX_DELAY_MS));
  };

  /**
   * Starts autoplay animation or performs single step in manual mode
   */
  const play = useCallback(() => {
    if (stepsRef.current.length === 0 || isComplete) return;

    if (mode === VISUALIZATION_MODES.MANUAL) {
      // Manual: advance a single step
      if (currentStep < stepsRef.current.length - 1) {
        const nextStep = currentStep + 1;
        const step = stepsRef.current[nextStep];
        setArray(step.array);
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
    setIsPlaying(true);
    setIsAutoplayActive(true);
    animationRef.current = true;

    const runAutoplay = stepIndex => {
      if (!animationRef.current || stepIndex >= stepsRef.current.length) {
        setIsPlaying(false);
        setIsAutoplayActive(false);
        if (stepIndex >= stepsRef.current.length) {
          setIsComplete(true);
        }
        return;
      }

      const step = stepsRef.current[stepIndex];
      setArray(step.array);
      setStates(step.states);
      setDescription(step.description);
      setCurrentStep(stepIndex);

      if (stepIndex === stepsRef.current.length - 1) {
        setIsComplete(true);
        setIsPlaying(false);
        setIsAutoplayActive(false);
        return;
      }

      const arrayLen =
        (step.array && step.array.length) || array.length || DEFAULT_ARRAY_SIZE;
      const totalSteps = stepsRef.current.length || 0;
      const effectiveDelay = computeEffectiveDelay(speed, arrayLen, totalSteps);

      // clear any existing timeout before scheduling next
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
        autoplayTimeoutRef.current = null;
      }

      autoplayTimeoutRef.current = setTimeout(() => {
        runAutoplay(stepIndex + 1);
      }, effectiveDelay);
    };

    runAutoplay(currentStep);
  }, [currentStep, speed, isComplete, mode, array.length]);

  /**
   * Pauses autoplay (can be resumed)
   */
  const pause = useCallback(() => {
    animationRef.current = null;
    setIsPlaying(false);
    setIsAutoplayActive(false);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
      autoplayTimeoutRef.current = null;
    }
  }, []);

  /**
   * Resets to initial step
   */
  const reset = useCallback(() => {
    pause();
    setCurrentStep(0);
    setIsComplete(false);

    if (stepsRef.current.length > 0) {
      const firstStep = stepsRef.current[0];
      setArray(firstStep.array);
      setStates(firstStep.states);
      setDescription(firstStep.description);
    }
  }, [pause]);

  const stepForward = useCallback(() => {
    if (currentStep < stepsRef.current.length - 1) {
      const nextStep = currentStep + 1;
      const step = stepsRef.current[nextStep];
      setArray(step.array);
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
      setArray(step.array);
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
    array,
    states,
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
  };
}
