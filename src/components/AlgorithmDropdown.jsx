/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Check, CaretDown, Lock, Star } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { canAccessAlgorithm } from '@/services/entitlementService';

function AlgorithmDropdown({
  algorithms,
  algorithmGroups,
  selectedAlgorithm,
  onAlgorithmSelect,
  isDropdownOpen,
  setIsDropdownOpen,
  isPlaying,
  dropdownRef,
  user,
  categoryType,
  onLockedAlgorithmClick,
  isFavorite,
  onToggleFavorite,
  onFavoriteGatedClick,
  isAuthenticated,
}) {
  const { t } = useTranslation();

  const handleStarClick = (event, algo) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      onFavoriteGatedClick?.();
      return;
    }
    onToggleFavorite?.(categoryType, algo.value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !isPlaying && setIsDropdownOpen(!isDropdownOpen)}
        disabled={isPlaying}
        className="w-full px-4 py-3 min-h-[44px] bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg text-left flex items-center justify-between transition-all duration-200 hover:border-[#3b82f6] dark:hover:border-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] dark:focus:ring-[#60a5fa] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border-strong)] touch-manipulation leading-consistent"
      >
        <div className="flex flex-col">
          <span className="text-text-primary font-medium">
            {selectedAlgorithm
              ? algorithms.find(a => a.value === selectedAlgorithm)?.label
              : t('settings.selectAlgorithm')}
          </span>
          <span className="text-xs text-text-secondary mt-0.5">
            {algorithms.find(a => a.value === selectedAlgorithm)?.complexity ||
              ''}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isDropdownOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CaretDown
            size={20}
            weight="bold"
            className={`${isDropdownOpen ? 'text-[#3b82f6]' : 'text-text-tertiary'}`}
          />
        </motion.div>
      </button>
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-2 bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg shadow-xl overflow-hidden max-h-72 overflow-y-auto algo-dropdown"
          >
            {algorithmGroups.map((group, groupIndex) => (
              <div key={group.label}>
                <div className="px-4 py-2 text-xs font-bold text-text-tertiary uppercase tracking-wider sticky top-0 bg-surface-elevated z-10 border-b border-[var(--color-border-strong)]">
                  {group.label}
                </div>
                {group.algorithms.map((algoValue, index) => {
                  const algo = algorithms.find(a => a.value === algoValue);
                  if (!algo) return null;

                  const itemIndex =
                    algorithmGroups
                      .slice(0, groupIndex)
                      .reduce((acc, g) => acc + g.algorithms.length, 0) + index;

                  const isLocked =
                    categoryType &&
                    !canAccessAlgorithm(algo.value, categoryType, user);
                  const isSelected = selectedAlgorithm === algo.value;
                  const favorited =
                    isFavorite?.(categoryType, algo.value) ?? false;

                  return (
                    <motion.div
                      key={algo.value}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIndex * 0.03 }}
                      className={`group flex items-center w-full transition-colors duration-150 hover:bg-surface-elevated focus-within:bg-surface-elevated ${
                        isSelected
                          ? 'bg-theme-primary-light text-theme-primary dark:text-white'
                          : isLocked
                            ? 'text-text-primary opacity-60'
                            : 'text-text-primary'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isLocked) {
                            onLockedAlgorithmClick?.(algo);
                          } else {
                            onAlgorithmSelect(algo.value);
                          }
                        }}
                        className="flex-1 min-w-0 px-4 py-3 text-left flex items-center justify-between"
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span
                            className={`font-medium ${isSelected ? 'text-theme-primary dark:text-white' : ''}`}
                          >
                            {algo.label}
                          </span>
                          <span
                            className={`text-xs mt-0.5 ${
                              isSelected
                                ? 'text-text-secondary dark:text-white/80'
                                : 'text-text-secondary'
                            }`}
                          >
                            {t('settings.time')}: {algo.complexity}
                          </span>
                        </div>
                        {isSelected ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 25,
                            }}
                            className="shrink-0 ms-2"
                          >
                            <Check
                              size={18}
                              weight="bold"
                              className="text-[#3b82f6] dark:text-white"
                            />
                          </motion.div>
                        ) : isLocked ? (
                          <Lock
                            size={18}
                            weight="bold"
                            className="shrink-0 ms-2 text-text-tertiary"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                      {!isLocked && (
                        <button
                          type="button"
                          onClick={event => handleStarClick(event, algo)}
                          className={`shrink-0 p-2 me-2 rounded-lg touch-manipulation transition-opacity hover:bg-surface ${
                            favorited
                              ? 'opacity-100'
                              : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100'
                          }`}
                          aria-label={
                            favorited
                              ? t('settings.removeFavorite', {
                                  name: algo.label,
                                })
                              : t('settings.addFavorite', { name: algo.label })
                          }
                          aria-pressed={favorited}
                        >
                          <Star
                            size={18}
                            weight={favorited ? 'fill' : 'regular'}
                            className={
                              favorited
                                ? 'text-amber-500'
                                : 'text-text-tertiary hover:text-amber-500'
                            }
                          />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AlgorithmDropdown;
