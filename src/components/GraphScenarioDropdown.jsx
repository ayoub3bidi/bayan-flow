/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Check, CaretDown, Lock } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

function GraphScenarioDropdown({
  scenarioOptions,
  selectedScenario,
  onScenarioSelect,
  isDropdownOpen,
  setIsDropdownOpen,
  isPlaying,
  dropdownRef,
  areOptionsGated = false,
  onLockedScenarioClick,
}) {
  const { t } = useTranslation();
  const selectedOption =
    scenarioOptions.find(option => option.id === selectedScenario) ?? null;

  const renderedOptions = [
    ...scenarioOptions,
    { id: '', i18nKey: 'controls.randomGraph' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !isPlaying && setIsDropdownOpen(!isDropdownOpen)}
        disabled={isPlaying}
        aria-haspopup="listbox"
        aria-expanded={isDropdownOpen}
        aria-label={t('controls.graphScenario')}
        className="w-full px-4 py-3 min-h-[44px] bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg text-left flex items-center justify-between transition-all duration-200 hover:border-[#3b82f6] dark:hover:border-[#60a5fa] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] dark:focus:ring-[#60a5fa] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border-strong)] touch-manipulation leading-consistent"
      >
        <div className="flex flex-col">
          <span className="text-text-primary font-medium">
            {selectedOption
              ? t(selectedOption.i18nKey)
              : t('controls.randomGraph')}
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
            role="listbox"
            aria-label={t('controls.graphScenario')}
          >
            {renderedOptions.map((option, index) => {
              const isSelected = (selectedScenario ?? '') === option.id;
              const isLocked = areOptionsGated && index > 0;

              return (
                <motion.button
                  key={option.id || 'random-graph'}
                  type="button"
                  onClick={() => {
                    if (isLocked) {
                      onLockedScenarioClick?.(option);
                      return;
                    }
                    onScenarioSelect(option.id || null);
                    setIsDropdownOpen(false);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-150 hover:bg-surface-elevated ${
                    isSelected
                      ? 'bg-theme-primary-light'
                      : isLocked
                        ? 'text-text-primary opacity-60'
                        : 'text-text-primary'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span
                    className={`font-medium min-w-0 flex-1 ${isSelected ? 'algo-dropdown-selected-label' : ''}`}
                  >
                    {t(option.i18nKey)}
                  </span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GraphScenarioDropdown;
