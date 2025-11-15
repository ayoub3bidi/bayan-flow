/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { STATE_COLORS } from '../constants';

/**
 * ArrayBar Component
 * Displays a single bar in the sorting visualization with color-coded states
 * and animated swap transitions
 *
 * @param {number} value - The numeric value of the bar
 * @param {string} state - The current state of the bar (comparing, swapping, etc.)
 * @param {number} maxValue - Maximum value in the array for height calculation
 * @param {number} index - Index of the bar in the array
 * @param {number} arrayLength - Total length of array (for label sizing)
 */
function ArrayBar({ value, state, index, arrayLength }) {
  const color = STATE_COLORS[state];

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
      className="flex flex-col items-center justify-center min-w-0 mx-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.01, type: 'spring' }}
    >
      <motion.div
        className="rounded-lg shadow-lg flex items-center justify-center font-bold border-2"
        style={{
          backgroundColor: color,
          borderColor: color,
          width:
            arrayLength <= 20 ? '60px' : arrayLength <= 35 ? '45px' : '30px',
          height:
            arrayLength <= 20 ? '60px' : arrayLength <= 35 ? '45px' : '30px',
          minWidth: '25px',
          minHeight: '25px',
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
        <span className="text-white text-sm font-bold drop-shadow-md">
          {value}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default ArrayBar;
