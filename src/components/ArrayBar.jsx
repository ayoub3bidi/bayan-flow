/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  STATE_COLORS,
  SEARCH_TARGET_RING_COLOR,
  SEARCH_TARGET_RING_RGB,
} from '../constants';

/**
 * ArrayBar Component
 * Displays a single bar in the sorting visualization with color-coded states
 * and animated swap transitions
 *
 * @param {number} value - The numeric value of the bar
 * @param {string} state - The current state of the bar (comparing, swapping, etc.)
 * @param {number} index - Index of the bar in the array
 * @param {number} arrayLength - Total length of array (for label sizing)
 * @param {boolean} highlightTarget - Emphasize bar when value equals search target
 */
const ArrayBar = memo(function ArrayBar({
  value,
  state,
  index,
  arrayLength,
  highlightTarget = false,
  compact = false,
}) {
  const color = STATE_COLORS[state];
  const size =
    arrayLength <= 20
      ? compact
        ? 40
        : 60
      : arrayLength <= 35
        ? compact
          ? 32
          : 45
        : compact
          ? 24
          : 30;

  // Animation variants for swap effect
  const barVariants = {
    default: {
      y: 0,
      scale: 1,
    },
    comparing: {
      y: -10,
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
    swapping: {
      y: -20,
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      className={`flex flex-col items-center justify-center min-w-0 shrink-0 ${compact ? 'mx-1' : 'mx-2'}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.01, type: 'spring' }}
    >
      <motion.div
        className="rounded-lg shadow-lg flex items-center justify-center font-bold border-2"
        style={{
          backgroundColor: color,
          borderColor: highlightTarget ? SEARCH_TARGET_RING_COLOR : color,
          boxShadow: highlightTarget
            ? `0 0 0 3px rgba(${SEARCH_TARGET_RING_RGB}, 0.9), 0 4px 6px -1px rgba(0,0,0,0.2)`
            : undefined,
          width: `${size}px`,
          height: `${size}px`,
          minWidth: compact ? '20px' : '25px',
          minHeight: compact ? '20px' : '25px',
        }}
        variants={barVariants}
        animate={
          state === 'swapping'
            ? 'swapping'
            : state === 'comparing'
              ? 'comparing'
              : 'default'
        }
        whileHover={{ scale: 1.15, rotate: 5 }}
        transition={{
          backgroundColor: { duration: 0.3 },
          borderColor: { duration: 0.3 },
          scale: { type: 'spring', stiffness: 300 },
        }}
      >
        <span
          className={`text-white font-bold drop-shadow-md ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {value}
        </span>
      </motion.div>
    </motion.div>
  );
});

export default ArrayBar;
