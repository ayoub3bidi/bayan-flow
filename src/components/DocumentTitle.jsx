/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ROUTE_TITLE_KEYS = {
  '/privacy': 'legal.privacyTitle',
  '/terms': 'legal.termsTitle',
  '/roadmap': 'roadmap.hero.title',
  '/app': 'header.title',
};

export default function DocumentTitle() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    const routeKey = ROUTE_TITLE_KEYS[pathname];
    const baseTitle = t('header.title');

    let fullTitle;
    if (routeKey && pathname !== '/') {
      fullTitle = `${baseTitle} - ${t(routeKey)}`;
    } else if (pathname === '/') {
      fullTitle = `${baseTitle} - ${t('landing.hero.title')}`;
    } else {
      fullTitle = baseTitle;
    }

    document.title = fullTitle;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    const twitterTitle = document.querySelector(
      'meta[property="twitter:title"]'
    );
    if (twitterTitle) {
      twitterTitle.setAttribute('content', fullTitle);
    }

    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const twitterDescription = document.querySelector(
      'meta[property="twitter:description"]'
    );
    const metaDescription = document.querySelector('meta[name="description"]');

    const ogTwitterDescription =
      pathname === '/privacy'
        ? t('legal.privacyDescription')
        : pathname === '/terms'
          ? t('legal.termsDescription')
          : pathname === '/'
            ? t('landing.hero.subtitle')
            : t('footer.description');

    const metaDescriptionText =
      pathname === '/privacy'
        ? t('legal.privacyDescription')
        : pathname === '/terms'
          ? t('legal.termsDescription')
          : t('footer.description');

    if (ogDescription) {
      ogDescription.setAttribute('content', ogTwitterDescription);
    }

    if (twitterDescription) {
      twitterDescription.setAttribute('content', ogTwitterDescription);
    }

    if (metaDescription) {
      metaDescription.setAttribute('content', metaDescriptionText);
    }
  }, [i18n.language, t, pathname]);

  return null;
}
