/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ArrayBar from './ArrayBar';
import ComplexityPanel from './ComplexityPanel';
import SwipeTutorial from './SwipeTutorial';
import { ELEMENT_STATES, STATE_COLORS } from '../constants';
import useSwipe from '../hooks/useSwipe';

/**
 * @param {number[]} array - The array to visualize
 * @param {string[]} states - Array of states corresponding to each element
 * @param {string} description - Current step description
 * @param {boolean} isComplete - Whether the visualization is complete
 * @param {string} algorithm - Current algorithm name
 * @param {Function} onStepForward - Handler for step forward
 * @param {Function} onStepBackward - Handler for step backward
 * @param {string} mode - Control mode ('autoplay' or 'manual')
 */
function ArrayVisualizer({
  array,
  states,
  description,
  isComplete,
  algorithm,
  onStepForward,
  onStepBackward,
  mode,
}) {
  const { t } = useTranslation();
  const maxValue = useMemo(() => Math.max(...array, 1), [array]);
  const arrayLength = array.length;
  const [showComplexityPanel, setShowComplexityPanel] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);

  // Show swipe tutorial on mobile when user scrolls to visualization area
  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    const hasSteps = array.length > 0;
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
  }, [mode, array.length, isComplete]);

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
    { state: ELEMENT_STATES.DEFAULT, label: t('legend.sorting.default') },
    { state: ELEMENT_STATES.COMPARING, label: t('legend.sorting.comparing') },
    { state: ELEMENT_STATES.SWAPPING, label: t('legend.sorting.swapping') },
    { state: ELEMENT_STATES.SORTED, label: t('legend.sorting.sorted') },
    { state: ELEMENT_STATES.PIVOT, label: t('legend.sorting.pivot') },
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
          <ComplexityPanel algorithm={algorithm} />
        ) : (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-surface p-3 sm:p-6 flex flex-col"
            {...(mode === 'manual' ? swipe : {})}
            role="application"
            aria-label="Array visualization - Swipe left/right to navigate steps"
          >
            {/* Legend - Collapsible on mobile */}
            <div className="border-b border-gray-200 mb-2 sm:mb-4">
              <button
                onClick={() => setLegendCollapsed(!legendCollapsed)}
                className="w-full flex items-center justify-between py-2 sm:hidden touch-manipulation"
                aria-expanded={!legendCollapsed}
                aria-label={t('legend.toggle')}
              >
                <span className="text-xs font-semibold text-text-primary">
                  {t('legend.title')}
                </span>
                <motion.div
                  animate={{ rotate: legendCollapsed ? -90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    size={16}
                    className="text-text-secondary"
                    aria-hidden="true"
                  />
                </motion.div>
              </button>
              <div
                className={`flex items-center justify-center gap-3 sm:gap-6 py-3 sm:py-4 flex-wrap ${
                  legendCollapsed ? 'hidden sm:flex' : 'flex'
                }`}
              >
                {legendItems.map(item => (
                  <div
                    key={item.state}
                    className="flex items-center gap-1.5 sm:gap-2"
                  >
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded shadow-sm"
                      style={{ backgroundColor: STATE_COLORS[item.state] }}
                    />
                    <span className="text-[10px] sm:text-xs font-medium text-text-primary whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Array Visualization */}
            <div className="flex-1 flex items-center justify-center flex-wrap gap-2 sm:gap-3 pb-10 px-2 overflow-x-auto touch-pan-y">
              {array.map((value, index) => (
                <ArrayBar
                  key={`${index}-${value}`}
                  value={value}
                  state={states[index]}
                  maxValue={maxValue}
                  index={index}
                  arrayLength={arrayLength}
                />
              ))}
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

export default ArrayVisualizer;
