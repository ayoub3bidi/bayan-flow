/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDown, Star } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_CONFIG } from '@/registry/categoryConfig';
import { useAlgorithmConfig } from '@/config/algorithmConfig';

/**
 * @typedef {Object} FavoriteItem
 * @property {string} category
 * @property {string} algorithm_key
 * @property {string} created_at
 */

/**
 * @param {Object} props
 * @param {FavoriteItem[]} props.favorites
 * @param {number} props.slotLimit
 * @param {(category: string, algorithmKey: string) => void} props.onSelect
 * @param {boolean} props.isPlaying
 */
function FavoritesDropdown({ favorites, slotLimit, onSelect, isPlaying }) {
  const { t } = useTranslation();
  const { byType } = useAlgorithmConfig();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resolveLabel = (category, algorithmKey) => {
    const algo = byType[category]?.algorithms.find(
      a => a.value === algorithmKey
    );
    return algo?.label ?? algorithmKey;
  };

  const resolveCategoryLabel = category => {
    const cfg = CATEGORY_CONFIG[category];
    return cfg ? t(cfg.i18nTabKey) : category;
  };

  const count = favorites.length;

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-text-primary mb-2 leading-tight-consistent">
        {t('settings.favoriteAlgorithms')}
        <span className="ms-2 text-xs font-normal text-text-secondary">
          {t('settings.favoriteSlotsUsed', { count, limit: slotLimit })}
        </span>
      </label>
      <button
        type="button"
        onClick={() => !isPlaying && setIsOpen(prev => !prev)}
        disabled={isPlaying}
        className="w-full px-4 py-3 min-h-[44px] bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg text-left flex items-center justify-between transition-all duration-200 hover:border-[#3b82f6] dark:hover:border-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] dark:focus:ring-[#60a5fa] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
      >
        <span className="flex items-center gap-2 text-text-primary font-medium">
          <Star size={18} weight="fill" className="text-amber-500 shrink-0" />
          {count === 0
            ? t('settings.favoriteAlgorithmsEmpty')
            : t('settings.favoriteAlgorithmsCount', { count })}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CaretDown
            size={20}
            weight="bold"
            className={isOpen ? 'text-[#3b82f6]' : 'text-text-tertiary'}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-2 bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg shadow-xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {count === 0 ? (
              <p className="px-4 py-3 text-sm text-text-secondary">
                {t('settings.favoriteAlgorithmsHint')}
              </p>
            ) : (
              favorites.map((item, index) => (
                <motion.button
                  key={`${item.category}:${item.algorithm_key}`}
                  type="button"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    onSelect(item.category, item.algorithm_key);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left flex flex-col gap-0.5 hover:bg-surface transition-colors"
                >
                  <span className="font-medium text-text-primary">
                    {resolveLabel(item.category, item.algorithm_key)}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {resolveCategoryLabel(item.category)}
                  </span>
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FavoritesDropdown;
