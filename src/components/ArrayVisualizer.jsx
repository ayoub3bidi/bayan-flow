import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import ArrayBar from './ArrayBar';
import ComplexityPanel from './ComplexityPanel';
import { ELEMENT_STATES, STATE_COLORS } from '../constants';

/**
 * @param {number[]} array - The array to visualize
 * @param {string[]} states - Array of states corresponding to each element
 * @param {string} description - Current step description
 * @param {boolean} isComplete - Whether the visualization is complete
 * @param {string} algorithm - Current algorithm name
 */
function ArrayVisualizer({
  array,
  states,
  description,
  isComplete,
  algorithm,
}) {
  const maxValue = Math.max(...array, 1);
  const arrayLength = array.length;
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
    { state: ELEMENT_STATES.DEFAULT, label: 'Default' },
    { state: ELEMENT_STATES.COMPARING, label: 'Comparing' },
    { state: ELEMENT_STATES.SWAPPING, label: 'Swapping' },
    { state: ELEMENT_STATES.SORTED, label: 'Sorted' },
    { state: ELEMENT_STATES.PIVOT, label: 'Pivot' },
  ];

  return (
    <div className="w-full h-full rounded-xl shadow-2xl overflow-hidden relative">
      <AnimatePresence mode="wait">
        {showComplexityPanel ? (
          <ComplexityPanel algorithm={algorithm} />
        ) : (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-gradient-to-br from-white to-gray-50 p-6 flex flex-col"
          >
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 py-4 border-b border-gray-200 mb-4">
              {legendItems.map(item => (
                <div key={item.state} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded shadow-sm"
                    style={{ backgroundColor: STATE_COLORS[item.state] }}
                  />
                  <span className="text-xs font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Array Visualization */}
            <div className="flex-1 flex items-center justify-center flex-wrap gap-2 pb-10">
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
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 max-w-2xl"
                >
                  <div className="bg-gradient-to-r px-6 py-3 rounded-full shadow-xl border-2 border-white/30 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-center whitespace-nowrap">
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

export default ArrayVisualizer;
