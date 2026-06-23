/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * Insight FAB — amber colour, positioned below the Code FAB.
 */
export default function InsightFloatingActionButton({
  onClick,
  disabled = false,
  label = 'Insight',
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const buttonText = t('insight_panel.insightLabel', {
    defaultValue: 'Insight',
  });

  return (
    <>
      {/* Desktop: Side FAB */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          hidden md:flex
          fixed ${isRTL ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-50 mt-44
          h-32 w-14 bg-amber-500 hover:bg-amber-600
          disabled:bg-disabled-bg disabled:cursor-not-allowed
          text-white ${isRTL ? 'rounded-r-xl' : 'rounded-l-xl'} shadow-lg hover:shadow-xl
          flex-col items-center justify-center gap-2
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
        `}
        style={{ marginTop: '10rem' }}
        initial={{ x: isRTL ? -48 : 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isRTL ? -48 : 48, opacity: 0 }}
        whileHover={{ x: disabled ? 0 : isRTL ? 4 : -4 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        aria-label={label}
        title={label}
      >
        <span className="font-medium writing-mode-vertical transform rotate-360">
          {buttonText}
        </span>
      </motion.button>

      {/* Mobile: Bottom FAB */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          flex md:hidden
          fixed bottom-20 ${isRTL ? 'left-4' : 'right-4'} z-50
          w-14 h-14 min-w-[56px] min-h-[56px] bg-amber-500 hover:bg-amber-600
          disabled:bg-disabled-bg disabled:cursor-not-allowed
          text-white rounded-full shadow-lg hover:shadow-xl
          items-center justify-center
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
          touch-manipulation
        `}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        aria-label={label}
        title={label}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
          aria-hidden="true"
        >
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
          <path d="M9 18h6" />
          <path d="M10 22h4" />
        </svg>
      </motion.button>
    </>
  );
}
