/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import ArrayVisualizer from '../ArrayVisualizer';
import { useSortingVisualization } from '../../hooks/useSortingVisualization';
import {
  ALGORITHM_TYPES,
  ELEMENT_STATES,
  SORTING_ALGORITHMS,
  VISUALIZATION_MODES,
} from '../../constants';
import { CATEGORY_CONFIG } from '../../registry/categoryConfig';
import { HERO_DEMO_SIZE, HERO_STEP_MS } from './heroVisualizerDemoConfig';

const HERO_ALGORITHM_KEY = SORTING_ALGORITHMS.BUBBLE_SORT;

function HeroVisualizerDemo() {
  const reduceMotion = useReducedMotion();
  // Same generator as /app sorting (CATEGORY_CONFIG.generateData → generateRandomArray).
  // Stable for the lifetime of this mount so playback does not reshuffle mid-run.
  const [initialArray] = useState(() =>
    CATEGORY_CONFIG[ALGORITHM_TYPES.SORTING].generateData(HERO_DEMO_SIZE)
  );
  const hasStartedRef = useRef(false);

  const visualization = useSortingVisualization(
    HERO_ALGORITHM_KEY,
    initialArray,
    HERO_STEP_MS,
    VISUALIZATION_MODES.AUTOPLAY,
    { enableSound: false }
  );

  const {
    array,
    states,
    description,
    isComplete,
    play,
    totalSteps,
    currentStep,
  } = visualization;

  // Start autoplay once steps are ready (skip when reduced motion).
  // Play once and stop; no replay loop.
  useEffect(() => {
    if (reduceMotion) return undefined;
    if (hasStartedRef.current) return undefined;
    if (totalSteps === 0) return undefined;

    hasStartedRef.current = true;
    play();
    return undefined;
  }, [reduceMotion, totalSteps, play]);

  const staticSortedArray = useMemo(
    () => [...initialArray].sort((a, b) => a - b),
    [initialArray]
  );
  const staticSortedStates = useMemo(
    () => Array(initialArray.length).fill(ELEMENT_STATES.SORTED),
    [initialArray]
  );

  const displayArray = reduceMotion ? staticSortedArray : array;
  const displayStates = reduceMotion ? staticSortedStates : states;

  return (
    <div
      data-testid="hero-visualizer-demo"
      data-reduced-motion={reduceMotion ? 'true' : 'false'}
      data-current-step={reduceMotion ? 0 : currentStep}
      data-complete={isComplete ? 'true' : 'false'}
      data-array-size={initialArray.length}
      className="w-full min-h-[20rem] sm:min-h-[28rem] lg:min-h-[32rem] aspect-[4/3] max-h-[36rem] pointer-events-none"
      aria-hidden="true"
    >
      <ArrayVisualizer
        array={displayArray}
        states={displayStates}
        description={reduceMotion ? '' : description}
        isComplete={false}
        algorithm={HERO_ALGORITHM_KEY}
        mode={VISUALIZATION_MODES.AUTOPLAY}
        showChrome={false}
        showCaption={!reduceMotion}
        interactive={false}
      />
    </div>
  );
}

export default HeroVisualizerDemo;
