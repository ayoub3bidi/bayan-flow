/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CaretDown, Check } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import {
  menuInitial,
  menuAnimate,
  menuExit,
  menuTransition,
  getChromeTransition,
  CHROME_DURATION_FAST,
} from '@/motion/chromeMotion';

/**
 * @param {Object} props
 * @param {string[]} [props.excludeLanguages] - Array of language codes to exclude from the dropdown
 */
function LanguageSwitcher({ excludeLanguages = [] }) {
  const { i18n, t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const allLanguages = [
    { code: 'en', name: t('languages.en') },
    { code: 'fr', name: t('languages.fr') },
    { code: 'ar', name: t('languages.ar') },
  ];

  // Filter out excluded languages
  const languages = allLanguages.filter(
    lang => !excludeLanguages.includes(lang.code)
  );

  const currentLanguage =
    languages.find(lang => lang.code === i18n.language) || languages[0];

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = languageCode => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 py-0 bg-interactive-bg backdrop-blur-md rounded-md border border-interactive-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer touch-manipulation"
        aria-label={t('settings.language')}
        data-language-switcher
      >
        <span className="text-xs sm:text-sm font-semibold uppercase text-text-primary">
          {currentLanguage.code}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={getChromeTransition(reduceMotion, CHROME_DURATION_FAST)}
          className="hidden sm:block shrink-0"
        >
          <CaretDown
            size={12}
            weight="bold"
            className={`${
              isOpen ? 'text-accent-primary' : 'text-text-secondary'
            }`}
          />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={menuInitial(reduceMotion)}
            animate={menuAnimate()}
            exit={menuExit(reduceMotion)}
            transition={menuTransition(reduceMotion)}
            className="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-1.5 sm:p-2">
              {languages.map(language => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => handleLanguageChange(language.code)}
                  className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-interactive-hover transition-colors duration-150 text-left"
                >
                  <span className="text-text-primary font-medium">
                    {language.name}
                  </span>
                  {i18n.language === language.code && (
                    <Check
                      size={14}
                      weight="bold"
                      className="text-accent-primary"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSwitcher;
