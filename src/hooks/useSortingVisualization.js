/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ELEMENT_STATES, VISUALIZATION_MODES } from '../constants';

export function useSortingVisualization(
  initialArray,
  speed,
  mode = VISUALIZATION_MODES.MANUAL
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

  // Reset when array changes
  useEffect(() => {
    setArray(initialArray);
    setStates(Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT));
    setCurrentStep(0);
    setDescription('');
    setIsComplete(false);
    setIsPlaying(false);
    setIsAutoplayActive(false);
    clearAutoplayTimeout();
  }, [initialArray, clearAutoplayTimeout]);

  const loadSteps = useCallback(
    algorithmSteps => {
      clearAutoplayTimeout();
      setSteps(algorithmSteps);
      setCurrentStep(0);
      setIsComplete(false);

      if (algorithmSteps.length > 0) {
        const firstStep = algorithmSteps[0];
        setArray(firstStep.array);
        setStates(firstStep.states);
        setDescription(firstStep.description);
      }
    },
    [clearAutoplayTimeout]
  );

  const computeEffectiveDelay = baseDelay => {
    return baseDelay;
  };

  const play = useCallback(() => {
    if (stepsRef.current.length === 0 || isComplete) return;

    if (mode === VISUALIZATION_MODES.MANUAL) {
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
      setArray(step.array);
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

      const effectiveDelay = computeEffectiveDelay(speed);

      clearAutoplayTimeout();
      autoplayTimeoutRef.current = setTimeout(() => {
        runAutoplay(stepIndex + 1);
      }, effectiveDelay);
    };

    runAutoplay(currentStep);
  }, [currentStep, speed, isComplete, mode, clearAutoplayTimeout]);

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
