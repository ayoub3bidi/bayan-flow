import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserMenu from './UserMenu';
import { useAuth } from '../hooks/useAuth';

const navigateMock = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('UserMenu', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    navigateMock.mockReset();
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

    const { container } = render(<UserMenu />);
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

    const { container } = render(<UserMenu />);
    const skeleton = container.querySelector('[aria-hidden="true"]');
    expect(skeleton).toBeInTheDocument();
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

    render(<UserMenu variant="landing" />);
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

    render(<UserMenu variant="compact" />);
    const button = screen.getByRole('button', { name: /sign in with google/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByText(/sign in with google/i)).not.toBeInTheDocument();
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

    render(<UserMenu variant="landing" />);
    fireEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/app', { replace: true });
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

    render(<UserMenu variant="landing" />);
    fireEvent.click(
      screen.getByRole('button', { name: /sign in with google/i })
    );

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalled();
    });
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

    render(<UserMenu />);
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
    });

    render(<UserMenu />);
    fireEvent.click(
      screen.getByRole('button', { name: /account menu for test user/i })
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /sign out/i })
    ).toBeInTheDocument();
  });
});
