import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
      className="bg-surface rounded-lg shadow-lg p-6 space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-3">
          Algorithm Type
        </label>
        <div className="flex rounded-lg border-2 border-[var(--color-border-strong)] overflow-hidden bg-surface-elevated">
          <button
            onClick={() =>
              !isPlaying && onAlgorithmTypeChange(ALGORITHM_TYPES.SORTING)
            }
            disabled={isPlaying}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
              algorithmType === ALGORITHM_TYPES.SORTING
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
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
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <Grid3x3 size={16} />
            Pathfinding
          </button>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Chosen Algorithm
        </label>
        <button
          onClick={() => !isPlaying && setIsDropdownOpen(!isDropdownOpen)}
          disabled={isPlaying}
          className="w-full px-4 py-3 bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg text-left flex items-center justify-between transition-all duration-200 hover:border-[#3b82f6] dark:hover:border-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] dark:focus:ring-[#60a5fa] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border-strong)]"
        >
          <div className="flex flex-col">
            <span className="text-text-primary font-medium">
              {selectedAlgo?.label || 'Select algorithm'}
            </span>
            <span className="text-xs text-text-secondary mt-0.5">
              {selectedAlgo?.complexity || ''}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown
              size={20}
              className={`${isDropdownOpen ? 'text-[#3b82f6]' : 'text-text-tertiary'}`}
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
              className="absolute z-10 w-full mt-2 bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg shadow-xl overflow-hidden"
            >
              {algorithms.map((algo, index) => (
                <motion.button
                  key={algo.value}
                  onClick={() => handleAlgorithmSelect(algo.value)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-150 hover:bg-surface-elevated ${
                    selectedAlgorithm === algo.value
                      ? 'bg-theme-primary-light text-theme-primary'
                      : 'text-text-primary'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{algo.label}</span>
                    <span className="text-xs text-text-secondary mt-0.5">
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
                      <Check size={18} className="text-[#3b82f6]" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-3">
          Control Mode
        </label>
        <div className="flex rounded-lg border-2 border-[var(--color-border-strong)] overflow-hidden bg-surface-elevated">
          <button
            onClick={() =>
              !isPlaying && onModeChange(VISUALIZATION_MODES.AUTOPLAY)
            }
            disabled={isPlaying}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
              mode === VISUALIZATION_MODES.AUTOPLAY
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
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
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <Hand size={16} />
            Manual
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          {mode === VISUALIZATION_MODES.AUTOPLAY
            ? 'Animation plays automatically at selected speed'
            : 'Use step controls to advance manually'}
        </p>
      </div>

      <div className={mode === VISUALIZATION_MODES.MANUAL ? 'opacity-50' : ''}>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          Animation Speed: {speedOptions[currentSpeedIndex]?.label}
          {mode === VISUALIZATION_MODES.MANUAL && (
            <span className="text-xs text-text-secondary ml-2">
              (Autoplay only)
            </span>
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

        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>{speedOptions[0].label}</span>
          <span>{speedOptions[speedOptions.length - 1].label}</span>
        </div>
      </div>

      {algorithmType === ALGORITHM_TYPES.SORTING ? (
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
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
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>5</span>
            <span>100</span>
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            Grid Size
          </label>
          <div className="flex gap-2">
            {gridSizeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => !isPlaying && onGridSizeChange(option.value)}
                disabled={isPlaying}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed ${
                  gridSize === option.value
                    ? 'bg-theme-primary-consistent text-white shadow-md'
                    : 'bg-surface-elevated text-text-primary hover:bg-border'
                } ${isPlaying ? 'opacity-50' : ''}`}
              >
                {option.value}×{option.value}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SettingsPanel;
