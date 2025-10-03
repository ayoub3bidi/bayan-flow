import { useState, useEffect, useRef, useCallback } from 'react';
import { delay } from '../utils/arrayHelpers';
import { ELEMENT_STATES } from '../constants';

/**
 * Custom hook for managing visualization state and animation playback
 * @param {number[]} initialArray - The initial array to visualize
 * @param {number} speed - Animation speed in milliseconds
 * @returns {Object} Visualization state and controls
 */
export function useVisualization(initialArray, speed) {
  const [array, setArray] = useState(initialArray);
  const [states, setStates] = useState(
    Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState([]);
  const [description, setDescription] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const animationRef = useRef(null);
  const stepsRef = useRef([]);

  // Update steps ref when steps change
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  // Reset when array changes
  useEffect(() => {
    setArray(initialArray);
    setStates(Array(initialArray.length).fill(ELEMENT_STATES.DEFAULT));
    setCurrentStep(0);
    setDescription('');
    setIsComplete(false);
    setIsPlaying(false);
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

  const play = useCallback(async () => {
    if (stepsRef.current.length === 0 || isComplete) return;

    setIsPlaying(true);

    for (let i = currentStep; i < stepsRef.current.length; i++) {
      // Check if animation was stopped
      if (!animationRef.current) {
        break;
      }

      const step = stepsRef.current[i];
      setArray(step.array);
      setStates(step.states);
      setDescription(step.description);
      setCurrentStep(i);

      if (i === stepsRef.current.length - 1) {
        setIsComplete(true);
      }

      await delay(speed);
    }

    setIsPlaying(false);
  }, [currentStep, speed, isComplete]);

  const pause = useCallback(() => {
    animationRef.current = null;
    setIsPlaying(false);
  }, []);

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

  /**
   * Go to previous step
   */
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
    currentStep,
    totalSteps: steps.length,
    description,
    isComplete,
    loadSteps,
    play,
    pause,
    reset,
    stepForward,
    stepBackward,
  };
}
