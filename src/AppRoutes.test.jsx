/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

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

vi.mock('@/pages/Roadmap', () => ({
  default: () => <div data-testid="roadmap">Roadmap</div>,
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

  it('does not show BannedScreen when no access block', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/app');

    expect(screen.queryByTestId('banned-screen')).not.toBeInTheDocument();
    expect(screen.getByTestId('visualizer-app')).toBeInTheDocument();
  });

  it('renders LandingPage on /', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/');

    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  it('renders ProComingSoonPage on /pro', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/pro');

    expect(screen.getByTestId('pro-page')).toBeInTheDocument();
  });

  it('renders PrivacyPolicy on /privacy', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/privacy');

    expect(screen.getByTestId('privacy')).toBeInTheDocument();
  });

  it('renders TermsOfUse on /terms', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/terms');

    expect(screen.getByTestId('terms')).toBeInTheDocument();
  });

  it('wraps /settings/profile in RequireAuth', () => {
    vi.mocked(useAuth).mockReturnValue({
      accessBlock: null,
      isLoading: false,
    });

    renderRoutes('/settings/profile');

    expect(screen.getByTestId('require-auth')).toBeInTheDocument();
    expect(screen.getByTestId('profile-settings')).toBeInTheDocument();
  });
});
