/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Full-screen swipe tutorial overlay with attractive animations
 * @param {boolean} show - Whether to show the tutorial
 * @param {Function} onDismiss - Callback when tutorial is dismissed
 */
function SwipeTutorial({ show, onDismiss }) {
  const { t } = useTranslation();
  // Auto-dismiss after 3 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center sm:hidden"
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center px-8"
          onClick={e => e.stopPropagation()}
        >
          {/* Main instruction text */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-white text-xl font-bold mb-8"
          >
            {t('swipe_tutorial.title')}
          </motion.h2>

          {/* Animated arrows with glove-like hands */}
          <div className="flex items-center justify-center gap-12 mb-8">
            {/* Left swipe animation */}
            <motion.div
              animate={{
                x: [-20, 0, -20],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <ChevronLeft size={24} className="text-blue-600" />
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white text-sm font-medium"
              >
                {t('controls.stepBackward')}
              </motion.div>
            </motion.div>

            {/* Center phone illustration */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5, type: 'spring' }}
              className="w-16 h-24 bg-white rounded-lg flex items-center justify-center shadow-xl"
            >
              <motion.div
                animate={{
                  x: [-8, 8, -8],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-8 h-1 bg-blue-500 rounded-full"
              />
            </motion.div>

            {/* Right swipe animation */}
            <motion.div
              animate={{
                x: [20, 0, 20],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.75,
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <ChevronRight size={24} className="text-blue-600" />
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
                className="text-white text-sm font-medium"
              >
                {t('controls.stepForward')}
              </motion.div>
            </motion.div>
          </div>

          {/* Tap to dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-white/70 text-sm"
          >
            {t('swipe_tutorial.gotIt')}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SwipeTutorial;
