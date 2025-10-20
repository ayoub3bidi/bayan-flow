import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shuffle,
  ChevronDown,
  Check,
  Play,
  Hand,
  Grid3x3,
  BarChart3,
} from 'lucide-react';
import {
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
  ALGORITHM_TYPES,
  GRID_SIZES,
} from '../constants';

function SettingsPanel({
  algorithmType,
  onAlgorithmTypeChange,
  selectedAlgorithm,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  arraySize,
  onArraySizeChange,
  gridSize,
  onGridSizeChange,
  onGenerateArray,
  isPlaying,
  mode,
  onModeChange,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortingAlgorithms = [
    { value: 'bubbleSort', label: 'Bubble Sort', complexity: 'O(n²)' },
    { value: 'quickSort', label: 'Quick Sort', complexity: 'O(n log n)' },
    { value: 'mergeSort', label: 'Merge Sort', complexity: 'O(n log n)' },
  ];

  const pathfindingAlgorithms = [
    { value: 'bfs', label: 'Breadth-First Search', complexity: 'O(V + E)' },
    {
      value: 'dijkstra',
      label: "Dijkstra's Algorithm",
      complexity: 'O((V+E) log V)',
    },
    { value: 'aStar', label: 'A* Search', complexity: 'O(b^d)' },
  ];

  const algorithms =
    algorithmType === ALGORITHM_TYPES.SORTING
      ? sortingAlgorithms
      : pathfindingAlgorithms;

  const gridSizeOptions = [
    { value: GRID_SIZES.SMALL, label: 'Small (15×15)' },
    { value: GRID_SIZES.MEDIUM, label: 'Medium (25×25)' },
    { value: GRID_SIZES.LARGE, label: 'Large (35×35)' },
  ];

  const speedOptions = [
    { value: ANIMATION_SPEEDS.SLOW, label: 'Slow' },
    { value: ANIMATION_SPEEDS.MEDIUM, label: 'Medium' },
    { value: ANIMATION_SPEEDS.FAST, label: 'Fast' },
    { value: ANIMATION_SPEEDS.VERY_FAST, label: 'Very Fast' },
  ];

  const selectedAlgo = algorithms.find(a => a.value === selectedAlgorithm);
  const currentSpeedIndex = Math.max(
    0,
    speedOptions.findIndex(s => s.value === speed)
  );

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
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Algorithm Type
        </label>
        <div className="flex rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-50">
          <button
            onClick={() =>
              !isPlaying && onAlgorithmTypeChange(ALGORITHM_TYPES.SORTING)
            }
            disabled={isPlaying}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
              algorithmType === ALGORITHM_TYPES.SORTING
                ? 'bg-blue-500 text-white shadow-md border-blue-500'
                : 'bg-transparent text-gray-700 hover:bg-white hover:shadow-sm cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <BarChart3 size={16} />
            Sorting
          </button>
          <button
            onClick={() =>
              !isPlaying && onAlgorithmTypeChange(ALGORITHM_TYPES.PATHFINDING)
            }
            disabled={isPlaying}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
              algorithmType === ALGORITHM_TYPES.PATHFINDING
                ? 'bg-blue-500 text-white shadow-md border-blue-500'
                : 'bg-transparent text-gray-700 hover:bg-white hover:shadow-sm cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <Grid3x3 size={16} />
            Pathfinding
          </button>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Chosen Algorithm
        </label>
        <button
          onClick={() => !isPlaying && setIsDropdownOpen(!isDropdownOpen)}
          disabled={isPlaying}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-left flex items-center justify-between transition-all duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300"
        >
          <div className="flex flex-col">
            <span className="text-gray-900 font-medium">
              {selectedAlgo?.label || 'Select algorithm'}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">
              {selectedAlgo?.complexity || ''}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown
              size={20}
              className={`${isDropdownOpen ? 'text-blue-500' : 'text-gray-400'}`}
            />
          </motion.div>
        </button>
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
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-150 hover:bg-blue-50 ${
                    selectedAlgorithm === algo.value
                      ? 'bg-blue-50 text-blue-700'
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
                      <Check size={18} className="text-blue-600" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Control Mode
        </label>
        <div className="flex rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-50">
          <button
            onClick={() =>
              !isPlaying && onModeChange(VISUALIZATION_MODES.AUTOPLAY)
            }
            disabled={isPlaying}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
              mode === VISUALIZATION_MODES.AUTOPLAY
                ? 'bg-blue-500 text-white shadow-md border-blue-500'
                : 'bg-transparent text-gray-700 hover:bg-white hover:shadow-sm cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <Play size={16} />
            Autoplay
          </button>
          <button
            onClick={() =>
              !isPlaying && onModeChange(VISUALIZATION_MODES.MANUAL)
            }
            disabled={isPlaying}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
              mode === VISUALIZATION_MODES.MANUAL
                ? 'bg-blue-500 text-white shadow-md border-blue-500'
                : 'bg-transparent text-gray-700 hover:bg-white hover:shadow-sm cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <Hand size={16} />
            Manual
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {mode === VISUALIZATION_MODES.AUTOPLAY
            ? 'Animation plays automatically at selected speed'
            : 'Use step controls to advance manually'}
        </p>
      </div>

      <div className={mode === VISUALIZATION_MODES.MANUAL ? 'opacity-50' : ''}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Animation Speed: {speedOptions[currentSpeedIndex]?.label}
          {mode === VISUALIZATION_MODES.MANUAL && (
            <span className="text-xs text-gray-500 ml-2">(Autoplay only)</span>
          )}
        </label>

        <input
          type="range"
          min={0}
          max={speedOptions.length - 1}
          step={1}
          value={currentSpeedIndex}
          onChange={e =>
            onSpeedChange(speedOptions[parseInt(e.target.value, 10)].value)
          }
          disabled={isPlaying || mode === VISUALIZATION_MODES.MANUAL}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{speedOptions[0].label}</span>
          <span>{speedOptions[speedOptions.length - 1].label}</span>
        </div>
      </div>

      {algorithmType === ALGORITHM_TYPES.SORTING ? (
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
            onChange={e => onArraySizeChange(parseInt(e.target.value, 10))}
            disabled={isPlaying}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>100</span>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Grid Size
          </label>
          <div className="space-y-2">
            {gridSizeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => !isPlaying && onGridSizeChange(option.value)}
                disabled={isPlaying}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${
                  gridSize === option.value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isPlaying ? 'opacity-50' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {algorithmType === ALGORITHM_TYPES.PATHFINDING && (
        <button
          onClick={onGenerateArray}
          disabled={isPlaying}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-sm rounded-lg shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
        >
          <Shuffle size={18} />
          Random Start & End Points
        </button>
      )}
    </motion.div>
  );
}

export default SettingsPanel;
