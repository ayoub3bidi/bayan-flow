/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useRef, useState } from 'react';
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
  DotsThree,
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
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);

  const buttonBaseClasses =
    'p-3 h-touch rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation leading-tight-consistent';

  const BackwardIcon = isRTL ? SkipForward : SkipBack;
  const ForwardIcon = isRTL ? SkipBack : SkipForward;

  const hasDataRefresh =
    CATEGORY_CONFIG[algorithmType]?.features?.hasDataRefresh === true;
  const isSorting = algorithmType === ALGORITHM_TYPES.SORTING;
  const isExporting = exportState === 'checking' || exportState === 'rendering';

  useEffect(() => {
    if (!isMoreOpen) return undefined;

    const handlePointerDown = event => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreOpen]);

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
          onClick={() => {
            setIsMoreOpen(false);
            onGenerateInput();
          }}
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
          onClick={() => {
            setIsMoreOpen(false);
            handleSortOrderClick();
          }}
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
        onClick={() => {
          setIsMoreOpen(false);
          onToggleSound?.();
        }}
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
          onClick={() => {
            setIsMoreOpen(false);
            onCancelExport();
          }}
          className={`${buttonBaseClasses} bg-red-500 hover:bg-red-600 text-white`}
          title={t('controls.stopExport')}
          aria-label={t('controls.stopExport')}
        >
          <Square size={20} weight="bold" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsMoreOpen(false);
            onExportVideo();
          }}
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
        onClick={() => {
          setIsMoreOpen(false);
          onToggleFullScreen();
        }}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center gap-3 sm:gap-4">
        <div className="hidden sm:block flex-1 min-w-0" />

        <div className="flex items-center justify-center gap-2 shrink-0">
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
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setIsMoreOpen(open => !open)}
                className={`${buttonBaseClasses} bg-surface-elevated hover:bg-border text-text-primary`}
                title={t('controls.moreActions')}
                aria-label={t('controls.moreActions')}
                aria-expanded={isMoreOpen}
                aria-haspopup="menu"
              >
                <DotsThree size={20} weight="bold" aria-hidden="true" />
              </button>
              {isMoreOpen ? (
                <div
                  role="menu"
                  className={`absolute z-30 bottom-full mb-2 ${
                    isRTL ? 'left-0' : 'right-0'
                  } flex flex-wrap gap-2 p-2 rounded-xl bg-surface-elevated border border-[var(--color-border-strong)] shadow-lg max-w-[min(100vw-2rem,20rem)]`}
                >
                  {featureButtons}
                </div>
              ) : null}
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
