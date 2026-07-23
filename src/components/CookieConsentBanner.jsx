/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useConsent } from '../hooks/useConsent.js';
import { Link } from 'react-router-dom';

/**
 * Fixed bottom cookie consent banner.
 * Renders only when consent has not yet been given.
 */
export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const { bannerVisible, grantConsent, denyConsent } = useConsent();

  return (
    <AnimatePresence>
      {bannerVisible && (
        <motion.div
          role="dialog"
          aria-label={t('consent.bannerAriaLabel')}
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        >
          <div className="max-w-4xl mx-auto rounded-2xl border border-(--color-glass-border) bg-(--color-glass-bg) backdrop-blur-xl shadow-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Cookie
                  size={24}
                  weight="fill"
                  className="shrink-0 text-amber-500 mt-0.5"
                />
                <p className="text-sm text-text-primary leading-relaxed">
                  {t('consent.message')}{' '}
                  <Link
                    to="/privacy"
                    className="underline text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                  >
                    {t('consent.privacyPolicy')}
                  </Link>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <motion.button
                  type="button"
                  onClick={denyConsent}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-text-secondary border border-(--color-glass-border) rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('consent.declineAll')}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={grantConsent}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {t('consent.acceptAll')}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
