/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    accessBlock: null,
    isLoading: false,
  })),
}));

vi.mock('@/components/BannedScreen', () => ({
  default: () => <div data-testid="banned-screen">Banned</div>,
}));

vi.mock('@/pages/LandingPage', () => ({
  default: () => <div data-testid="landing-page">Landing</div>,
}));

vi.mock('@/pages/VisualizerApp', () => ({
  default: () => <div data-testid="visualizer-app">Visualizer</div>,
}));

const roadmapCrash = vi.hoisted(() => ({ enabled: false }));

vi.mock('@/pages/Roadmap', () => ({
  default: () => {
    if (roadmapCrash.enabled) throw new Error('roadmap exploded');
    return <div data-testid="roadmap">Roadmap</div>;
  },
}));

vi.mock('@/pages/ProComingSoonPage', () => ({
  default: () => <div data-testid="pro-page">Pro</div>,
}));

vi.mock('@/pages/GoogleAuthCallback', () => ({
  default: () => <div data-testid="auth-callback">Callback</div>,
}));

vi.mock('@/pages/PrivacyPolicy', () => ({
  default: () => <div data-testid="privacy">Privacy</div>,
}));

vi.mock('@/pages/TermsOfUse', () => ({
  default: () => <div data-testid="terms">Terms</div>,
}));

vi.mock('@/pages/ProfileSettingsPage', () => ({
  default: () => <div data-testid="profile-settings">Profile</div>,
}));

vi.mock('./services/authService.js', async importOriginal => ({
  ...(await importOriginal()),
  hasStoredSession: vi.fn(() => false),
}));

vi.mock('@/components/RequireAuth', () => ({
  default: ({ children }) => <div data-testid="require-auth">{children}</div>,
}));

import AppRoutes from './AppRoutes';
import { useAuth } from '@/hooks/useAuth';

function renderRoutes(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('AppRoutes', () => {
  it('shows BannedScreen when user is banned and not loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: 'account_banned',
      isLoading: false,
    });

    renderRoutes('/app');

    expect(screen.getByTestId('banned-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('visualizer-app')).not.toBeInTheDocument();
  });

  it('does not show BannedScreen when loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: 'account_banned',
      isLoading: true,
    });

    renderRoutes('/app');

    expect(screen.queryByTestId('banned-screen')).not.toBeInTheDocument();
  });

  it('does not show BannedScreen when no access block', async () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/app');

    expect(screen.queryByTestId('banned-screen')).not.toBeInTheDocument();
    await screen.findByTestId('visualizer-app');
  });

  it('renders LandingPage on /', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/');

    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('renders ProComingSoonPage on /pro', async () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/pro');

    await screen.findByTestId('pro-page');
  });

  it('renders PrivacyPolicy on /privacy', async () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/privacy');

    await screen.findByTestId('privacy');
  });

  it('renders TermsOfUse on /terms', async () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/terms');

    await screen.findByTestId('terms');
  });

  it('shows a recovery screen instead of a blank page when a route crashes', async () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });
    roadmapCrash.enabled = true;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      renderRoutes('/roadmap');

      expect(
        await screen.findByRole('heading', { name: 'Something went wrong' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reload page' })).toBeVisible();

      fireEvent.click(screen.getByRole('link', { name: 'Back to Home' }));
      expect(await screen.findByTestId('landing-page')).toBeInTheDocument();
    } finally {
      roadmapCrash.enabled = false;
      errorSpy.mockRestore();
    }
  });

  it('wraps /settings/profile in RequireAuth', async () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/settings/profile');

    await screen.findByTestId('require-auth');
    expect(screen.getByTestId('profile-settings')).toBeInTheDocument();
  });
});

describe('AppRoutes returning signed-in visitor on /', () => {
  // AppRoutes decides once per page load, so each case loads a fresh module.
  async function loadRoutes({ stored, auth }) {
    vi.resetModules();
    const authService = await import('./services/authService.js');
    vi.mocked(authService.hasStoredSession).mockReturnValue(stored);
    const { useAuth: freshUseAuth } = await import('@/hooks/useAuth');
    vi.mocked(freshUseAuth).mockReturnValue({ accessBlock: null, ...auth });
    return { Routes: (await import('./AppRoutes')).default, freshUseAuth };
  }

  function renderAt(AppRoutesComponent, path) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <AppRoutesComponent />
      </MemoryRouter>
    );
  }

  it('sends a returning signed-in visitor to /app', async () => {
    const { Routes } = await loadRoutes({
      stored: true,
      auth: { isLoading: false, isAuthenticated: true },
    });
    renderAt(Routes, '/');
    await screen.findByTestId('visualizer-app');
    expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
  });

  it('shows a loading state instead of the landing page while auth hydrates', async () => {
    const { Routes } = await loadRoutes({
      stored: true,
      auth: { isLoading: true, isAuthenticated: false },
    });
    renderAt(Routes, '/');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
  });

  it('shows the landing page when the stored session is no longer valid', async () => {
    const { Routes } = await loadRoutes({
      stored: true,
      auth: { isLoading: false, isAuthenticated: false },
    });
    renderAt(Routes, '/');
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('shows the landing page immediately without a stored session', async () => {
    const { Routes } = await loadRoutes({
      stored: false,
      auth: { isLoading: true, isAuthenticated: false },
    });
    renderAt(Routes, '/');
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('respects links to a landing section', async () => {
    const { Routes } = await loadRoutes({
      stored: true,
      auth: { isLoading: false, isAuthenticated: true },
    });
    renderAt(Routes, '/#features');
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('decides only once per page load, so coming back to / never redirects', async () => {
    const { Routes, freshUseAuth } = await loadRoutes({
      stored: true,
      auth: { isLoading: false, isAuthenticated: false },
    });
    const first = renderAt(Routes, '/');
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
    first.unmount();

    vi.mocked(freshUseAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
      isAuthenticated: true,
    });
    renderAt(Routes, '/');
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });
});
