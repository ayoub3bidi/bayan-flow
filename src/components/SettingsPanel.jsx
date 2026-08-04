/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, Hand, Lightbulb } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { getChromeTransition, ENTER_Y } from '../motion/chromeMotion';
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
import {
  canUseManualControls,
  canChangeSpeed,
  canUseCategoryControls,
} from '../services/entitlementService';
import AlgorithmDropdown from './AlgorithmDropdown';
import FavoritesDropdown from './FavoritesDropdown';
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
  user,
  onLockedAlgorithmClick,
  onGatedFeatureClick,
  favorites,
  favoriteSlotLimit,
  onFavoriteSelect,
  isFavorite,
  onToggleFavorite,
  onFavoriteGatedClick,
  isAuthenticated,
}) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [isAlgorithmDropdownOpen, setIsAlgorithmDropdownOpen] = useState(false);
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const algorithmDropdownRef = useRef(null);
  const scenarioDropdownRef = useRef(null);

  const { byType } = useAlgorithmConfig();
  const { speedOptions } = useSettingsConfig();

  const { algorithms, groups } = byType[algorithmType];

  const algorithmUseCase = t(`algorithmUses.${selectedAlgorithm}`, {
    defaultValue: '',
  });

  const canUseManual = canUseManualControls(user);
  const canAdjustSpeed = canChangeSpeed(user);
  const canUseCategorySettings = canUseCategoryControls(user);

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
      className="bg-surface rounded-lg shadow-lg p-4 space-y-consistent-sm leading-consistent"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: ENTER_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={getChromeTransition(reduceMotion)}
    >
      {!isAuthenticated &&
        (!canUseManual || !canAdjustSpeed || !canUseCategorySettings) && (
          <p
            className="text-xs text-text-secondary rounded-lg bg-surface-elevated border border-[var(--color-border-strong)] px-3 py-2"
            role="note"
          >
            {t('settings.signInForAdvancedFeatures')}
          </p>
        )}

      {isAuthenticated && favorites && favoriteSlotLimit != null && (
        <FavoritesDropdown
          favorites={favorites}
          slotLimit={favoriteSlotLimit}
          onSelect={onFavoriteSelect}
          isPlaying={isPlaying}
        />
      )}

      <div>
        <label
          id="settings-algorithm-category-label"
          className="block text-sm font-semibold text-text-primary mb-1.5 leading-tight-consistent"
        >
          {t('settings.category')}
        </label>
        <div
          className="grid grid-cols-3 gap-2"
          role="group"
          aria-labelledby="settings-algorithm-category-label"
        >
          {ALGORITHM_TYPE_LIST.map(type => {
            const cfg = CATEGORY_CONFIG[type];
            const Icon = cfg.icon;
            const isActive = algorithmType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => !isPlaying && onAlgorithmTypeChange(type)}
                disabled={isPlaying}
                aria-pressed={isActive}
                aria-label={t(cfg.i18nTabKey)}
                title={t(cfg.i18nTabKey)}
                className={`group flex h-16 flex-col items-center justify-center gap-1.5 rounded-xl px-1 text-center transition-all duration-200 touch-manipulation leading-tight-consistent disabled:cursor-not-allowed hover:scale-110 focus-visible:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] disabled:hover:scale-100 ${
                  isActive
                    ? 'bg-theme-primary-consistent text-white shadow-md'
                    : 'bg-surface-elevated text-text-primary shadow-sm hover:bg-bg hover:shadow'
                } ${isPlaying ? 'opacity-50' : ''}`}
              >
                <Icon
                  size={22}
                  weight="bold"
                  className="shrink-0"
                  aria-hidden
                />
                <span className="max-h-6 overflow-hidden text-[11px] leading-none font-semibold opacity-100 transition-all duration-200 lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-6 lg:group-hover:opacity-100 lg:group-focus-visible:max-h-6 lg:group-focus-visible:opacity-100">
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
          user={user}
          categoryType={algorithmType}
          onLockedAlgorithmClick={onLockedAlgorithmClick}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onFavoriteGatedClick={onFavoriteGatedClick}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {algorithmUseCase && (
        <div className="flex items-start gap-2 rounded-lg border border-[var(--color-border-strong)] bg-surface-elevated px-3 py-2.5">
          <Lightbulb
            size={16}
            weight="fill"
            className="shrink-0 mt-0.5 text-amber-500"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-text-secondary">
            <span className="font-semibold text-text-primary">
              {t('settings.useCases')}:
            </span>{' '}
            {algorithmUseCase}
          </p>
        </div>
      )}

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
            areOptionsGated={!canUseCategorySettings}
            onLockedScenarioClick={() =>
              onGatedFeatureClick?.('category_controls')
            }
          />
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-semibold text-text-primary mb-1.5 leading-tight-consistent">
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
            <Play size={16} weight="bold" />
            <span className="hidden sm:inline">{t('modes.autoplay')}</span>
          </button>
          <button
            onClick={() => {
              if (!canUseManual) {
                onGatedFeatureClick?.('manual_controls');
              } else if (!isPlaying) {
                onModeChange(VISUALIZATION_MODES.MANUAL);
              }
            }}
            disabled={isPlaying}
            title={!canUseManual ? t('settings.signInForManual') : ''}
            className={`flex-1 px-3 py-3 min-h-[44px] text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed touch-manipulation ${
              mode === VISUALIZATION_MODES.MANUAL
                ? 'bg-theme-primary-consistent text-white shadow-md'
                : 'bg-transparent text-text-primary hover:bg-bg cursor-pointer'
            } ${isPlaying || !canUseManual ? 'opacity-50' : ''}`}
          >
            <Hand size={16} weight="bold" />
            <span className="hidden sm:inline">{t('modes.manual')}</span>
          </button>
        </div>
      </div>

      <div
        className={
          mode === VISUALIZATION_MODES.MANUAL || !canAdjustSpeed
            ? 'opacity-50'
            : ''
        }
      >
        <label className="block text-sm font-semibold text-text-primary mb-2">
          {t('settings.speed')}: {speedOptions[currentSpeedIndex]?.label}
          {mode === VISUALIZATION_MODES.MANUAL && (
            <span className="text-xs text-text-secondary ml-2">
              ({t('modes.autoplay')} {t('settings.autoplayOnly')})
            </span>
          )}
        </label>

        <div
          onClick={() => {
            if (!canAdjustSpeed && mode === VISUALIZATION_MODES.AUTOPLAY) {
              onGatedFeatureClick?.('speed_control');
            }
          }}
        >
          <input
            type="range"
            min={0}
            max={speedOptions.length - 1}
            step={1}
            value={currentSpeedIndex}
            onChange={e => {
              if (!canAdjustSpeed && mode === VISUALIZATION_MODES.AUTOPLAY) {
                onGatedFeatureClick?.('speed_control');
                return;
              }
              onSpeedChange(speedOptions[parseInt(e.target.value, 10)].value);
            }}
            disabled={isPlaying || mode === VISUALIZATION_MODES.MANUAL}
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none accent-blue-500 ${
              !canAdjustSpeed && mode === VISUALIZATION_MODES.AUTOPLAY
                ? 'opacity-50 cursor-pointer'
                : 'cursor-pointer'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>

        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>{speedOptions[0].label}</span>
          <span>{speedOptions[speedOptions.length - 1].label}</span>
        </div>
      </div>

      {sizeControl.type === 'slider' && !isPresetGraphScenarioSelected && (
        <div className={!canUseCategorySettings ? 'opacity-50' : ''}>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {t(sizeControl.i18nKey)}: {sizeValue}
          </label>
          <div
            onClick={() => {
              if (!canUseCategorySettings) {
                onGatedFeatureClick?.('category_controls');
              }
            }}
          >
            <input
              type="range"
              min={sizeControl.min}
              max={sizeControl.max}
              step={sizeControl.step}
              value={sizeValue}
              onChange={e => {
                if (!canUseCategorySettings) {
                  onGatedFeatureClick?.('category_controls');
                  return;
                }
                onSizeChange(parseInt(e.target.value, 10));
              }}
              disabled={isPlaying}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none accent-blue-500 ${
                !canUseCategorySettings
                  ? 'opacity-50 cursor-pointer'
                  : 'cursor-pointer'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          </div>
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
        <div className={!canUseCategorySettings ? 'opacity-50' : ''}>
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {t(sizeControl.i18nKey)}
            {!canUseCategorySettings && (
              <span className="text-xs text-text-secondary ml-2">
                ({t('settings.signInForCategoryControls')})
              </span>
            )}
          </label>
          <div className="flex gap-2">
            {sizeControl.options.map(optionValue => (
              <button
                key={optionValue}
                type="button"
                onClick={() => {
                  if (!canUseCategorySettings) {
                    onGatedFeatureClick?.('category_controls');
                  } else if (!isPlaying) {
                    onSizeChange(optionValue);
                  }
                }}
                disabled={isPlaying}
                className={`flex-1 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed touch-manipulation ${
                  sizeValue === optionValue
                    ? 'bg-theme-primary-consistent text-white shadow-md'
                    : 'bg-surface-elevated text-text-primary hover:bg-border cursor-pointer'
                } ${isPlaying || !canUseCategorySettings ? 'opacity-50' : ''}`}
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
