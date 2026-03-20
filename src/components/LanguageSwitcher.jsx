/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * @param {Object} props
 * @param {string[]} [props.excludeLanguages] - Array of language codes to exclude from the dropdown
 */
function LanguageSwitcher({ excludeLanguages = [] }) {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const allLanguages = [
    { code: 'en', name: t('languages.en'), flag: '🇬🇧' },
    { code: 'fr', name: t('languages.fr'), flag: '🇫🇷' },
    { code: 'ar', name: t('languages.ar'), flag: '🇸🇦' },
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={t('settings.language')}
        data-language-switcher
      >
        {/* Desktop: Show flag + chevron */}
        <span className="text-sm font-medium text-text-primary hidden sm:inline">
          {currentLanguage.flag}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden sm:block shrink-0"
        >
          <ChevronDown
            size={12}
            className={`${
              isOpen ? 'text-accent-primary' : 'text-text-secondary'
            }`}
          />
        </motion.div>
        <span className="text-sm sm:hidden">{currentLanguage.flag}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-surface-elevated border-2 border-[var(--color-border-strong)] rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-1.5 sm:p-2">
              {languages.map((language, index) => (
                <motion.button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-interactive-hover transition-colors duration-150 text-left"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-base sm:text-lg">
                      {language.flag}
                    </span>
                    <span className="text-text-primary font-medium">
                      {language.name}
                    </span>
                  </div>
                  {i18n.language === language.code && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 25,
                      }}
                    >
                      <Check size={14} className="text-accent-primary" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LanguageSwitcher;
