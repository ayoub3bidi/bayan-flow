import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ChevronDown, Check } from 'lucide-react';

/**
 * SettingsPanel Component
 * Provides settings for algorithm selection, speed control, and array generation
 *
 * @param {string} selectedAlgorithm - Currently selected algorithm
 * @param {Function} onAlgorithmChange - Handler for algorithm selection
 * @param {number} speed - Current animation speed
 * @param {Function} onSpeedChange - Handler for speed change
 * @param {number} arraySize - Current array size
 * @param {Function} onArraySizeChange - Handler for array size change
 * @param {Function} onGenerateArray - Handler for generating new array
 * @param {boolean} isPlaying - Whether animation is currently playing
 */
function SettingsPanel({
  selectedAlgorithm,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  arraySize,
  onArraySizeChange,
  onGenerateArray,
  isPlaying,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const algorithms = [
    { value: 'bubbleSort', label: 'Bubble Sort', complexity: 'O(n²)' },
    { value: 'quickSort', label: 'Quick Sort', complexity: 'O(n log n)' },
    { value: 'mergeSort', label: 'Merge Sort', complexity: 'O(n log n)' },
  ];

  const speeds = [
    { value: 1000, label: 'Slow' },
    { value: 500, label: 'Medium' },
    { value: 100, label: 'Fast' },
    { value: 10, label: 'Very Fast' },
  ];

  const selectedAlgo = algorithms.find(a => a.value === selectedAlgorithm);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAlgorithmSelect = value => {
    onAlgorithmChange(value);
    setIsDropdownOpen(false);
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Algorithm Selection - Custom Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Chosen Algorithm
        </label>

        {/* Dropdown Button */}
        <button
          onClick={() => !isPlaying && setIsDropdownOpen(!isDropdownOpen)}
          disabled={isPlaying}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-left flex items-center justify-between transition-all duration-200 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
        >
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">
              {selectedAlgo?.label}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {selectedAlgo?.complexity}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown
              size={20}
              className={`${isDropdownOpen ? 'text-primary-500' : 'text-gray-400'}`}
            />
          </motion.div>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl overflow-hidden"
            >
              {algorithms.map((algo, index) => (
                <motion.button
                  key={algo.value}
                  onClick={() => handleAlgorithmSelect(algo.value)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-150 hover:bg-primary-50 ${
                    selectedAlgorithm === algo.value
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{algo.label}</span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      Time: {algo.complexity}
                    </span>
                  </div>
                  {selectedAlgorithm === algo.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 25,
                      }}
                    >
                      <Check size={18} className="text-primary-600" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Speed Control */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Animation Speed: {speeds.find(s => s.value === speed)?.label}
        </label>
        <input
          type="range"
          min="0"
          max="3"
          step="1"
          value={speeds.findIndex(s => s.value === speed)}
          onChange={e => onSpeedChange(speeds[parseInt(e.target.value)].value)}
          disabled={isPlaying}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Slow</span>
          <span>Very Fast</span>
        </div>
      </div>

      {/* Array Size Control */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Array Size: {arraySize}
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={arraySize}
          onChange={e => onArraySizeChange(parseInt(e.target.value))}
          disabled={isPlaying}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5</span>
          <span>100</span>
        </div>
      </div>

      {/* Generate New Array Button */}
      <button
        onClick={onGenerateArray}
        disabled={isPlaying}
        className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        <Shuffle size={20} />
        Generate New Array
      </button>

      {/* Legend */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">Default</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-400 rounded"></div>
            <span className="text-xs text-gray-600">Comparing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Swapping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Sorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-xs text-gray-600">Pivot</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default SettingsPanel;
