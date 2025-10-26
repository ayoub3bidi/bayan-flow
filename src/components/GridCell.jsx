/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2025 Ayoub Abidi
 */

import { motion } from 'framer-motion';
import { GRID_STATE_COLORS } from '../constants';

/**
 * @param {string} state - Current state of the cell
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} gridSize - Total grid size (for responsive sizing)
 */
function GridCell({ state, row, col, gridSize }) {
  const color = GRID_STATE_COLORS[state] || GRID_STATE_COLORS.default;

  const getCellSize = () => {
    // Responsive sizing based on both grid size and screen width
    // Mobile first: smaller cells
    if (gridSize <= 15) return 'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6';
    if (gridSize <= 25) return 'w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4';
    return 'w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3';
  };

  return (
    <motion.div
      className={`${getCellSize()} border rounded-sm`}
      initial={{ backgroundColor: GRID_STATE_COLORS.default }}
      animate={{ backgroundColor: color }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      role="gridcell"
      aria-label={`Cell at row ${row}, column ${col}, state: ${state}`}
      style={{
        backgroundColor: color,
        borderColor: 'var(--color-grid-border)',
      }}
    />
  );
}

export default GridCell;
