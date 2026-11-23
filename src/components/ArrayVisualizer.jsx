/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ArrayBox from './ArrayBox';
import ArrayBarChart from './ArrayBarChart';
import ComplexityPanel from './ComplexityPanel';
import SwipeTutorial from './SwipeTutorial';
import AutoHidingLegend from './AutoHidingLegend';
import {
  ARRAY_VIEWS,
  ELEMENT_STATES,
  STATE_COLORS,
  SEARCH_TARGET_RING_COLOR,
} from '../constants';
import useSwipe from '../hooks/useSwipe';
import { useIsBelowLg } from '../hooks/useIsBelowLg';

/**
 * @param {number[]} array - The array to visualize
 * @param {string[]} states - Array of states corresponding to each element
 * @param {string} description - Current step description
 * @param {boolean} isComplete - Whether the visualization is complete
 * @param {string} algorithm - Current algorithm name
 * @param {Function} onStepForward - Handler for step forward
 * @param {Function} onStepBackward - Handler for step backward
 * @param {string} mode - Control mode ('autoplay' or 'manual')
 * @param {number|null} [targetValue] - Search target (searching category)
 * @param {'sorting'|'searching'} [visualizerVariant]
 * @param {string} [complexityDataset] - ComplexityPanel dataset key
 * @param {boolean} [showChrome=true] - Legend, complexity panel, swipe tutorial
 * @param {boolean} [showCaption=true] - Step status caption under the bars
 * @param {boolean} [interactive=true] - Swipe / keyboard step navigation
 * @param {'bars'|'boxes'} [arrayView='bars'] - Bar chart or numbered boxes
 * @param {number[]|null} [elementIds] - Stable element ids (bars slide on swaps)
 * @param {number} [maxValue] - Fixed bar scale max
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
  targetValue = null,
  visualizerVariant = 'sorting',
  complexityDataset = 'sorting',
  showChrome = true,
  showCaption = true,
  interactive = true,
  arrayView = ARRAY_VIEWS.BARS,
  elementIds = null,
  maxValue,
}) {
  const { t } = useTranslation();
  const isCompactArray = useIsBelowLg();
  const arrayLength = array.length;
  const [showComplexityPanel, setShowComplexityPanel] = useState(false);
  const [showSwipeTutorial, setShowSwipeTutorial] = useState(false);

  // Show swipe tutorial on mobile when user scrolls to visualization area
  useEffect(() => {
    if (!showChrome || !interactive) return undefined;

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
    return undefined;
  }, [mode, array.length, isComplete, showChrome, interactive]);

  const handleDismissTutorial = () => {
    setShowSwipeTutorial(false);
    localStorage.setItem('swipeTutorialSeen', 'true');
  };

  useEffect(() => {
    if (!showChrome) {
      setShowComplexityPanel(false);
      return undefined;
    }

    if (isComplete) {
      const timer = setTimeout(() => {
        setShowComplexityPanel(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowComplexityPanel(false);
    }
    return undefined;
  }, [isComplete, showChrome]);

  const legendItems =
    visualizerVariant === 'searching'
      ? [
          {
            state: ELEMENT_STATES.DEFAULT,
            label: t('legend.searching.default'),
          },
          {
            state: ELEMENT_STATES.COMPARING,
            label: t('legend.searching.comparing'),
          },
          {
            state: ELEMENT_STATES.AUXILIARY,
            label: t('legend.searching.outOfRange'),
          },
          {
            state: ELEMENT_STATES.SORTED,
            label: t('legend.searching.found'),
          },
          {
            state: '__target__',
            label: t('legend.searching.targetHighlight'),
            color: SEARCH_TARGET_RING_COLOR,
          },
        ]
      : [
          { state: ELEMENT_STATES.DEFAULT, label: t('legend.sorting.default') },
          {
            state: ELEMENT_STATES.COMPARING,
            label: t('legend.sorting.comparing'),
          },
          {
            state: ELEMENT_STATES.SWAPPING,
            label: t('legend.sorting.swapping'),
          },
          { state: ELEMENT_STATES.SORTED, label: t('legend.sorting.sorted') },
          { state: ELEMENT_STATES.PIVOT, label: t('legend.sorting.pivot') },
        ];

  const canSwipe =
    interactive && mode === 'manual' && (onStepForward || onStepBackward);

  // Swipe gesture support for manual mode
  const swipe = useSwipe({
    onLeft: canSwipe && onStepBackward ? onStepBackward : undefined,
    onRight: canSwipe && onStepForward ? onStepForward : undefined,
    threshold: 50,
  });

  const arrayPaneProps = canSwipe ? swipe : {};
  const arrayPaneRole = interactive ? 'application' : 'img';
  const arrayPaneLabel = interactive
    ? t('visualization.arrayPaneLabelInteractive')
    : t('visualization.arrayPaneLabel');

  return (
    <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        {showChrome && showComplexityPanel ? (
          <div className="relative w-full h-full">
            <ComplexityPanel
              algorithm={algorithm}
              complexityDataset={complexityDataset}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-surface p-3 sm:p-6 flex flex-col"
            {...arrayPaneProps}
            role={arrayPaneRole}
            aria-label={arrayPaneLabel}
          >
            {showChrome && (
              <AutoHidingLegend
                legendItems={legendItems.map(item => ({
                  ...item,
                  color: item.color ?? STATE_COLORS[item.state],
                }))}
                isComplete={isComplete}
              />
            )}

            {visualizerVariant === 'searching' && targetValue != null && (
              <div className="flex justify-center mb-2 shrink-0">
                <span
                  className="inline-flex items-center rounded-full border border-orange-600/35 bg-orange-600/10 px-3 py-1 text-xs sm:text-sm font-semibold text-text-primary dark:border-orange-500/35 dark:bg-orange-500/10"
                  role="status"
                >
                  {t('visualization.searchTarget', { value: targetValue })}
                </span>
              </div>
            )}

            {/* Array Visualization */}
            {arrayView === ARRAY_VIEWS.BARS ? (
              <div
                className={`flex-1 min-h-0 flex flex-col px-2 touch-pan-y ${
                  showChrome || showCaption ? 'pb-24 sm:pb-20' : 'pb-2'
                }`}
              >
                <ArrayBarChart
                  array={array}
                  states={states}
                  elementIds={elementIds}
                  maxValue={maxValue}
                  compact={isCompactArray}
                  targetValue={
                    visualizerVariant === 'searching' ? targetValue : null
                  }
                />
              </div>
            ) : (
              <div
                dir="ltr"
                className={`flex-1 flex items-center justify-center flex-wrap gap-2 sm:gap-3 px-2 overflow-x-hidden touch-pan-y ${
                  showChrome || showCaption ? 'pb-10' : 'pb-2'
                }`}
              >
                {array.map((value, index) => (
                  <ArrayBox
                    key={`${index}-${value}`}
                    value={value}
                    state={states[index]}
                    index={index}
                    arrayLength={arrayLength}
                    compact={isCompactArray}
                    highlightTarget={
                      visualizerVariant === 'searching' &&
                      targetValue != null &&
                      value === targetValue
                    }
                  />
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {showCaption && description && (
                <motion.div
                  key={description}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-16 sm:bottom-6 left-1/2 transform -translate-x-1/2 max-w-lg w-[90%] flex justify-center pointer-events-none"
                >
                  <div className="bg-surface-elevated px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-xl border-2 border-gray-200">
                    <p
                      className="text-xs sm:text-sm font-semibold text-center text-text-primary"
                      role="status"
                      aria-live="polite"
                    >
                      {visualizerVariant === 'searching'
                        ? description
                        : t(description)}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {showChrome && (
        <SwipeTutorial
          show={showSwipeTutorial}
          onDismiss={handleDismissTutorial}
        />
      )}
    </div>
  );
}

export default ArrayVisualizer;
