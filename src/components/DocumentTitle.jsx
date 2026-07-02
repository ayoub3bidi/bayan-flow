/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCanonicalUrl } from '../constants/siteSeo';

const ROUTE_TITLE_KEYS = {
  '/privacy': 'legal.privacyTitle',
  '/terms': 'legal.termsTitle',
  '/roadmap': 'roadmap.hero.title',
  '/app': 'app.pageTitle',
  '/settings/profile': 'profile.pageTitle',
};

function getRouteDescriptions(pathname, t) {
  if (pathname === '/privacy') {
    return {
      meta: t('legal.privacyDescription'),
      social: t('legal.privacyDescription'),
    };
  }

  if (pathname === '/terms') {
    return {
      meta: t('legal.termsDescription'),
      social: t('legal.termsDescription'),
    };
  }

  if (pathname === '/roadmap') {
    return {
      meta: t('roadmap.hero.subtitle'),
      social: t('roadmap.hero.subtitle'),
    };
  }

  if (pathname === '/') {
    return {
      meta: t('footer.description'),
      social: t('landing.hero.subtitle'),
    };
  }

  return {
    meta: t('footer.description'),
    social: t('footer.description'),
  };
}

function ensureCanonicalLink() {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }

  return canonical;
}

export default function DocumentTitle() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    const routeKey = ROUTE_TITLE_KEYS[pathname];
    const baseTitle = t('header.title');
    const canonicalUrl = getCanonicalUrl(pathname);

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

    ensureCanonicalLink().setAttribute('href', canonicalUrl);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }

    const twitterUrl = document.querySelector('meta[property="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', canonicalUrl);
    }

    const { meta: metaDescriptionText, social: ogTwitterDescription } =
      getRouteDescriptions(pathname, t);

    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const twitterDescription = document.querySelector(
      'meta[property="twitter:description"]'
    );
    const metaDescription = document.querySelector('meta[name="description"]');

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
