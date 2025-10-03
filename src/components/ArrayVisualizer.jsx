import { motion, AnimatePresence } from 'framer-motion';
import ArrayBar from './ArrayBar';

/**
 * ArrayVisualizer Component
 * Displays the entire array as a series of boxes with enhanced animations
 *
 * @param {number[]} array - The array to visualize
 * @param {string[]} states - Array of states corresponding to each element
 * @param {string} description - Current step description
 */
function ArrayVisualizer({ array, states, description }) {
  const maxValue = Math.max(...array, 1);
  const arrayLength = array.length;

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl p-6 overflow-hidden relative">
      {/* Array boxes */}
      <div className="flex items-center justify-center h-full flex-wrap gap-2">
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

      {/* Description overlay - centered at bottom */}
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
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 rounded-full shadow-xl border-2 border-white/30 backdrop-blur-sm">
              <p className="text-sm font-semibold text-center whitespace-nowrap">
                {description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ArrayVisualizer;
