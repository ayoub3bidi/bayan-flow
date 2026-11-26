import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import UserMenu from './UserMenu';
import { useAuth } from '../hooks/useAuth';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// A real router, not a mocked useNavigate: the module mock intermittently
// missed under the single-fork coverage run, failing every test in the file.
let lastNavigation;
function NavigationProbe() {
  lastNavigation = `${useNavigationType()} ${useLocation().pathname}`;
  return null;
}
const renderMenu = ui =>
  render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter>
        {children}
        <NavigationProbe />
      </MemoryRouter>
    ),
  });

describe('UserMenu', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it('renders nothing when Supabase is not configured', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: false,
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    const { container } = renderMenu(<UserMenu />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows loading skeleton when loading and not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: true,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    const { container } = renderMenu(<UserMenu />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('does not show loading skeleton when hideAvatar is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: true,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    const { container } = renderMenu(<UserMenu hideAvatar />);
    expect(
      container.querySelector('[aria-hidden="true"]')
    ).not.toBeInTheDocument();
  });

  it('shows Google sign-in button when signed out', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    renderMenu(<UserMenu variant="landing" />);
    expect(
      screen.getByRole('button', { name: /sign in with google/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/sign in with google/i)).toBeInTheDocument();
  });

  it('shows icon-only sign-in button in compact variant', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    renderMenu(<UserMenu variant="compact" />);
    const button = screen.getByRole('button', { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByText(/sign in with google/i)).not.toBeInTheDocument();
  });

  it('shows a loading state while signing in', async () => {
    let resolveSignIn;
    const signInWithGoogle = vi.fn(
      () =>
        new Promise(resolve => {
          resolveSignIn = resolve;
        })
    );
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle,
      signOut: vi.fn(),
    });

    renderMenu(<UserMenu variant="landing" />);
    fireEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );

    const button = screen.getByRole('button', { name: /signing in/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();

    resolveSignIn();
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
    });
  });

  it('shows a loading state in compact variant while signing in', async () => {
    let resolveSignIn;
    const signInWithGoogle = vi.fn(
      () =>
        new Promise(resolve => {
          resolveSignIn = resolve;
        })
    );
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle,
      signOut: vi.fn(),
    });

    renderMenu(<UserMenu variant="compact" />);
    fireEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );

    const button = screen.getByRole('button', { name: /signing in/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button.querySelector('.animate-spin')).toBeInTheDocument();

    resolveSignIn();
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
    });
  });

  it('navigates to /app after landing sign-in succeeds', async () => {
    const signInWithGoogle = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle,
      signOut: vi.fn(),
    });

    renderMenu(<UserMenu variant="landing" />);
    fireEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
      expect(lastNavigation).toBe('REPLACE /app');
    });
  });

  it('handles sign-in error gracefully', async () => {
    const signInWithGoogle = vi
      .fn()
      .mockRejectedValue(new Error('Sign in failed'));
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle,
      signOut: vi.fn(),
    });

    renderMenu(<UserMenu variant="landing" />);
    fireEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
    });
    expect(lastNavigation).toBe('POP /');
    const dialog = await screen.findByRole('dialog', {
      name: /sign-in unavailable/i,
    });
    expect(
      within(dialog).getByText(/sign-in is temporarily unavailable/i)
    ).toBeInTheDocument();
  });

  it('shows unavailable message for Auth hook payload failures', async () => {
    const signInWithGoogle = vi.fn().mockRejectedValue({
      message: 'Invalid payload sent to hook',
      code: 'unexpected_failure',
    });
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
      profile: null,
      signInWithGoogle,
      signOut: vi.fn(),
    });

    renderMenu(<UserMenu variant="landing" />);
    fireEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );

    expect(
      await screen.findByRole('dialog', { name: /sign-in unavailable/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sign-in is temporarily unavailable/i)
    ).toBeInTheDocument();
    expect(lastNavigation).toBe('POP /');
  });

  it('handles sign-out error gracefully', async () => {
    const signOut = vi.fn().mockRejectedValue(new Error('Sign out failed'));
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: true,
      profile: {
        displayName: 'Test User',
        email: 'user@example.com',
        avatarSrc: 'data:image/svg+xml;charset=utf-8,test',
        avatarSource: 'generated',
        plan: 'free',
      },
      signInWithGoogle: vi.fn(),
      signOut,
    });

    renderMenu(<UserMenu />);
    fireEvent.click(
      screen.getByRole('button', { name: /account menu for test user/i })
    );
    fireEvent.click(screen.getByRole('menuitem', { name: /sign out/i }));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
    });
  });

  it('opens account menu when signed in', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: true,
      profile: {
        displayName: 'Test User',
        email: 'user@example.com',
        avatarSrc: 'data:image/svg+xml;charset=utf-8,test',
        avatarSource: 'generated',
        plan: 'free',
      },
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    });

    renderMenu(<UserMenu />);
    fireEvent.click(
      screen.getByRole('button', { name: /account menu for test user/i })
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /settings/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /sign out/i })
    ).toBeInTheDocument();
  });

  it('navigates to profile settings from account menu', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: true,
      profile: {
        displayName: 'Test User',
        email: 'user@example.com',
        avatarSrc: 'data:image/svg+xml;charset=utf-8,test',
        avatarSource: 'generated',
        plan: 'free',
      },
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      refreshProfile: vi.fn(),
    });

    renderMenu(<UserMenu />);
    fireEvent.click(
      screen.getByRole('button', { name: /account menu for test user/i })
    );
    fireEvent.click(screen.getByRole('menuitem', { name: /settings/i }));

    expect(lastNavigation).toBe('PUSH /settings/profile');
  });
});
