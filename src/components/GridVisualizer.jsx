/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GridCell from './GridCell';
import ComplexityPanel from './ComplexityPanel';
import SwipeTutorial from './SwipeTutorial';
import AutoHidingLegend from './AutoHidingLegend';
import { GRID_ELEMENT_STATES, GRID_STATE_COLORS } from '../constants';
import useSwipe from '../hooks/useSwipe';

/**
 * @param {string[][]} states - 2D array of cell states
 * @param {string} description - Current step description
 * @param {boolean} isComplete - Whether the visualization is complete
 * @param {string} algorithm - Current algorithm name
 * @param {number} gridSize - Size of the grid (N x N)
 * @param {Function} onStepForward - Handler for step forward
 * @param {Function} onStepBackward - Handler for step backward
 * @param {string} mode - Control mode ('autoplay' or 'manual')
 */
function GridVisualizer({
  states,
  description,
  isComplete,
  algorithm,
  gridSize,
  onStepForward,
  onStepBackward,
  mode,
}) {
  const { t } = useTranslation();
  const [showComplexityPanel, setShowComplexityPanel] = useState(false);
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);

  // Show swipe tutorial on mobile when user scrolls to visualization area
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const hasSteps = states && states.length > 0;
    const isManualMode = mode === 'manual';
    const hasSeenTutorial = localStorage.getItem('swipeTutorialSeen');

    if (
      isMobile &&
      isManualMode &&
      hasSteps &&
      !hasSeenTutorial &&
      !isComplete
    ) {
      const handleScroll = () => {
        if (window.scrollY > 100) {
          // Trigger when scrolled 100px down
          setShowSwipeTutorial(true);
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [mode, states, isComplete]);

  const handleDismissTutorial = () => {
    setShowSwipeTutorial(false);
    localStorage.setItem('swipeTutorialSeen', 'true');
  };

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
    { state: GRID_ELEMENT_STATES.START, label: t('legend.pathfinding.start') },
    { state: GRID_ELEMENT_STATES.END, label: t('legend.pathfinding.end') },
    { state: GRID_ELEMENT_STATES.OPEN, label: t('legend.pathfinding.queue') },
    {
      state: GRID_ELEMENT_STATES.CLOSED,
      label: t('legend.pathfinding.visited'),
    },
    { state: GRID_ELEMENT_STATES.PATH, label: t('legend.pathfinding.path') },
  ];

  // Swipe gesture support for manual mode
  const swipe = useSwipe({
    onLeft: mode === 'manual' && onStepBackward ? onStepBackward : undefined,
    onRight: mode === 'manual' && onStepForward ? onStepForward : undefined,
    threshold: 50,
  });

  return (
    <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        {showComplexityPanel ? (
          <ComplexityPanel algorithm={algorithm} isPathfinding={true} />
        ) : (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full h-full bg-surface flex flex-col ${
              gridSize <= 15 ? 'p-2 sm:p-4' : 'p-1.5 sm:p-3'
            }`}
            {...(mode === 'manual' ? swipe : {})}
            role="application"
            aria-label="Grid visualization - Swipe left/right to navigate steps"
          >
            {/* Auto-hiding Legend */}
            <AutoHidingLegend
              legendItems={legendItems.map(item => ({
                ...item,
                color: GRID_STATE_COLORS[item.state],
              }))}
              isComplete={isComplete}
            />

            {/* Grid Visualization */}
            <div
              className={`flex-1 flex items-center justify-center overflow-auto touch-pan-y ${
                gridSize <= 15
                  ? 'pb-12 sm:pb-14'
                  : gridSize <= 25
                    ? 'pb-11 sm:pb-12'
                    : 'pb-10 sm:pb-11'
              }`}
            >
              <div className="inline-flex flex-col items-center">
                {/* Column Labels */}
                <div className="flex mb-1">
                  <div className="w-6 sm:w-7 md:w-8" />
                  {Array.from({ length: gridSize }).map((_, colIndex) => (
                    <div
                      key={`col-${colIndex}`}
                      className={`text-[9px] sm:text-[10px] md:text-xs font-mono text-text-secondary text-center ${
                        gridSize <= 15
                          ? 'w-4 sm:w-5 md:w-6'
                          : gridSize <= 25
                            ? 'w-3 sm:w-3.5 md:w-4'
                            : 'w-2 sm:w-2.5 md:w-3'
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
                        className={`text-[9px] sm:text-[10px] md:text-xs font-mono text-text-secondary text-right w-5 sm:w-6 md:w-7 ${
                          gridSize <= 15
                            ? 'h-4 sm:h-5 md:h-6'
                            : gridSize <= 25
                              ? 'h-3 sm:h-3.5 md:h-4'
                              : 'h-2 sm:h-2.5 md:h-3'
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
                  className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 max-w-lg w-[90%] flex justify-center"
                >
                  <div className="bg-surface-elevated px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-xl border-2 border-gray-200 backdrop-blur-sm">
                    <p
                      className="text-xs sm:text-sm font-semibold text-center text-text-primary"
                      role="status"
                      aria-live="polite"
                    >
                      {description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe Tutorial Overlay */}
      <SwipeTutorial
        show={showSwipeTutorial}
        onDismiss={handleDismissTutorial}
      />
    </div>
  );
}

export default GridVisualizer;
