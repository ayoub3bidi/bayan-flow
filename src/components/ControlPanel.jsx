/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  ArrowCounterClockwise,
  SkipBack,
  SkipForward,
  ArrowsClockwise,
  ArrowsOut,
  ArrowsIn,
  VideoCamera,
  Square,
  SortDescending,
  SortAscending,
  SpeakerHigh,
  SpeakerX,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_CONFIG } from '../registry/categoryConfig';
import { ALGORITHM_TYPES, SORT_ORDERS } from '../constants';

/**
 * ControlPanel Component
 * Provides controls for the visualization playback
 *
 * @param {boolean} isPlaying - Whether animation is currently playing
 * @param {boolean} isComplete - Whether animation has completed
 * @param {boolean} isAutoplayActive - Whether autoplay is currently active
 * @param {string} mode - Current visualization mode ('autoplay' or 'manual')
 * @param {Function} onPlay - Handler for play button
 * @param {Function} onPause - Handler for pause button
 * @param {Function} onReset - Handler for reset button
 * @param {Function} onStepForward - Handler for step forward button
 * @param {Function} onStepBackward - Handler for step backward button
 * @param {number} currentStep - Current step in the animation
 * @param {number} totalSteps - Total number of steps
 * @param {Function} onGenerateInput - Handler for generating new category input
 * @param {string} algorithmType - Current algorithm type ('sorting' | 'pathfinding' | 'searching')
 * @param {string} [sortOrder] - SORT_ORDERS (sorting only)
 * @param {Function} [onSortOrderChange] - Toggle sort input order (sorting only)
 * @param {boolean} isFullScreen - Whether full-screen mode is active
 * @param {Function} onToggleFullScreen - Handler for toggling full-screen mode
 * @param {Function} onExportVideo - Handler for export video button
 * @param {Function} onCancelExport - Handler for stop/cancel export (shown during export)
 * @param {string} exportState - 'idle' | 'checking' | 'rendering' | 'done' | 'error'
 * @param {number} exportProgress - 0-1 progress when rendering
 * @param {boolean|null} canRenderOnWeb - Whether browser supports web render (null = unknown)
 * @param {boolean} [isSoundEnabled] - Whether UI sound is currently enabled
 * @param {boolean} [isSoundTogglePending] - Whether the sound toggle is waiting on audio setup
 * @param {Function} [onToggleSound] - Handler for sound toggle button
 */
function ControlPanel({
  isPlaying,
  isComplete,
  mode,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  currentStep,
  totalSteps,
  onGenerateInput,
  algorithmType,
  sortOrder = SORT_ORDERS.ASCENDING,
  onSortOrderChange,
  isFullScreen,
  onToggleFullScreen,
  onExportVideo,
  onCancelExport,
  exportState = 'idle',
  exportProgress: _exportProgress = 0,
  canRenderOnWeb = null,
  isSoundEnabled = false,
  isSoundTogglePending = false,
  onToggleSound,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const buttonBaseClasses =
    'p-3 h-touch rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation leading-tight-consistent';

  // Icon components that flip in RTL
  const BackwardIcon = isRTL ? SkipForward : SkipBack;
  const ForwardIcon = isRTL ? SkipBack : SkipForward;

  return (
    <motion.div
      className="bg-surface rounded-lg shadow-lg p-3 sm:p-4 leading-consistent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center gap-3 sm:gap-4">
        {/* Spacer for centering on desktop only */}
        <div className="hidden sm:block flex-1 min-w-0" />

        {/* Principal controls - centered: Backward, Reset/Play|Pause, Forward */}
        <div className="flex items-center justify-center gap-2 shrink-0">
          {/* Step Backward - Always visible */}
          <button
            onClick={onStepBackward}
            disabled={isPlaying || currentStep === 0}
            className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
            title={t('controls.stepBackward')}
            aria-label={t('controls.stepBackward')}
          >
            <BackwardIcon size={20} aria-hidden="true" />
          </button>

          {/* Play/Pause Button - Different behavior based on mode */}
          {mode === 'autoplay' &&
            (isPlaying ? (
              <button
                onClick={onPause}
                className={`${buttonBaseClasses} bg-amber-500 hover:bg-amber-600 text-white`}
                title={t('controls.pause')}
                aria-label={t('controls.pause')}
              >
                <Pause size={20} aria-hidden="true" />
              </button>
            ) : (
              <button
                onClick={onPlay}
                disabled={isComplete}
                className={`${buttonBaseClasses} bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300`}
                title={t('controls.play')}
                aria-label={t('controls.play')}
              >
                <Play size={20} aria-hidden="true" />
              </button>
            ))}

          {/* Reset Button */}
          <button
            onClick={onReset}
            disabled={isPlaying}
            className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
            title={t('controls.reset')}
            aria-label={t('controls.reset')}
          >
            <ArrowCounterClockwise size={20} aria-hidden="true" />
          </button>

          {/* Step Forward - Only visible in manual mode */}
          {mode === 'manual' && (
            <button
              onClick={onStepForward}
              disabled={isPlaying || isComplete}
              className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
              title={t('controls.stepForward')}
              aria-label={t('controls.stepForward')}
            >
              <ForwardIcon size={20} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Feature buttons - centered on mobile, aligned right on desktop */}
        <div className="flex flex-1 justify-center sm:justify-end items-center gap-2 min-w-0 w-full sm:w-auto">
          {/* New data / shuffle — when CATEGORY_CONFIG.features.hasDataRefresh */}
          {CATEGORY_CONFIG[algorithmType]?.features?.hasDataRefresh ===
            true && (
            <button
              onClick={onGenerateInput}
              disabled={isPlaying}
              className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600 text-white`}
              title={t('controls.generateInput')}
              aria-label={t('controls.generateInput')}
            >
              <ArrowsClockwise size={20} aria-hidden="true" />
            </button>
          )}

          {algorithmType === ALGORITHM_TYPES.SORTING && (
            <button
              type="button"
              onClick={() => {
                onSortOrderChange?.(
                  sortOrder === SORT_ORDERS.ASCENDING
                    ? SORT_ORDERS.DESCENDING
                    : SORT_ORDERS.ASCENDING
                );
              }}
              disabled={isPlaying}
              className={`${buttonBaseClasses} bg-indigo-500 hover:bg-indigo-600 text-white`}
              title={
                sortOrder === SORT_ORDERS.DESCENDING
                  ? t('controls.descending')
                  : t('controls.ascending')
              }
              aria-label={t('controls.sortOrder')}
            >
              {sortOrder === SORT_ORDERS.DESCENDING ? (
                <SortDescending size={20} aria-hidden="true" />
              ) : (
                <SortAscending size={20} aria-hidden="true" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onToggleSound?.();
            }}
            disabled={isSoundTogglePending}
            className={`${buttonBaseClasses} ${
              isSoundEnabled
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
                : 'bg-surface-elevated hover:bg-border text-text-primary'
            }`}
            title={
              isSoundEnabled ? t('settings.soundOn') : t('settings.soundOff')
            }
            aria-label={
              isSoundEnabled ? t('settings.soundOn') : t('settings.soundOff')
            }
            aria-pressed={isSoundEnabled}
          >
            {isSoundEnabled ? (
              <SpeakerHigh size={20} aria-hidden="true" />
            ) : (
              <SpeakerX size={20} aria-hidden="true" />
            )}
          </button>

          {/* Export Video / Stop Export */}
          {exportState === 'checking' || exportState === 'rendering' ? (
            <button
              onClick={onCancelExport}
              className={`${buttonBaseClasses} bg-red-500 hover:bg-red-600 text-white`}
              title={t('controls.stopExport')}
              aria-label={t('controls.stopExport')}
            >
              <Square size={20} aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={onExportVideo}
              disabled={totalSteps === 0}
              className={`${buttonBaseClasses} bg-teal-500 hover:bg-teal-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed`}
              title={
                canRenderOnWeb === false
                  ? t('controls.browserNotSupported')
                  : exportState === 'done'
                    ? t('controls.exportDone')
                    : exportState === 'error'
                      ? t('controls.exportError')
                      : t('controls.exportVideo')
              }
              aria-label={t('controls.exportVideo')}
            >
              <VideoCamera size={20} aria-hidden="true" />
            </button>
          )}

          {/* Full Screen Toggle */}
          <button
            onClick={onToggleFullScreen}
            className={`${buttonBaseClasses} bg-purple-500 hover:bg-purple-600 text-white`}
            title={
              isFullScreen
                ? t('controls.exitFullScreen')
                : t('controls.goFullScreen')
            }
            aria-label={
              isFullScreen
                ? t('controls.exitFullScreen')
                : t('controls.goFullScreen')
            }
          >
            {isFullScreen ? (
              <ArrowsIn size={20} aria-hidden="true" />
            ) : (
              <ArrowsOut size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>
            {t('info.step', { current: currentStep + 1, total: totalSteps })}
          </span>
          <span>
            {totalSteps} {t('info.steps')}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full shadow-inner"
            initial={{ width: '0%' }}
            animate={{
              width: `${totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0}%`,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default ControlPanel;
