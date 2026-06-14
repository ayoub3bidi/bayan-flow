/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Hand } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import {
  ALGORITHM_TYPES,
  VISUALIZATION_MODES,
  ALGORITHM_TYPE_LIST,
  SEARCH_GRAPH_NODE_COUNT,
  TREE_NODE_COUNT,
} from '../constants';
import { useAlgorithmConfig } from '../config/algorithmConfig';
import { useSettingsConfig } from '../config/settingsConfig';
import { CATEGORY_CONFIG } from '../registry/categoryConfig';
import { getGraphAlgorithmNodeCountRange } from '../registry/graphAlgorithmRegistry.js';
import { isNodeLinkSearchingAlgorithm } from '../registry/searchingSubstrate';
import AlgorithmDropdown from './AlgorithmDropdown';
import GraphScenarioDropdown from './GraphScenarioDropdown';

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
  searchGraphNodeCount,
  onSearchGraphNodeCountChange,
  treeNodeCount,
  onTreeNodeCountChange,
  graphNodeCount,
  onGraphNodeCountChange,
  selectedGraphScenario,
  onGraphScenarioChange,
  graphScenarioOptions = [],
  isPlaying,
  mode,
  onModeChange,
}) {
  const { t } = useTranslation();
  const [isAlgorithmDropdownOpen, setIsAlgorithmDropdownOpen] = useState(false);
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const algorithmDropdownRef = useRef(null);
  const scenarioDropdownRef = useRef(null);

  const { byType } = useAlgorithmConfig();
  const { speedOptions } = useSettingsConfig();

  const { algorithms, groups } = byType[algorithmType];

  const categoryConfig = CATEGORY_CONFIG[algorithmType];
  const graphNodeCountRange =
    getGraphAlgorithmNodeCountRange(selectedAlgorithm);
  const effectiveSizeBinding =
    algorithmType === ALGORITHM_TYPES.SEARCHING &&
    isNodeLinkSearchingAlgorithm(selectedAlgorithm)
      ? 'searchGraph'
      : categoryConfig.sizeBinding;

  const sizeControl =
    effectiveSizeBinding === 'searchGraph'
      ? {
          type: 'slider',
          i18nKey: 'settings.searchGraphNodeCount',
          min: SEARCH_GRAPH_NODE_COUNT.min,
          max: SEARCH_GRAPH_NODE_COUNT.max,
          step: SEARCH_GRAPH_NODE_COUNT.step,
        }
      : effectiveSizeBinding === 'tree'
        ? {
            type: 'slider',
            i18nKey: 'settings.treeNodeCount',
            min: TREE_NODE_COUNT.min,
            max: TREE_NODE_COUNT.max,
            step: TREE_NODE_COUNT.step,
          }
        : effectiveSizeBinding === 'graph'
          ? {
              type: 'slider',
              i18nKey: 'settings.graphNodeCount',
              min: graphNodeCountRange.min,
              max: graphNodeCountRange.max,
              step: graphNodeCountRange.step,
            }
          : categoryConfig.sizeControl;
  const isPresetGraphScenarioSelected =
    algorithmType === ALGORITHM_TYPES.GRAPH_ALGORITHM &&
    Boolean(selectedGraphScenario);

  const sizeValue =
    effectiveSizeBinding === 'array'
      ? arraySize
      : effectiveSizeBinding === 'searchGraph'
        ? searchGraphNodeCount
        : effectiveSizeBinding === 'tree'
          ? treeNodeCount
          : effectiveSizeBinding === 'graph'
            ? graphNodeCount
            : gridSize;
  const onSizeChange =
    effectiveSizeBinding === 'array'
      ? onArraySizeChange
      : effectiveSizeBinding === 'searchGraph'
        ? onSearchGraphNodeCountChange
        : effectiveSizeBinding === 'tree'
          ? onTreeNodeCountChange
          : effectiveSizeBinding === 'graph'
            ? onGraphNodeCountChange
            : onGridSizeChange;

  const currentSpeedIndex = Math.max(
    0,
    speedOptions.findIndex(s => s.value === speed)
  );

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        algorithmDropdownRef.current &&
        !algorithmDropdownRef.current.contains(event.target)
      ) {
        setIsAlgorithmDropdownOpen(false);
      }
      if (
        scenarioDropdownRef.current &&
        !scenarioDropdownRef.current.contains(event.target)
      ) {
        setIsScenarioDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      className="bg-surface rounded-lg shadow-lg p-4 sm:p-6 space-y-consistent leading-consistent"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div>
        <label
          id="settings-algorithm-mode-label"
          className="block text-sm font-semibold text-text-primary mb-2 leading-tight-consistent"
        >
          {t('settings.mode')}
        </label>
        <div
          className="grid grid-cols-2 gap-2 sm:gap-3"
          role="group"
          aria-labelledby="settings-algorithm-mode-label"
        >
          {ALGORITHM_TYPE_LIST.map((type, index) => {
            const cfg = CATEGORY_CONFIG[type];
            const Icon = cfg.icon;
            const isActive = algorithmType === type;
            const isLoneLastItem =
              ALGORITHM_TYPE_LIST.length % 2 === 1 &&
              index === ALGORITHM_TYPE_LIST.length - 1;
            return (
              <button
                key={type}
                type="button"
                onClick={() => !isPlaying && onAlgorithmTypeChange(type)}
                disabled={isPlaying}
                className={`min-h-touch flex flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-center transition-all duration-200 touch-manipulation leading-tight-consistent disabled:cursor-not-allowed ${
                  isLoneLastItem ? 'col-span-2' : ''
                } ${
                  isActive
                    ? 'bg-theme-primary-consistent text-white shadow-md'
                    : 'bg-surface-elevated text-text-primary shadow-sm hover:bg-bg hover:shadow'
                } ${isPlaying ? 'opacity-50' : ''}`}
              >
                <Icon size={20} className="shrink-0" aria-hidden />
                <span className="text-xs sm:text-sm font-semibold">
                  {t(cfg.i18nTabKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-2 leading-tight-consistent">
          {t('settings.algorithm')}
        </label>
        <AlgorithmDropdown
          algorithms={algorithms}
          algorithmGroups={groups}
          selectedAlgorithm={selectedAlgorithm}
          onAlgorithmSelect={onAlgorithmChange}
          isDropdownOpen={isAlgorithmDropdownOpen}
          setIsDropdownOpen={setIsAlgorithmDropdownOpen}
          isPlaying={isPlaying}
          dropdownRef={algorithmDropdownRef}
        />
      </div>

      {algorithmType === ALGORITHM_TYPES.GRAPH_ALGORITHM &&
      graphScenarioOptions.length > 0 ? (
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2 leading-tight-consistent">
            {t('controls.graphScenario')}
          </label>
          <GraphScenarioDropdown
            scenarioOptions={graphScenarioOptions}
            selectedScenario={selectedGraphScenario}
            onScenarioSelect={onGraphScenarioChange}
            isDropdownOpen={isScenarioDropdownOpen}
            setIsDropdownOpen={setIsScenarioDropdownOpen}
            isPlaying={isPlaying}
            dropdownRef={scenarioDropdownRef}
          />
        </div>
      ) : null}

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

      {sizeControl.type === 'slider' && !isPresetGraphScenarioSelected && (
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {t(sizeControl.i18nKey)}: {sizeValue}
          </label>
          <input
            type="range"
            min={sizeControl.min}
            max={sizeControl.max}
            step={sizeControl.step}
            value={sizeValue}
            onChange={e => onSizeChange(parseInt(e.target.value, 10))}
            disabled={isPlaying}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>{sizeControl.min}</span>
            <span>{sizeControl.max}</span>
          </div>
        </div>
      )}

      {isPresetGraphScenarioSelected ? (
        <p className="text-xs text-text-secondary">
          {t('settings.graphScenarioNodeCountLocked')}
        </p>
      ) : null}

      {sizeControl.type === 'buttons' && (
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {t(sizeControl.i18nKey)}
          </label>
          <div className="flex gap-2">
            {sizeControl.options.map(optionValue => (
              <button
                key={optionValue}
                type="button"
                onClick={() => !isPlaying && onSizeChange(optionValue)}
                disabled={isPlaying}
                className={`flex-1 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed touch-manipulation ${
                  sizeValue === optionValue
                    ? 'bg-theme-primary-consistent text-white shadow-md'
                    : 'bg-surface-elevated text-text-primary hover:bg-border cursor-pointer'
                } ${isPlaying ? 'opacity-50' : ''}`}
              >
                {optionValue}×{optionValue}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default SettingsPanel;
