/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Cookie } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useConsent } from '../hooks/useConsent.js';
import { Link, useLocation } from 'react-router-dom';
import {
  bannerInitial,
  bannerAnimate,
  bannerExit,
  bannerTransition,
  HOVER_SPRING,
} from '../motion/chromeMotion';

/**
 * Cookie consent banner. Mobile: full-width at the top (the visualizer controls
 * own the bottom of the screen). sm+: compact bottom-corner card. On /app it docks
 * to the start corner (playback controls sit bottom-center/end); elsewhere to the
 * end corner (landing CTAs sit on the start side). Click-through outside the card.
 * Renders only when consent has not yet been given.
 */
export default function CookieConsentBanner() {
  const { t } = useTranslation();
  const { bannerVisible, grantConsent, denyConsent } = useConsent();
  const reduceMotion = useReducedMotion();
  const dockClass =
    useLocation().pathname === '/app' ? 'sm:start-0' : 'sm:end-0';

  return (
    <AnimatePresence>
      {bannerVisible && (
        <motion.div
          role="dialog"
          aria-label={t('consent.bannerAriaLabel')}
          className={`pointer-events-none fixed top-0 inset-x-0 z-50 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:top-auto sm:bottom-0 sm:inset-x-auto sm:p-6 ${dockClass}`}
          initial={bannerInitial(reduceMotion)}
          animate={bannerAnimate()}
          exit={bannerExit(reduceMotion)}
          transition={bannerTransition(reduceMotion)}
        >
          <div className="pointer-events-auto max-w-4xl mx-auto sm:max-w-sm rounded-2xl border border-(--color-glass-border) bg-surface shadow-2xl p-5 sm:p-6">
            <div className="flex flex-col items-start gap-4">
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
              <div className="flex items-center gap-3 shrink-0 w-full">
                <motion.button
                  type="button"
                  onClick={denyConsent}
                  className="flex-1 px-4 py-2 text-sm font-medium text-text-secondary border border-(--color-glass-border) rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  whileHover={reduceMotion ? {} : { scale: 1.02 }}
                  whileTap={reduceMotion ? {} : { scale: 0.98 }}
                  transition={HOVER_SPRING}
                >
                  {t('consent.declineAll')}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={grantConsent}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors cursor-pointer"
                  whileHover={reduceMotion ? {} : { scale: 1.02 }}
                  whileTap={reduceMotion ? {} : { scale: 0.98 }}
                  transition={HOVER_SPRING}
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
