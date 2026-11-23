/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ELEMENT_STATES,
  STATE_COLORS,
  SEARCH_TARGET_RING_RGB,
} from '../constants';

/** Above this many bars, values move to the tooltip only. */
export const BAR_LABEL_LIMIT = 25;
export const BAR_LABEL_LIMIT_COMPACT = 12;

// Must stay under the fastest step (ULTRA_FAST 375ms) so slides never lag.
const MOVE_TRANSITION = { type: 'tween', ease: 'easeInOut', duration: 0.22 };
const NO_MOTION = { duration: 0 };

function barGap(n) {
  if (n <= 20) return 6;
  if (n <= 50) return 3;
  return 1;
}

/**
 * Bar view for array categories: height ∝ value, color = element state.
 * Keys come from `elementIds` so the same element slides between slots;
 * without ids (searching) bars are keyed by index and never move.
 *
 * @param {number[]} array
 * @param {string[]} states
 * @param {number[]|null} [elementIds] - Stable id per slot for the current step
 * @param {number} [maxValue] - Fixed scale max (defaults to the array max)
 * @param {boolean} [compact]
 * @param {number|null} [targetValue] - Search target to ring
 */
const ArrayBarChart = memo(function ArrayBarChart({
  array,
  states,
  elementIds = null,
  maxValue,
  compact = false,
  targetValue = null,
}) {
  const reduceMotion = useReducedMotion();
  const n = array.length;
  const scaleMax = maxValue > 0 ? maxValue : Math.max(1, ...array);
  const showLabels = n <= (compact ? BAR_LABEL_LIMIT_COMPACT : BAR_LABEL_LIMIT);
  const transition = reduceMotion ? NO_MOTION : MOVE_TRANSITION;

  return (
    <div
      dir="ltr"
      data-testid="array-bar-chart"
      className={`flex-1 min-h-0 w-full flex items-end ${showLabels ? 'pt-6' : 'pt-2'}`}
      style={{ gap: barGap(n) }}
    >
      {array.map((value, i) => {
        const state = states[i] ?? ELEMENT_STATES.DEFAULT;
        const color = STATE_COLORS[state] ?? STATE_COLORS.default;
        const heightPct = Math.max(4, Math.min(100, (value / scaleMax) * 100));
        const isTarget = targetValue != null && value === targetValue;
        const id = elementIds?.[i] ?? i;

        return (
          <motion.div
            key={id}
            layout="position"
            transition={transition}
            data-testid="array-bar"
            data-element-id={id}
            data-state={state}
            className="flex-1 min-w-0 h-full flex items-end"
          >
            <div
              className="relative w-full rounded-t-md transition-[height,background-color] duration-200 ease-in-out motion-reduce:transition-none"
              title={String(value)}
              style={{
                height: `${heightPct}%`,
                backgroundColor: color,
                boxShadow: isTarget
                  ? `0 0 0 3px rgba(${SEARCH_TARGET_RING_RGB}, 0.95)`
                  : undefined,
              }}
            >
              {showLabels && (
                <span
                  className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1 font-semibold tabular-nums text-text-primary whitespace-nowrap ${
                    compact ? 'text-[10px]' : 'text-xs'
                  }`}
                >
                  {value}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

export default ArrayBarChart;
