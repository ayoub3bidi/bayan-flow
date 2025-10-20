import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import GridCell from './GridCell';
import ComplexityPanel from './ComplexityPanel';
import { GRID_ELEMENT_STATES, GRID_STATE_COLORS } from '../constants';

/**
 * @param {string[][]} states - 2D array of cell states
 * @param {string} description - Current step description
 * @param {boolean} isComplete - Whether the visualization is complete
 * @param {string} algorithm - Current algorithm name
 * @param {number} gridSize - Size of the grid (N x N)
 */
function GridVisualizer({
  states,
  description,
  isComplete,
  algorithm,
  gridSize,
}) {
  const [showComplexityPanel, setShowComplexityPanel] = useState(false);

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShowComplexityPanel(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowComplexityPanel(false);
    }
  }, [isComplete]);

  const legendItems = [
    { state: GRID_ELEMENT_STATES.START, label: 'Start' },
    { state: GRID_ELEMENT_STATES.END, label: 'End' },
    { state: GRID_ELEMENT_STATES.OPEN, label: 'Open (Queue)' },
    { state: GRID_ELEMENT_STATES.CLOSED, label: 'Closed (Visited)' },
    { state: GRID_ELEMENT_STATES.PATH, label: 'Path' },
  ];

  return (
    <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        {showComplexityPanel ? (
          <ComplexityPanel algorithm={algorithm} isPathfinding={true} />
        ) : (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-gradient-to-br from-white to-gray-50 p-6 flex flex-col"
          >
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 py-4 border-b border-gray-200">
              {legendItems.map(item => (
                <div key={item.state} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded shadow-sm"
                    style={{ backgroundColor: GRID_STATE_COLORS[item.state] }}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Visualization */}
            <div className="flex-1 flex items-center justify-center pb-16">
              <div className="inline-flex flex-col items-center">
                {/* Column Labels */}
                <div className="flex mb-1">
                  <div className="w-8" />
                  {Array.from({ length: gridSize }).map((_, colIndex) => (
                    <div
                      key={`col-${colIndex}`}
                      className={`text-xs font-mono text-gray-500 text-center ${
                        gridSize <= 15 ? 'w-6' : gridSize <= 25 ? 'w-4' : 'w-3'
                      }`}
                    >
                      {colIndex %
                        (gridSize > 25 ? 5 : gridSize > 15 ? 3 : 2) ===
                      0
                        ? colIndex
                        : ''}
                    </div>
                  ))}
                </div>

                {/* Grid with Row Labels */}
                <div className="flex">
                  <div className="flex flex-col justify-around mr-1">
                    {Array.from({ length: gridSize }).map((_, rowIndex) => (
                      <div
                        key={`row-${rowIndex}`}
                        className={`text-xs font-mono text-gray-500 text-right w-7 ${
                          gridSize <= 15
                            ? 'h-6'
                            : gridSize <= 25
                              ? 'h-4'
                              : 'h-3'
                        } flex items-center justify-end`}
                      >
                        {rowIndex %
                          (gridSize > 25 ? 5 : gridSize > 15 ? 3 : 2) ===
                        0
                          ? rowIndex
                          : ''}
                      </div>
                    ))}
                  </div>

                  <div
                    className="inline-grid gap-0"
                    style={{
                      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    }}
                    role="grid"
                    aria-label="Pathfinding grid visualization"
                  >
                    {states.map((row, rowIndex) =>
                      row.map((state, colIndex) => (
                        <GridCell
                          key={`${rowIndex}-${colIndex}`}
                          state={state}
                          row={rowIndex}
                          col={colIndex}
                          gridSize={gridSize}
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <AnimatePresence mode="wait">
              {description && (
                <motion.div
                  key={description}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 max-w-2xl"
                >
                  <div className="bg-gradient-to-r px-6 py-3 rounded-full shadow-xl border-2 border-white/30 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-center">
                      {description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GridVisualizer;
