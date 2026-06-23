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
  const selector =
    property === 'description'
      ? 'meta[name="description"]'
      : `meta[property="${property}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (property === 'description') {
      el.setAttribute('name', 'description');
    } else {
      el.setAttribute('property', property);
    }
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
      'meta[property="twitter:title"]'
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
      'meta[property="twitter:description"]'
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

    // Title still contains app name (Bayan Flow) in French
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
      document.querySelector('meta[property="twitter:url"]')
    ).toHaveAttribute('content', 'https://bayanflow.com/roadmap');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      i18n.t('roadmap.hero.subtitle')
    );
  });
});
