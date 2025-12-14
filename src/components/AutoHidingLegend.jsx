import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function AutoHidingLegend({ legendItems, isComplete }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAutoShown, setHasAutoShown] = useState(false);

  useEffect(() => {
    if (!hasAutoShown && !isComplete) {
      setIsExpanded(true);
      const timer = setTimeout(() => {
        setIsExpanded(false);
        setHasAutoShown(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [hasAutoShown, isComplete]);

  useEffect(() => {
    if (isComplete) {
      setHasAutoShown(false);
    }
  }, [isComplete]);

  return (
    <div className="absolute top-2 right-2 z-10">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="legend-expanded"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-surface-elevated/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 min-w-[180px]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-primary">
                {t('legend.title')}
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors touch-manipulation"
                aria-label={t('legend.close')}
              >
                <X size={14} className="text-text-secondary" />
              </button>
            </div>
            <div className="space-y-1.5">
              {legendItems.map(item => (
                <div key={item.state} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded shadow-sm flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] font-medium text-text-primary">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="legend-button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(true)}
            className="bg-surface-elevated/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-surface-elevated hover:scale-105 transition-all touch-manipulation"
            aria-label={t('legend.show')}
          >
            <Info size={18} className="text-primary" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AutoHidingLegend;
