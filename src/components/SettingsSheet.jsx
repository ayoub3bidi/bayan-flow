/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import {
  fadeOverlayTransition,
  getChromeTransition,
  OVERLAY_CLASS,
  sheetPanelVariants,
} from '../motion/chromeMotion';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import SettingsPanel from './SettingsPanel';

/**
 * Full-viewport settings sheet for the canvas-first mobile shell (&lt; lg).
 */
function SettingsSheet({ isOpen, onClose, settingsPanelProps }) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const panelRef = useRef(null);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && panelRef.current) {
      const closeButton = panelRef.current.querySelector(
        '[data-settings-sheet-close]'
      );
      closeButton?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="settings-sheet-backdrop"
            className={`fixed inset-0 ${OVERLAY_CLASS} z-50`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeOverlayTransition(reduceMotion)}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="settings-sheet-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t('controls.settingsSheetTitle')}
            className="fixed inset-0 z-50 flex flex-col bg-surface shadow-2xl overflow-hidden overscroll-contain"
            variants={sheetPanelVariants()}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={getChromeTransition(reduceMotion)}
          >
            <div className="flex items-center justify-between gap-3 shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 border-b border-[var(--color-border-strong)]">
              <h2 className="text-base font-semibold text-text-primary">
                {t('controls.settingsSheetTitle')}
              </h2>
              <button
                type="button"
                data-settings-sheet-close
                onClick={onClose}
                className="inline-flex items-center justify-center h-touch w-touch min-h-touch min-w-touch rounded-lg bg-surface-elevated text-text-primary hover:bg-border touch-manipulation"
                aria-label={t('controls.closeSettings')}
              >
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <SettingsPanel {...settingsPanelProps} />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default SettingsSheet;
