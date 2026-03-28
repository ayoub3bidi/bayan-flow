/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import {
  STATE_COLORS,
  ELEMENT_STATES,
  SEARCH_TARGET_RING_COLOR,
  SEARCH_TARGET_RING_RGB,
} from '../constants/index.js';

/**
 * Renders sorting visualization with smooth interpolated animations.
 * Uses Remotion's interpolate for swap and compare animations.
 *
 * @param {Object} props
 * @param {Array<{ array: number[], states: string[], description: string }>} props.steps
 * @param {number} props.framesPerStep
 */
function SortingSceneInner({ steps, framesPerStep }) {
  const frame = useCurrentFrame();
  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    Math.max(0, steps.length - 1)
  );
  const frameInStep = frame - stepIndex * framesPerStep;

  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;
  const step = steps[stepIndex] ?? steps[0];
  if (!step) return null;

  const { array, states, targetValue } = step;
  const n = array.length;
  const barSize = n <= 20 ? 60 : n <= 35 ? 45 : 30;
  const minSize = 25;
  const barWidth = Math.max(barSize, minSize);
  const itemWidth = barWidth + 16;

  // Detect swap: two elements exchanged between prev and current
  const isSwapStep =
    prevStep &&
    states.some(s => s === ELEMENT_STATES.SWAPPING) &&
    prevStep.array.length === array.length;
  const swapIndices = [];
  if (isSwapStep) {
    for (let i = 0; i < array.length; i++) {
      if (prevStep.array[i] !== array[i]) {
        swapIndices.push(i);
      }
    }
  }
  const hasSwap = swapIndices.length === 2;

  // prevIndexForCurrent[i] = index in prev array where element at current i came from
  const prevIndexForCurrent = array.map((_, i) => i);
  if (hasSwap && prevStep) {
    const [i, j] = swapIndices;
    prevIndexForCurrent[i] = j;
    prevIndexForCurrent[j] = i;
  }

  // Swap progress: 0 at start of step, 1 at end
  const swapProgress = interpolate(frameInStep, [0, framesPerStep], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Compare progress: animate over first 30% of step
  const compareProgress = interpolate(
    frameInStep,
    [0, framesPerStep * 0.3],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const isSmallArray = n <= 20;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: isSmallArray ? 'center' : 'flex-end',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
        padding: 24,
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {array.map((value, i) => {
        const state = states[i] ?? 'default';
        const color = STATE_COLORS[state] ?? STATE_COLORS.default;

        let translateX = 0;
        let translateY = 0;
        let scale = 1;

        if (hasSwap) {
          const prevIdx = prevIndexForCurrent[i];
          if (prevIdx !== i) {
            const delta = (prevIdx - i) * itemWidth;
            translateX = delta * (1 - swapProgress);
          }
        }

        if (state === ELEMENT_STATES.COMPARING) {
          translateY = -10 * compareProgress;
          scale = 1 + 0.05 * compareProgress;
        }

        return (
          <div
            key={`${stepIndex}-${i}-${value}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 0,
              marginLeft: 8,
              marginRight: 8,
              transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
              transition: 'none',
            }}
          >
            <div
              style={{
                backgroundColor: color,
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor:
                  targetValue != null && value === targetValue
                    ? SEARCH_TARGET_RING_COLOR
                    : '#374151',
                borderRadius: 8,
                width: barWidth,
                height: barWidth,
                minWidth: minSize,
                minHeight: minSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 'bold',
                boxShadow:
                  targetValue != null && value === targetValue
                    ? `0 0 0 3px rgba(${SEARCH_TARGET_RING_RGB}, 0.95), 0 4px 6px -1px rgba(0,0,0,0.2)`
                    : '0 4px 6px -1px rgba(0,0,0,0.2)',
              }}
            >
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const SortingScene = memo(SortingSceneInner);
export default SortingScene;
