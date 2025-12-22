/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Check,
  Play,
  Hand,
  Grid3x3,
  BarChart3,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
  ALGORITHM_TYPES,
  GRID_SIZES,
} from '../constants';
import { soundManager } from '../utils/soundManager';

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
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const dropdownRef = useRef(null);

  const sortingAlgorithms = [
    {
      value: 'bubbleSort',
      label: t('algorithms.sorting.bubbleSort'),
      complexity: t('complexity.bubbleSort'),
    },
    {
      value: 'quickSort',
      label: t('algorithms.sorting.quickSort'),
      complexity: t('complexity.quickSort'),
    },
    {
      value: 'mergeSort',
      label: t('algorithms.sorting.mergeSort'),
      complexity: t('complexity.mergeSort'),
    },
    {
      value: 'selectionSort',
      label: t('algorithms.sorting.selectionSort'),
      complexity: t('complexity.selectionSort'),
    },
  ];

  const pathfindingAlgorithms = [
    {
      value: 'bfs',
      label: t('algorithms.pathfinding.bfs'),
      complexity: t('complexity.bfs'),
    },
    {
      value: 'dijkstra',
      label: t('algorithms.pathfinding.dijkstra'),
      complexity: t('complexity.dijkstra'),
    },
    {
      value: 'aStar',
      label: t('algorithms.pathfinding.aStar'),
      complexity: t('complexity.aStar'),
    },
  ];

  const algorithms =
    algorithmType === ALGORITHM_TYPES.SORTING
      ? sortingAlgorithms
      : pathfindingAlgorithms;

  const gridSizeOptions = [
    { value: GRID_SIZES.SMALL, label: t('gridSizes.small') },
    { value: GRID_SIZES.MEDIUM, label: t('gridSizes.medium') },
    { value: GRID_SIZES.LARGE, label: t('gridSizes.large') },
  ];

  const speedOptions = [
    { value: ANIMATION_SPEEDS.SLOW, label: t('speeds.slow') },
    { value: ANIMATION_SPEEDS.MEDIUM, label: t('speeds.medium') },
    { value: ANIMATION_SPEEDS.FAST, label: t('speeds.fast') },
    { value: ANIMATION_SPEEDS.VERY_FAST, label: t('speeds.veryFast') },
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

  const handleSoundToggle = async () => {
    if (isSoundEnabled) {
      soundManager.disable();
      setIsSoundEnabled(false);
    } else {
      await soundManager.enable();
      setIsSoundEnabled(true);
      soundManager.playUIClick();
    }
  };

  return (
    <motion.div
      className="bg-surface rounded-lg shadow-lg p-4 sm:p-6 space-y-consistent leading-consistent"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2 leading-tight-consistent">
          {t('settings.mode')}
        </label>
        <div className="flex rounded-lg border-2 border-[var(--color-border-strong)] overflow-hidden bg-surface-elevated">
          <button
            onClick={() =>
              !isPlaying && onAlgorithmTypeChange(ALGORITHM_TYPES.SORTING)
            }
            disabled={isPlaying}
            className={`flex-1 px-3 py-3 h-touch text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed touch-manipulation leading-tight-consistent ${
              algorithmType === ALGORITHM_TYPES.SORTING
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <BarChart3 size={16} />
            <span className="hidden sm:inline">{t('modes.sorting')}</span>
          </button>
          <button
            onClick={() =>
              !isPlaying && onAlgorithmTypeChange(ALGORITHM_TYPES.PATHFINDING)
            }
            disabled={isPlaying}
            className={`flex-1 px-3 py-3 h-touch text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed touch-manipulation leading-tight-consistent ${
              algorithmType === ALGORITHM_TYPES.PATHFINDING
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <Grid3x3 size={16} />
            <span className="hidden sm:inline">{t('modes.pathfinding')}</span>
          </button>
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-semibold text-text-primary mb-2 leading-tight-consistent">
          {t('settings.algorithm')}
        </label>
        <button
          onClick={() => !isPlaying && setIsDropdownOpen(!isDropdownOpen)}
          disabled={isPlaying}
          className="w-full px-4 py-3 min-h-[44px] bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg text-left flex items-center justify-between transition-all duration-200 hover:border-[#3b82f6] dark:hover:border-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] dark:focus:ring-[#60a5fa] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border-strong)] touch-manipulation leading-consistent"
        >
          <div className="flex flex-col">
            <span className="text-text-primary font-medium">
              {selectedAlgo?.label || t('settings.selectAlgorithm')}
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
                      {t('settings.time')}: {algo.complexity}
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
        <label className="block text-sm font-semibold text-text-primary mb-2 sm:mb-3">
          {t('settings.controlMode')}
        </label>
        <div className="flex rounded-lg border-2 border-[var(--color-border-strong)] overflow-hidden bg-surface-elevated">
          <button
            onClick={() =>
              !isPlaying && onModeChange(VISUALIZATION_MODES.AUTOPLAY)
            }
            disabled={isPlaying}
            className={`flex-1 px-3 py-3 min-h-[44px] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed touch-manipulation ${
              mode === VISUALIZATION_MODES.AUTOPLAY
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <Play size={16} />
            <span className="hidden sm:inline">{t('modes.autoplay')}</span>
          </button>
          <button
            onClick={() =>
              !isPlaying && onModeChange(VISUALIZATION_MODES.MANUAL)
            }
            disabled={isPlaying}
            className={`flex-1 px-3 py-3 min-h-[44px] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed touch-manipulation ${
              mode === VISUALIZATION_MODES.MANUAL
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
            } ${isPlaying ? 'opacity-50' : ''}`}
          >
            <Hand size={16} />
            <span className="hidden sm:inline">{t('modes.manual')}</span>
          </button>
        </div>
        <p className="text-xs text-text-secondary mt-2">
          {mode === VISUALIZATION_MODES.AUTOPLAY
            ? t('settings.autoplayDescription')
            : t('settings.manualDescription')}
        </p>
      </div>

      <div className={mode === VISUALIZATION_MODES.MANUAL ? 'opacity-50' : ''}>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t('settings.speed')}: {speedOptions[currentSpeedIndex]?.label}
          {mode === VISUALIZATION_MODES.MANUAL && (
            <span className="text-xs text-text-secondary ml-2">
              ({t('modes.autoplay')} {t('settings.autoplayOnly')})
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

      {/* Sound Toggle */}
      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t('settings.sound')}
        </label>
        <button
          onClick={handleSoundToggle}
          className={`flex items-center justify-center gap-2 w-full px-4 py-3 min-h-[44px] text-sm font-medium rounded-lg transition-all duration-200 touch-manipulation ${
            isSoundEnabled
              ? 'bg-theme-primary-consistent text-white shadow-md'
              : 'bg-surface-elevated text-text-primary hover:bg-border'
          }`}
        >
          {isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          {isSoundEnabled ? t('settings.soundOn') : t('settings.soundOff')}
        </button>
      </div>

      {algorithmType === ALGORITHM_TYPES.SORTING ? (
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {t('settings.arraySize')}: {arraySize}
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
            {t('settings.gridSize')}
          </label>
          <div className="flex gap-2">
            {gridSizeOptions.map(option => (
              <button
                key={option.value}
                onClick={() => !isPlaying && onGridSizeChange(option.value)}
                disabled={isPlaying}
                className={`flex-1 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed touch-manipulation ${
                  gridSize === option.value
                    ? 'bg-theme-primary-consistent text-white shadow-md'
                    : 'bg-surface-elevated text-text-primary hover:bg-border cursor-pointer'
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
