import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';

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

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Algorithm Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Algorithm
        </label>
        <select
          value={selectedAlgorithm}
          onChange={e => onAlgorithmChange(e.target.value)}
          disabled={isPlaying}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {algorithms.map(algo => (
            <option key={algo.value} value={algo.value}>
              {algo.label} - {algo.complexity}
            </option>
          ))}
        </select>
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
