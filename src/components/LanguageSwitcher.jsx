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
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 my-2 sm:my-0 bg-interactive-bg backdrop-blur-md rounded-md border border-interactive-border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer touch-manipulation"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={t('settings.language')}
      >
        {/* Desktop: Show flag + chevron */}
        <span className="text-sm font-medium text-text-primary hidden sm:inline">
          {currentLanguage.flag}
        </span>
        <ChevronDown
          size={12}
          className={`hidden sm:block text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
        <span className="text-base sm:hidden">{currentLanguage.flag}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-panel-bg backdrop-blur-md rounded-lg border border-panel-border shadow-lg z-50"
          >
            <div className="p-1.5 sm:p-2">
              {languages.map(language => (
                <motion.button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-interactive-hover transition-colors duration-150"
                  whileHover={{ x: 2 }}
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
                    <Check size={14} className="text-accent-primary" />
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
