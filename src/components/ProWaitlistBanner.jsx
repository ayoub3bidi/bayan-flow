/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect, useState } from 'react';
import { Link, useInRouterContext, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import {
  WAITLIST_BANNER_DISMISSED_KEY,
  WAITLIST_SOURCES,
} from '@/constants/waitlist';
import { readStoredWaitlistEmail } from '@/services/waitlistService';
import { isRTL } from '@/utils/rtlManager';

/**
 * @param {'landing' | 'app'} source
 * @param {string} pathname
 */
function ProWaitlistBannerContent({ source, pathname }) {
  const { t, i18n } = useTranslation();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const isDismissed =
        sessionStorage.getItem(WAITLIST_BANNER_DISMISSED_KEY) === '1';
      const isEnrolled = !!readStoredWaitlistEmail();
      setDismissed(isDismissed || isEnrolled);
      if (isEnrolled && !isDismissed) {
        window.dispatchEvent(new CustomEvent('bayan-flow:banner-dismissed'));
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  if (pathname === '/pro' || dismissed) {
    return null;
  }

  const waitlistSource =
    source === WAITLIST_SOURCES.APP
      ? WAITLIST_SOURCES.APP
      : WAITLIST_SOURCES.LANDING;
  const CtaIcon = isRTL(i18n.language) ? ArrowLeft : ArrowRight;

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(WAITLIST_BANNER_DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
    setDismissed(true);
    window.dispatchEvent(new CustomEvent('bayan-flow:banner-dismissed'));
  };

  return (
    <div
      className="relative z-10 w-full border-b border-(--color-pro-banner-border) bg-(--color-pro-banner-bg)"
      role="region"
      aria-label={t('pro.banner.linkLabel')}
    >
      <div className="mx-auto flex max-w-[1200px] items-start gap-2 px-4 py-3 sm:items-center sm:gap-3 sm:px-6 lg:px-12">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2 pe-1 text-start xs:flex-row xs:items-center xs:gap-3 sm:justify-center">
          <p className="min-w-0 text-sm font-medium leading-snug text-(--color-pro-banner-text) sm:text-base">
            {t('pro.banner.message')}
          </p>
          <Link
            to={`/pro?source=${waitlistSource}`}
            className="inline-flex min-h-touch shrink-0 items-center justify-center gap-1.5 rounded-lg bg-(--color-pro-banner-cta-bg) px-3.5 text-sm font-semibold text-(--color-pro-banner-cta-text) shadow-sm transition-colors hover:bg-(--color-pro-banner-cta-hover) hover:text-(--color-pro-banner-cta-hover-text) focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          >
            {t('pro.banner.cta')}
            <CtaIcon size={15} weight="bold" aria-hidden />
          </Link>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="inline-flex min-h-touch min-w-touch shrink-0 items-center justify-center rounded-lg text-(--color-pro-banner-dismiss) transition-colors hover:bg-(--color-pro-banner-dismiss-hover-bg) hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label={t('pro.banner.dismiss')}
        >
          <X size={18} weight="bold" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function ProWaitlistBannerRouted({ source }) {
  const { pathname } = useLocation();
  return <ProWaitlistBannerContent source={source} pathname={pathname} />;
}

/**
 * @param {'landing' | 'app'} source
 */
function ProWaitlistBanner({ source }) {
  const inRouter = useInRouterContext();
  if (!inRouter) {
    return <ProWaitlistBannerContent source={source} pathname="" />;
  }
  return <ProWaitlistBannerRouted source={source} />;
}

export default ProWaitlistBanner;
