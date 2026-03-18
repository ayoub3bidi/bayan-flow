/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import { Loader2, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal shown during video export with progress bar and Stop button.
 *
 * @param {boolean} open - Whether the modal is visible
 * @param {number} progress - 0–1 progress
 * @param {string} phase - 'checking' | 'rendering'
 * @param {Function} onStop - Called when user clicks Stop
 */
function ExportProgressModal({ open, progress, phase, onStop }) {
  const { t } = useTranslation();
  const percent = Math.round(progress * 100);

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
            className="bg-surface rounded-xl shadow-2xl max-w-md w-full p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <h2
              id="export-progress-title"
              className="text-lg font-bold text-text-primary mb-1"
            >
              {t('controls.exportingTitle')}
            </h2>
            <p
              id="export-progress-desc"
              className="text-sm text-text-secondary mb-4"
            >
              {phase === 'checking'
                ? t('controls.exportingChecking')
                : t('controls.exportingRendering')}
            </p>

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
                onClick={() => {
                  onStop?.();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                aria-label={t('controls.stopExport')}
              >
                <Square size={18} aria-hidden="true" />
                {t('controls.stopExport')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ExportProgressModal;
