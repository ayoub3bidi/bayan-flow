/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function DocumentTitle() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const baseTitle = t('header.title');
    const subtitle = t('landing.hero.title');
    const fullTitle = `${baseTitle} - ${subtitle}`;

    // Update document title
    document.title = fullTitle;

    // Update Open Graph meta tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    // Update Twitter meta tags
    const twitterTitle = document.querySelector(
      'meta[property="twitter:title"]'
    );
    if (twitterTitle) {
      twitterTitle.setAttribute('content', fullTitle);
    }

    // Update meta description as well for better localization
    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    const twitterDescription = document.querySelector(
      'meta[property="twitter:description"]'
    );
    const metaDescription = document.querySelector('meta[name="description"]');

    if (ogDescription) {
      ogDescription.setAttribute('content', t('landing.hero.subtitle'));
    }

    if (twitterDescription) {
      twitterDescription.setAttribute('content', t('landing.hero.subtitle'));
    }

    if (metaDescription) {
      metaDescription.setAttribute('content', t('footer.description'));
    }
  }, [i18n.language, t]);

  return null;
}
