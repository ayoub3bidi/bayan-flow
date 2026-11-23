/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import {
  STATE_COLORS,
  ELEMENT_STATES,
  ARRAY_VIEWS,
  SEARCH_TARGET_RING_COLOR,
  SEARCH_TARGET_RING_RGB,
} from '../constants/index.js';
import { getVideoExportTheme } from './videoExportTheme.js';

/** Same label cutoff as the interactive bar chart. */
const BAR_LABEL_LIMIT = 25;
/** Share of each step spent sliding / resizing bars. */
const BAR_MOVE_FRACTION = 0.4;

/**
 * Box view: numbered squares with swap / compare interpolation.
 *
 * @param {Object} props
 * @param {Array<{ array: number[], states: string[], description: string }>} props.steps
 * @param {number} props.framesPerStep
 */
function SortingBoxesScene({ steps, framesPerStep }) {
  const frame = useCurrentFrame();
  const { width: frameW, height: frameH } = useVideoConfig();
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
  const outerPad = 48;
  const maxW = frameW * 0.92 - outerPad;
  const maxH = frameH * 0.78 - outerPad;
  let barWidth = Math.max(barSize, minSize);
  const marginX = 16;
  const gapY = 12;
  for (let guard = 0; guard < 80; guard += 1) {
    const itemWidth = barWidth + marginX * 2;
    const cols = Math.max(1, Math.floor(maxW / Math.max(itemWidth, 1)));
    const rows = Math.ceil(n / cols);
    const rowHeight = barWidth + gapY;
    if (rows * rowHeight <= maxH || barWidth <= 12) break;
    barWidth -= 2;
  }
  barWidth = Math.max(12, barWidth);
  const itemWidth = barWidth + marginX * 2;

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
        overflow: 'hidden',
        alignContent: 'center',
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
                minWidth: barWidth,
                minHeight: barWidth,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: Math.max(9, Math.round(barWidth * 0.24)),
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

/**
 * Bar view: height ∝ value. Each bar follows its element id (`step.ids`, from
 * withElementIds) from its previous slot/value to the current one, so swaps
 * slide and overwrites resize — the same motion as the interactive chart.
 *
 * @param {Object} props
 * @param {Array<{ array: number[], states: string[], ids?: number[], targetValue?: number }>} props.steps
 * @param {number} props.framesPerStep
 * @param {string} [props.exportTheme]
 */
function SortingBarsScene({ steps, framesPerStep, exportTheme = 'dark' }) {
  const frame = useCurrentFrame();
  const { width: frameW } = useVideoConfig();
  const maxValue = useMemo(
    () =>
      steps.reduce(
        (max, s) => Math.max(max, ...(Array.isArray(s?.array) ? s.array : [])),
        1
      ),
    [steps]
  );

  const stepIndex = Math.min(
    Math.floor(frame / framesPerStep),
    Math.max(0, steps.length - 1)
  );
  const step = steps[stepIndex] ?? steps[0];
  if (!step) return null;
  const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null;

  const { array, states, targetValue, ids } = step;
  const n = array.length;
  const progress = interpolate(
    frame - stepIndex * framesPerStep,
    [0, framesPerStep * BAR_MOVE_FRACTION],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    }
  );

  const canTrack =
    prevStep &&
    Array.isArray(ids) &&
    Array.isArray(prevStep.ids) &&
    prevStep.ids.length === n;
  const prevSlotById = canTrack
    ? new Map(prevStep.ids.map((id, i) => [id, i]))
    : null;

  const slotPct = 100 / Math.max(n, 1);
  const gapPct = slotPct * (n <= 20 ? 0.18 : n <= 50 ? 0.12 : 0.06);
  const showLabels = n <= BAR_LABEL_LIMIT;
  const labelSize = Math.max(
    10,
    Math.min(22, Math.round(((frameW * 0.9) / Math.max(n, 1)) * 0.32))
  );
  const labelColor = getVideoExportTheme(exportTheme).headerText;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        padding: `${showLabels ? labelSize + 32 : 24}px 32px 24px`,
        direction: 'ltr',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {array.map((value, i) => {
          const from = canTrack ? (prevSlotById.get(ids[i]) ?? i) : i;
          const prevValue = canTrack ? (prevStep.array[from] ?? value) : value;
          const slot = from + (i - from) * progress;
          const shown = prevValue + (value - prevValue) * progress;
          const heightPct = Math.max(
            4,
            Math.min(100, (shown / maxValue) * 100)
          );
          const state = states[i] ?? ELEMENT_STATES.DEFAULT;
          const isTarget = targetValue != null && value === targetValue;

          return (
            <div
              key={ids?.[i] ?? i}
              data-testid="video-bar"
              data-slot={slot}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${slot * slotPct + gapPct / 2}%`,
                width: `${slotPct - gapPct}%`,
                height: `${heightPct}%`,
                backgroundColor: STATE_COLORS[state] ?? STATE_COLORS.default,
                borderRadius: '6px 6px 0 0',
                boxShadow: isTarget
                  ? `0 0 0 4px rgba(${SEARCH_TARGET_RING_RGB}, 0.95)`
                  : undefined,
              }}
            >
              {showLabels ? (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 6,
                    fontSize: labelSize,
                    fontWeight: 700,
                    color: labelColor,
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {value}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Renders the sorting / array-searching main scene in the chosen array view.
 *
 * @param {Object} props
 * @param {Array} props.steps
 * @param {number} props.framesPerStep
 * @param {'bars'|'boxes'} [props.arrayView='bars']
 * @param {string} [props.exportTheme]
 */
function SortingSceneInner({
  steps,
  framesPerStep,
  arrayView = ARRAY_VIEWS.BARS,
  exportTheme,
}) {
  if (arrayView === ARRAY_VIEWS.BOXES) {
    return <SortingBoxesScene steps={steps} framesPerStep={framesPerStep} />;
  }
  return (
    <SortingBarsScene
      steps={steps}
      framesPerStep={framesPerStep}
      exportTheme={exportTheme}
    />
  );
}

const SortingScene = memo(SortingSceneInner);
export default SortingScene;
