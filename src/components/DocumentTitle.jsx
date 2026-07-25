/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCanonicalUrl, buildMetaDescription } from '../constants/siteSeo';

const ROUTE_TITLE_KEYS = {
  '/privacy': 'legal.privacyTitle',
  '/terms': 'legal.termsTitle',
  '/roadmap': 'roadmap.hero.title',
  '/pro': 'pro.pageTitle',
  '/app': 'app.pageTitle',
  '/settings/profile': 'profile.pageTitle',
};

const HREFLANG_LOCALES = ['en', 'fr', 'ar'];

const OG_LOCALE_MAP = {
  en: 'en_US',
  fr: 'fr_FR',
  ar: 'ar_SA',
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

  if (pathname === '/pro') {
    return {
      meta: t('pro.metaDescription'),
      social: t('pro.metaDescription'),
    };
  }

  if (pathname === '/') {
    return {
      meta: buildMetaDescription(),
      social: t('landing.hero.subtitle'),
    };
  }

  return {
    meta: buildMetaDescription(),
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

function ensureAlternateLinks(pathname) {
  for (const locale of HREFLANG_LOCALES) {
    const selector = `link[rel="alternate"][hreflang="${locale}"]`;
    let link = document.querySelector(selector);
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', locale);
      document.head.appendChild(link);
    }
    const langParam = locale === 'en' ? '' : `?lang=${locale}`;
    link.setAttribute('href', `https://bayanflow.com${pathname}${langParam}`);
  }

  let xDefault = document.querySelector(
    'link[rel="alternate"][hreflang="x-default"]'
  );
  if (!xDefault) {
    xDefault = document.createElement('link');
    xDefault.setAttribute('rel', 'alternate');
    xDefault.setAttribute('hreflang', 'x-default');
    document.head.appendChild(xDefault);
  }
  xDefault.setAttribute('href', `https://bayanflow.com${pathname}`);
}

function updateOGLocale(lang) {
  const ogLocale = OG_LOCALE_MAP[lang] || 'en_US';
  let meta = document.querySelector('meta[property="og:locale"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', 'og:locale');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', ogLocale);

  const currentAlternate = document.querySelector(
    `meta[property="og:locale:alternate"][data-lang="${lang}"]`
  );
  if (currentAlternate) {
    currentAlternate.remove();
  }

  for (const locale of HREFLANG_LOCALES) {
    if (locale === lang) continue;
    const altKey = `og:locale:alternate`;
    const selector = `meta[property="${altKey}"][data-lang="${locale}"]`;
    let altMeta = document.querySelector(selector);
    if (!altMeta) {
      altMeta = document.createElement('meta');
      altMeta.setAttribute('property', altKey);
      altMeta.setAttribute('data-lang', locale);
      document.head.appendChild(altMeta);
    }
    altMeta.setAttribute('content', OG_LOCALE_MAP[locale] || locale);
  }
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

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', fullTitle);
    }

    ensureCanonicalLink().setAttribute('href', canonicalUrl);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }

    const twitterUrl = document.querySelector('meta[name="twitter:url"]');
    if (twitterUrl) {
      twitterUrl.setAttribute('content', canonicalUrl);
    }

    const { meta: metaDescriptionText, social: ogTwitterDescription } =
      getRouteDescriptions(pathname, t);

    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const twitterDescription = document.querySelector(
      'meta[name="twitter:description"]'
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

    ensureAlternateLinks(pathname);
    updateOGLocale(i18n.language);
  }, [i18n.language, t, pathname]);

  return null;
}
