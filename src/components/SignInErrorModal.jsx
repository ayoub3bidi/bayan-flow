/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Warning } from '@phosphor-icons/react';
import {
  fadeOverlayTransition,
  modalPanelInitial,
  modalPanelAnimate,
  modalPanelExit,
  modalPanelTransition,
} from '../motion/chromeMotion';
import { getFocusableElements } from '../utils/focusableElements';

/**
 * Modal shown when Google sign-in fails, so the header stays clean.
 * Sized like SignInPromptModal (max-w-md).
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 */
function SignInErrorModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const prevFocus = document.activeElement;
    closeButtonRef.current?.focus();

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'Tab' && dialogRef.current) {
        const focusableElements = getFocusableElements(dialogRef.current);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (prevFocus && typeof prevFocus.focus === 'function') {
        prevFocus.focus();
      }
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeOverlayTransition(reduceMotion)}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={t('accessBan.signInUnavailableTitle')}
          tabIndex={-1}
        >
          <motion.div
            className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-8"
            initial={modalPanelInitial(reduceMotion)}
            animate={modalPanelAnimate()}
            exit={modalPanelExit(reduceMotion)}
            transition={modalPanelTransition(reduceMotion)}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <Warning
                size={24}
                weight="bold"
                className="shrink-0 text-text-secondary"
                aria-hidden="true"
              />
              <h2 className="text-2xl font-bold text-text-primary">
                {t('accessBan.signInUnavailableTitle')}
              </h2>
            </div>
            <p className="text-text-secondary mb-8 leading-relaxed">
              {t('accessBan.signInUnavailable')}
            </p>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3 bg-interactive-bg text-text-primary rounded-xl border border-interactive-border font-medium transition-all duration-200 hover:bg-surface-elevated active:scale-[0.98]"
            >
              {t('common.close')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SignInErrorModal;
