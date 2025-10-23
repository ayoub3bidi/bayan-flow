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
    if (gridSize <= 15) return 'w-6 h-6';
    if (gridSize <= 25) return 'w-4 h-4';
    return 'w-3 h-3';
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
