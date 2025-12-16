/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

/**
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether the button is disabled
 * @param {string} props.className - Additional CSS classes
 */
function FloatingActionButton({ onClick, disabled = false, className = '' }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <>
      {/* Desktop: Side FAB */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          hidden md:flex
          fixed ${isRTL ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-50
          h-32 w-12 bg-blue-600 hover:bg-blue-700 
          disabled:bg-disabled-bg disabled:cursor-not-allowed
          text-white ${isRTL ? 'rounded-r-xl' : 'rounded-l-xl'} shadow-lg hover:shadow-xl
          flex-col items-center justify-center gap-2
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${className}
        `}
        initial={{ [isRTL ? 'x' : 'x']: isRTL ? -48 : 48, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ [isRTL ? 'x' : 'x']: isRTL ? -48 : 48, opacity: 0 }}
        whileHover={{ x: disabled ? 0 : isRTL ? 4 : -4 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        aria-label={t('visualization.viewPythonCode')}
        title={t('visualization.viewPythonCode')}
      >
        <span className="font-medium writing-mode-vertical transform rotate-360">
          Code
        </span>
      </motion.button>

      {/* Mobile: Bottom FAB */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        className={`
          flex md:hidden
          fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-50
          w-14 h-14 min-w-[56px] min-h-[56px] bg-blue-600 hover:bg-blue-700 
          disabled:bg-disabled-bg disabled:cursor-not-allowed
          text-white rounded-full shadow-lg hover:shadow-xl
          items-center justify-center
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          touch-manipulation
          ${className}
        `}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
        aria-label={t('visualization.viewPythonCode')}
        title={t('visualization.viewPythonCode')}
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
          <polyline points={isRTL ? '8 18 2 12 8 6' : '16 18 22 12 16 6'} />
          <polyline points={isRTL ? '16 6 22 12 16 18' : '8 6 2 12 8 18'} />
        </svg>
      </motion.button>
    </>
  );
}

export default FloatingActionButton;
