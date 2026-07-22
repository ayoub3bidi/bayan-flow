/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { renderWithI18n, screen, fireEvent } from '../test/testUtils';
import ProWaitlistBanner from './ProWaitlistBanner';
import {
  WAITLIST_BANNER_DISMISSED_KEY,
  WAITLIST_EMAIL_STORAGE_KEY,
} from '@/constants/waitlist';

function renderBanner(source = 'landing', initialPath = '/') {
  return renderWithI18n(
    <MemoryRouter initialEntries={[initialPath]}>
      <ProWaitlistBanner source={source} />
    </MemoryRouter>
  );
}

describe('ProWaitlistBanner', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('renders banner with link to /pro and landing source', () => {
    renderBanner('landing');
    const link = screen.getByRole('link', {
      name: /join waitlist/i,
    });
    expect(link).toHaveAttribute('href', '/pro?source=landing');
    expect(
      screen.getByText(/the pro plan is coming soon/i)
    ).toBeInTheDocument();
  });

  it('uses app source when mounted on visualizer', () => {
    renderBanner('app', '/app');
    const link = screen.getByRole('link', {
      name: /join waitlist/i,
    });
    expect(link).toHaveAttribute('href', '/pro?source=app');
  });

  it('hides on /pro route', () => {
    renderBanner('landing', '/pro');
    expect(
      screen.queryByRole('link', { name: /join waitlist/i })
    ).not.toBeInTheDocument();
  });

  it('dismisses for the session', () => {
    renderBanner('landing');
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(localStorage.getItem(WAITLIST_BANNER_DISMISSED_KEY)).toBe('1');
    expect(
      screen.queryByRole('link', { name: /join waitlist/i })
    ).not.toBeInTheDocument();
  });

  it('stays hidden when session flag is set', () => {
    localStorage.setItem(WAITLIST_BANNER_DISMISSED_KEY, '1');
    renderBanner('landing');
    expect(
      screen.queryByRole('link', { name: /join waitlist/i })
    ).not.toBeInTheDocument();
  });

  it('migrates dismissed flag from sessionStorage to localStorage', () => {
    sessionStorage.setItem(WAITLIST_BANNER_DISMISSED_KEY, '1');
    renderBanner('landing');
    expect(localStorage.getItem(WAITLIST_BANNER_DISMISSED_KEY)).toBe('1');
    expect(
      screen.queryByRole('link', { name: /join waitlist/i })
    ).not.toBeInTheDocument();
  });

  it('hides when user is already enrolled (email in localStorage)', () => {
    localStorage.setItem(WAITLIST_EMAIL_STORAGE_KEY, 'user@example.com');
    renderBanner('landing');
    expect(
      screen.queryByRole('link', { name: /join waitlist/i })
    ).not.toBeInTheDocument();
  });

  it('renders anchor tag when outside Router context', () => {
    const { container } = renderWithI18n(
      <ProWaitlistBanner source="landing" />
    );
    const anchor = container.querySelector('a[href="/pro?source=landing"]');
    expect(anchor).toBeInTheDocument();
    expect(anchor.tagName).toBe('A');
  });

  it('dispatches banner-dismissed event when hidden due to enrollment', () => {
    const spy = vi.fn();
    window.addEventListener('bayan-flow:banner-dismissed', spy);
    localStorage.setItem(WAITLIST_EMAIL_STORAGE_KEY, 'user@example.com');
    renderBanner('landing');
    expect(spy).toHaveBeenCalledTimes(1);
    window.removeEventListener('bayan-flow:banner-dismissed', spy);
  });
});
