/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import DocumentTitle from './DocumentTitle';
import i18n from '../i18n';

const wrapper = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
  </I18nextProvider>
);

const renderDocumentTitle = (options = {}) =>
  render(<DocumentTitle />, { wrapper, ...options });

function ensureMetaTag(property, content = '') {
  if (property === 'description') {
    let el = document.querySelector('meta[name="description"]');
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'description');
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
    return el;
  }

  const isTwitter = property.startsWith('twitter:');
  const attr = isTwitter ? 'name' : 'property';
  const selector = `meta[${attr}="${property}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return el;
}

function ensureCanonicalLink(href = 'https://bayanflow.com/') {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  return el;
}

describe('DocumentTitle', () => {
  beforeEach(() => {
    document.title = '';
    ensureMetaTag('og:title', '');
    ensureMetaTag('twitter:title', '');
    ensureMetaTag('og:description', '');
    ensureMetaTag('twitter:description', '');
    ensureMetaTag('description', '');
    ensureMetaTag('og:url', '');
    ensureMetaTag('twitter:url', '');
    ensureCanonicalLink();
    i18n.changeLanguage('en');
  });

  it('should return null (render nothing)', () => {
    const { container } = renderDocumentTitle();
    expect(container.firstChild).toBeNull();
  });

  it('should update document.title on mount', () => {
    renderDocumentTitle();

    const baseTitle = i18n.t('header.title');
    const subtitle = i18n.t('landing.hero.title');
    const expectedTitle = `${baseTitle} - ${subtitle}`;

    expect(document.title).toBe(expectedTitle);
  });

  it('should update og:title meta tag', () => {
    renderDocumentTitle();

    const baseTitle = i18n.t('header.title');
    const subtitle = i18n.t('landing.hero.title');
    const expectedTitle = `${baseTitle} - ${subtitle}`;

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle).toBeTruthy();
    expect(ogTitle.getAttribute('content')).toBe(expectedTitle);
  });

  it('should update twitter:title meta tag', () => {
    renderDocumentTitle();

    const baseTitle = i18n.t('header.title');
    const subtitle = i18n.t('landing.hero.title');
    const expectedTitle = `${baseTitle} - ${subtitle}`;

    const twitterTitle = document.querySelector(
      'meta[name="twitter:title"]'
    );
    expect(twitterTitle).toBeTruthy();
    expect(twitterTitle.getAttribute('content')).toBe(expectedTitle);
  });

  it('should update og:description meta tag', () => {
    renderDocumentTitle();

    const expectedDescription = i18n.t('landing.hero.subtitle');

    const ogDescription = document.querySelector(
      'meta[property="og:description"]'
    );
    expect(ogDescription).toBeTruthy();
    expect(ogDescription.getAttribute('content')).toBe(expectedDescription);
  });

  it('should update twitter:description meta tag', () => {
    renderDocumentTitle();

    const expectedDescription = i18n.t('landing.hero.subtitle');

    const twitterDescription = document.querySelector(
      'meta[name="twitter:description"]'
    );
    expect(twitterDescription).toBeTruthy();
    expect(twitterDescription.getAttribute('content')).toBe(
      expectedDescription
    );
  });

  it('should update meta description', () => {
    renderDocumentTitle();

    const expectedDescription = i18n.t('footer.description');

    const metaDescription = document.querySelector('meta[name="description"]');
    expect(metaDescription).toBeTruthy();
    expect(metaDescription.getAttribute('content')).toBe(expectedDescription);
  });

  it('should update titles when language changes', async () => {
    const { rerender } = renderDocumentTitle();

    expect(document.title).toContain('Bayan Flow');

    await act(async () => {
      await i18n.changeLanguage('fr');
    });
    act(() => {
      rerender(<DocumentTitle />);
    });

    expect(document.title).toBeTruthy();
    expect(document.title.length).toBeGreaterThan(0);
  });

  it('should set privacy route title and descriptions', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/privacy']}>
          <DocumentTitle />
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(document.title).toContain(i18n.t('legal.privacyTitle'));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      i18n.t('legal.privacyDescription')
    );
    expect(
      document.querySelector('meta[property="og:description"]')
    ).toHaveAttribute('content', i18n.t('legal.privacyDescription'));
  });

  it('should set terms route title and descriptions', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/terms']}>
          <DocumentTitle />
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(document.title).toContain(i18n.t('legal.termsTitle'));
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      i18n.t('legal.termsDescription')
    );
  });

  it('should set app route title', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/app']}>
          <DocumentTitle />
        </MemoryRouter>
      </I18nextProvider>
    );

    const baseTitle = i18n.t('header.title');
    const appTitle = i18n.t('app.pageTitle');
    expect(document.title).toBe(`${baseTitle} - ${appTitle}`);
  });

  it('should set canonical and og:url for the active route', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/roadmap']}>
          <DocumentTitle />
        </MemoryRouter>
      </I18nextProvider>
    );

    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://bayanflow.com/roadmap'
    );
    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://bayanflow.com/roadmap'
    );
    expect(
      document.querySelector('meta[name="twitter:url"]')
    ).toHaveAttribute('content', 'https://bayanflow.com/roadmap');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      i18n.t('roadmap.hero.subtitle')
    );
  });

  it('should set pro route title and meta description', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/pro']}>
          <DocumentTitle />
        </MemoryRouter>
      </I18nextProvider>
    );

    const baseTitle = i18n.t('header.title');
    const proTitle = i18n.t('pro.pageTitle');
    expect(document.title).toBe(`${baseTitle} - ${proTitle}`);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      i18n.t('pro.metaDescription')
    );
  });

  it('should create hreflang alternate links for all locales', () => {
    renderDocumentTitle();

    const en = document.querySelector('link[rel="alternate"][hreflang="en"]');
    const fr = document.querySelector('link[rel="alternate"][hreflang="fr"]');
    const ar = document.querySelector('link[rel="alternate"][hreflang="ar"]');
    const xDefault = document.querySelector(
      'link[rel="alternate"][hreflang="x-default"]'
    );

    expect(en).toBeTruthy();
    expect(en.getAttribute('href')).toBe('https://bayanflow.com/');

    expect(fr).toBeTruthy();
    expect(fr.getAttribute('href')).toBe('https://bayanflow.com/?lang=fr');

    expect(ar).toBeTruthy();
    expect(ar.getAttribute('href')).toBe('https://bayanflow.com/?lang=ar');

    expect(xDefault).toBeTruthy();
    expect(xDefault.getAttribute('href')).toBe('https://bayanflow.com/');
  });

  it('should set og:locale and og:locale:alternate for current language', () => {
    renderDocumentTitle();

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    expect(ogLocale).toBeTruthy();
    expect(ogLocale.getAttribute('content')).toBe('en_US');

    const altFr = document.querySelector(
      'meta[property="og:locale:alternate"][data-lang="fr"]'
    );
    const altAr = document.querySelector(
      'meta[property="og:locale:alternate"][data-lang="ar"]'
    );
    expect(altFr).toBeTruthy();
    expect(altFr.getAttribute('content')).toBe('fr_FR');
    expect(altAr).toBeTruthy();
    expect(altAr.getAttribute('content')).toBe('ar_AR');
  });

  it('should update og:locale when language changes to Arabic', async () => {
    const { rerender } = renderDocumentTitle();

    await act(async () => {
      await i18n.changeLanguage('ar');
    });
    act(() => {
      rerender(<DocumentTitle />);
    });

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    expect(ogLocale.getAttribute('content')).toBe('ar_AR');
  });

  it('should update hreflang links when route changes', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <MemoryRouter initialEntries={['/roadmap']}>
          <DocumentTitle />
        </MemoryRouter>
      </I18nextProvider>
    );

    const en = document.querySelector('link[rel="alternate"][hreflang="en"]');
    expect(en.getAttribute('href')).toBe(
      'https://bayanflow.com/roadmap'
    );

    const fr = document.querySelector('link[rel="alternate"][hreflang="fr"]');
    expect(fr.getAttribute('href')).toBe(
      'https://bayanflow.com/roadmap?lang=fr'
    );
  });
});
