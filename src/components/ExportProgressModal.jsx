/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import {
  Loader2,
  Square,
  Download,
  X,
  RectangleHorizontal,
  RectangleVertical,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal shown during video export.
 * Phase 'orientation': two big options (Horizontal / Vertical) to choose format.
 * Phase 'checking' | 'rendering': progress bar and Stop button.
 * Phase 'preview': video player with Download and Close.
 *
 * @param {boolean} open - Whether the modal is visible
 * @param {number} progress - 0–1 progress
 * @param {string} phase - 'orientation' | 'checking' | 'rendering' | 'preview'
 * @param {string | null} blobUrl - Object URL for video preview (when phase === 'preview')
 * @param {Function} onStop - Called when user clicks Stop
 * @param {Function} onClose - Called when user closes preview or orientation
 * @param {Function} onDownload - Called when user clicks Download
 * @param {Function} onOrientationSelect - Called when user selects orientation (horizontal | vertical)
 */
function ExportProgressModal({
  open,
  progress,
  phase,
  blobUrl,
  onStop,
  onClose,
  onDownload,
  onOrientationSelect,
}) {
  const { t } = useTranslation();
  const percent = Math.round(progress * 100);
  const isPreview = phase === 'preview';
  const isOrientation = phase === 'orientation';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-progress-title"
          aria-describedby="export-progress-desc"
        >
          <motion.div
            className={`relative bg-surface rounded-xl shadow-2xl w-full p-6 ${
              isPreview ? 'max-w-2xl' : isOrientation ? 'max-w-xl' : 'max-w-md'
            }`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {(isPreview || isOrientation) && (
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={t('controls.closePreview')}
              >
                <X size={20} aria-hidden="true" />
              </button>
            )}
            <h2
              id="export-progress-title"
              className="text-lg font-bold text-text-primary mb-1"
            >
              {isPreview
                ? t('controls.exportPreview')
                : isOrientation
                  ? t('controls.exportOrientationTitle')
                  : t('controls.exportingTitle')}
            </h2>
            <p
              id="export-progress-desc"
              className="text-sm text-text-secondary mb-4"
            >
              {isPreview
                ? t('controls.exportPreviewDesc')
                : isOrientation
                  ? t('controls.exportOrientationDesc')
                  : phase === 'checking'
                    ? t('controls.exportingChecking')
                    : t('controls.exportingRendering')}
            </p>

            {isOrientation ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => onOrientationSelect?.('horizontal')}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 transition-all group"
                  aria-label={t('controls.exportOrientationHorizontal')}
                >
                  <div className="w-20 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 group-hover:bg-teal-500/20 flex items-center justify-center">
                    <RectangleHorizontal
                      size={28}
                      className="text-text-primary group-hover:text-teal-600"
                    />
                  </div>
                  <span className="font-semibold text-text-primary">
                    {t('controls.exportOrientationHorizontal')}
                  </span>
                  <span className="text-xs text-text-secondary text-center">
                    {t('controls.exportOrientationHorizontalDesc')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onOrientationSelect?.('vertical')}
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-teal-500 hover:bg-teal-500/5 dark:hover:bg-teal-500/10 transition-all group"
                  aria-label={t('controls.exportOrientationVertical')}
                >
                  <div className="w-12 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 group-hover:bg-teal-500/20 flex items-center justify-center">
                    <RectangleVertical
                      size={28}
                      className="text-text-primary group-hover:text-teal-600"
                    />
                  </div>
                  <span className="font-semibold text-text-primary">
                    {t('controls.exportOrientationVertical')}
                  </span>
                  <span className="text-xs text-text-secondary text-center">
                    {t('controls.exportOrientationVerticalDesc')}
                  </span>
                </button>
              </div>
            ) : isPreview ? (
              <div className="space-y-4">
                <div className="relative w-full rounded-lg overflow-hidden bg-black aspect-video">
                  <video
                    src={blobUrl ?? undefined}
                    controls
                    playsInline
                    className="w-full h-full"
                    aria-label={t('controls.exportPreview')}
                  />
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onDownload}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-medium transition-colors"
                    aria-label={t('controls.downloadVideo')}
                  >
                    <Download size={18} aria-hidden="true" />
                    {t('controls.downloadVideo')}
                  </button>
                </div>
              </div>
            ) : phase === 'checking' || phase === 'rendering' ? (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-text-secondary mb-2">
                    <span>
                      {phase === 'rendering'
                        ? t('controls.exportingProgress')
                        : null}
                    </span>
                    {phase === 'rendering' && (
                      <span className="font-semibold text-text-primary">
                        {percent}%
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600"
                      initial={{ width: 0 }}
                      animate={{
                        width: phase === 'checking' ? '30%' : `${percent}%`,
                      }}
                      transition={{ type: 'tween', duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  {phase === 'checking' && (
                    <Loader2
                      size={24}
                      className="animate-spin text-teal-500"
                      aria-hidden="true"
                    />
                  )}
                  <button
                    type="button"
                    onClick={onStop}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                    aria-label={t('controls.stopExport')}
                  >
                    <Square size={18} aria-hidden="true" />
                    {t('controls.stopExport')}
                  </button>
                </div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExportProgressModal;
