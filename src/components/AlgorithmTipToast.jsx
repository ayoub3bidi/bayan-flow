/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lightbulb, X } from '@phosphor-icons/react';
import {
  getChromeTransition,
  CHROME_DURATION_FAST,
} from '../motion/chromeMotion';

const TOAST_DURATION = 4000;

/**
 * Top-right motivational toast shown once per algorithm per session.
 * Highlights the chosen algorithm's real-world value and career/interview angle.
 */
export default function AlgorithmTipToast({ algorithmKey, onClose }) {
  const { t, i18n } = useTranslation();
  const reduceMotion = useReducedMotion();
  const isRTL = i18n.dir() === 'rtl';
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      onClose();
    }, TOAST_DURATION);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [algorithmKey, onClose]);

  const message = t(`algorithmUses.${algorithmKey}`, {
    defaultValue: '',
  });

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={getChromeTransition(reduceMotion, CHROME_DURATION_FAST)}
      className={`fixed top-4 ${isRTL ? 'left-4' : 'right-4'} z-50 max-w-sm rounded-xl border border-[var(--color-border-strong)] bg-surface-elevated px-4 py-3 shadow-lg`}
    >
      <div className="flex items-start gap-2.5">
        <Lightbulb
          size={18}
          weight="fill"
          className="shrink-0 mt-0.5 text-amber-500"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            {t('app.algorithmTipTitle')}
          </p>
          {message ? (
            <p className="mt-0.5 text-sm leading-relaxed text-text-primary">
              {message}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="shrink-0 rounded p-0.5 text-text-tertiary transition-colors hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <X size={14} weight="bold" />
        </button>
      </div>
    </motion.div>
  );
}
