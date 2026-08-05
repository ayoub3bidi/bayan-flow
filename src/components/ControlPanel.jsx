/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, useReducedMotion } from 'framer-motion';
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
  Gear,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_CONFIG } from '../registry/categoryConfig';
import { ALGORITHM_TYPES, SORT_ORDERS } from '../constants';
import { getChromeTransition, ENTER_Y } from '../motion/chromeMotion';
import { useIsBelowLg } from '../hooks/useIsBelowLg';

/**
 * ControlPanel Component
 * Provides controls for the visualization playback
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
  onSeek,
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
  isGated = false,
  onGatedFeatureClick,
  onOpenSettings,
  visualizationsRemaining = null,
}) {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const isRTL = i18n.dir() === 'rtl';
  const isBelowLg = useIsBelowLg();

  const buttonBaseClasses =
    'p-3 h-touch rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation leading-tight-consistent';

  const BackwardIcon = isRTL ? SkipForward : SkipBack;
  const ForwardIcon = isRTL ? SkipBack : SkipForward;

  const hasDataRefresh =
    CATEGORY_CONFIG[algorithmType]?.features?.hasDataRefresh === true;
  const isSorting = algorithmType === ALGORITHM_TYPES.SORTING;
  const isExporting = exportState === 'checking' || exportState === 'rendering';
  const progressPct =
    totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  const isSeekLocked = isGated && totalSteps > 0;

  const handleSortOrderClick = () => {
    if (isGated) {
      onGatedFeatureClick?.('category_controls');
      return;
    }
    onSortOrderChange?.(
      sortOrder === SORT_ORDERS.ASCENDING
        ? SORT_ORDERS.DESCENDING
        : SORT_ORDERS.ASCENDING
    );
  };

  const featureButtons = (
    <>
      {hasDataRefresh && (
        <button
          type="button"
          onClick={onGenerateInput}
          disabled={isPlaying}
          className={`${buttonBaseClasses} bg-blue-500 hover:bg-blue-600 text-white`}
          title={t('controls.generateInput')}
          aria-label={t('controls.generateInput')}
        >
          <ArrowsClockwise size={20} weight="bold" aria-hidden="true" />
        </button>
      )}

      {isSorting && (
        <button
          type="button"
          onClick={handleSortOrderClick}
          disabled={isPlaying}
          className={`${buttonBaseClasses} bg-indigo-500 hover:bg-indigo-600 text-white ${isGated ? 'opacity-60' : ''}`}
          title={
            sortOrder === SORT_ORDERS.DESCENDING
              ? t('controls.descending')
              : t('controls.ascending')
          }
          aria-label={t('controls.sortOrder')}
        >
          {sortOrder === SORT_ORDERS.DESCENDING ? (
            <SortDescending size={20} weight="bold" aria-hidden="true" />
          ) : (
            <SortAscending size={20} weight="bold" aria-hidden="true" />
          )}
        </button>
      )}

      <button
        type="button"
        onClick={onToggleSound}
        disabled={isSoundTogglePending}
        className={`${buttonBaseClasses} ${
          isSoundEnabled
            ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md'
            : 'bg-surface-elevated hover:bg-border text-text-primary'
        } ${isGated ? 'opacity-60 hover:opacity-80' : ''}`}
        title={isSoundEnabled ? t('settings.soundOn') : t('settings.soundOff')}
        aria-label={
          isSoundEnabled ? t('settings.soundOn') : t('settings.soundOff')
        }
        aria-pressed={isSoundEnabled}
      >
        {isSoundEnabled ? (
          <SpeakerHigh size={20} weight="bold" aria-hidden="true" />
        ) : (
          <SpeakerX size={20} weight="bold" aria-hidden="true" />
        )}
      </button>

      {isExporting ? (
        <button
          type="button"
          onClick={onCancelExport}
          className={`${buttonBaseClasses} bg-red-500 hover:bg-red-600 text-white`}
          title={t('controls.stopExport')}
          aria-label={t('controls.stopExport')}
        >
          <Square size={20} weight="bold" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onExportVideo}
          disabled={totalSteps === 0}
          className={`${buttonBaseClasses} bg-teal-500 hover:bg-teal-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed ${isGated ? 'opacity-60 hover:opacity-80' : ''}`}
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
          <VideoCamera size={20} weight="bold" aria-hidden="true" />
        </button>
      )}

      <button
        type="button"
        onClick={onToggleFullScreen}
        className={`${buttonBaseClasses} bg-purple-500 hover:bg-purple-600 text-white ${isGated ? 'opacity-60 hover:opacity-80' : ''}`}
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
          <ArrowsIn size={20} weight="bold" aria-hidden="true" />
        ) : (
          <ArrowsOut size={20} weight="bold" aria-hidden="true" />
        )}
      </button>
    </>
  );

  return (
    <motion.div
      className="bg-surface rounded-lg shadow-lg p-3 sm:p-4 leading-consistent shrink-0"
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: ENTER_Y }}
      animate={{ opacity: 1, y: 0 }}
      transition={getChromeTransition(reduceMotion)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center gap-2 sm:gap-4">
        <div className="hidden sm:block flex-1 min-w-0" />

        <div className="flex items-center justify-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onStepBackward}
            disabled={isPlaying || currentStep === 0}
            className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
            title={t('controls.stepBackward')}
            aria-label={t('controls.stepBackward')}
          >
            <BackwardIcon size={20} weight="bold" aria-hidden="true" />
          </button>

          {mode === 'autoplay' &&
            (isPlaying ? (
              <button
                type="button"
                onClick={onPause}
                className={`${buttonBaseClasses} bg-amber-500 hover:bg-amber-600 text-white`}
                title={t('controls.pause')}
                aria-label={t('controls.pause')}
              >
                <Pause size={20} weight="bold" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onPlay}
                disabled={isComplete}
                className={`${buttonBaseClasses} bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300`}
                title={t('controls.play')}
                aria-label={t('controls.play')}
              >
                <Play size={20} weight="bold" aria-hidden="true" />
              </button>
            ))}

          <button
            type="button"
            onClick={onReset}
            disabled={isPlaying}
            className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
            title={t('controls.reset')}
            aria-label={t('controls.reset')}
          >
            <ArrowCounterClockwise size={20} weight="bold" aria-hidden="true" />
          </button>

          {mode === 'manual' && (
            <button
              type="button"
              onClick={onStepForward}
              disabled={isPlaying || isComplete}
              className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
              title={t('controls.stepForward')}
              aria-label={t('controls.stepForward')}
            >
              <ForwardIcon size={20} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-1 justify-center sm:justify-end items-center gap-2 min-w-0 w-full sm:w-auto">
          {isBelowLg ? (
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {onOpenSettings ? (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
                  title={t('controls.openSettings')}
                  aria-label={t('controls.openSettings')}
                >
                  <Gear size={20} weight="bold" aria-hidden="true" />
                </button>
              ) : null}
              {featureButtons}
            </div>
          ) : (
            featureButtons
          )}
        </div>
      </div>

      <div className="mt-4">
        {visualizationsRemaining != null &&
        Number.isFinite(visualizationsRemaining) ? (
          <p
            className="mb-2 text-xs text-text-secondary text-center sm:text-start"
            role="status"
          >
            {t('info.visualizationsRemaining', {
              count: visualizationsRemaining,
            })}
          </p>
        ) : null}
        <div className="flex justify-between text-xs text-text-secondary mb-1">
          <span>
            {t('info.step', { current: currentStep + 1, total: totalSteps })}
          </span>
          <span>
            {totalSteps} {t('info.steps')}
          </span>
        </div>
        <div
          className={`relative w-full ${isSeekLocked ? 'cursor-pointer' : ''}`}
          role={isSeekLocked ? 'button' : undefined}
          tabIndex={isSeekLocked ? 0 : undefined}
          aria-label={isSeekLocked ? t('controls.dragToSeekLocked') : undefined}
          onClick={() => {
            if (isSeekLocked) onGatedFeatureClick?.('timeline_scrub');
          }}
          onKeyDown={e => {
            if (isSeekLocked && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onGatedFeatureClick?.('timeline_scrub');
            }
          }}
        >
          <div className="relative h-2.5 w-full">
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full shadow-inner"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            {totalSteps > 0 && (
              <motion.div
                data-testid="seek-thumb"
                aria-hidden="true"
                initial={false}
                animate={
                  isRTL
                    ? { right: `${progressPct}%` }
                    : { left: `${progressPct}%` }
                }
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-blue-500 bg-white shadow-md ${
                  isRTL ? 'translate-x-1/2' : '-translate-x-1/2'
                }`}
              />
            )}
          </div>
          {!isGated && onSeek && (
            <input
              type="range"
              className="absolute inset-x-0 top-0 h-2.5 w-full cursor-pointer appearance-none bg-transparent opacity-0"
              min={0}
              max={totalSteps > 0 ? totalSteps - 1 : 0}
              value={currentStep}
              onChange={event => onSeek(Number(event.target.value))}
              disabled={totalSteps === 0}
              aria-label={t('controls.seekTimeline')}
              title={t('controls.seekTimeline')}
            />
          )}
        </div>
        {!isGated && onSeek && totalSteps > 0 && (
          <p className="mt-1 text-xs text-text-secondary text-center sm:text-start">
            {t('controls.dragToSeek')}
          </p>
        )}
        {isSeekLocked && (
          <p className="mt-1 text-xs text-text-secondary text-center sm:text-start">
            {t('controls.dragToSeekLocked')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default ControlPanel;
