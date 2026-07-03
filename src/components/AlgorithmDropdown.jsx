/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Check, CaretDown, Lock } from '@phosphor-icons/react';
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
}) {
  const { t } = useTranslation();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
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

                  return (
                    <motion.button
                      key={algo.value}
                      onClick={() => {
                        if (isLocked) {
                          onLockedAlgorithmClick?.(algo);
                        } else {
                          onAlgorithmSelect(algo.value);
                        }
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIndex * 0.03 }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-150 hover:bg-surface-elevated ${
                        isSelected
                          ? 'bg-theme-primary-light'
                          : isLocked
                            ? 'text-text-primary opacity-60'
                            : 'text-text-primary'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={`font-medium ${isSelected ? 'algo-dropdown-selected-label' : ''}`}
                        >
                          {algo.label}
                        </span>
                        <span
                          className={`text-xs mt-0.5 ${
                            isSelected
                              ? 'algo-dropdown-selected-meta'
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
                          className="shrink-0"
                        >
                          <Check
                            size={18}
                            weight="bold"
                            className="algo-dropdown-selected-check"
                          />
                        </motion.div>
                      ) : isLocked ? (
                        <Lock
                          size={18}
                          weight="bold"
                          className="shrink-0 text-text-tertiary"
                          aria-hidden="true"
                        />
                      ) : null}
                    </motion.button>
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
