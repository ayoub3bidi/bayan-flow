import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthProvider.jsx';
import { useAuth } from '../hooks/useAuth.js';
import {
  mockSupabaseConfigured,
  resetSupabaseMocks,
  supabaseAuthMock,
  supabaseFromMock,
  authStateChangeCallbackRef,
} from '../test/supabaseMock.js';

vi.mock('../lib/googleIdentity', () => ({
  requestGoogleSignInPopup: vi.fn(async () => ({ idToken: 'test-token' })),
  disableGoogleAutoSelect: vi.fn(),
  isGoogleAuthConfigured: vi.fn(() => true),
}));

function AuthProbe() {
  const { isLoading, isAuthenticated, profile, signOut, signInWithGoogle } =
    useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="display-name">{profile?.displayName ?? ''}</span>
      <span data-testid="avatar-source">{profile?.avatarSource ?? ''}</span>
      <span data-testid="plan">{profile?.plan ?? ''}</span>
      <button data-testid="sign-out" onClick={signOut}>
        Sign Out
      </button>
      <button data-testid="sign-in" onClick={signInWithGoogle}>
        Sign In
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    mockSupabaseConfigured(true);
  });

  it('hydrates unauthenticated state', async () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('loads profile when session exists', async () => {
    supabaseAuthMock.getSession.mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            user_metadata: {
              full_name: 'Test User',
              picture: 'https://lh3.googleusercontent.com/a/test',
            },
          },
        },
      },
      error: null,
    });

    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({
        data: {
          display_name: 'Test User',
          avatar_url: null,
          plan: 'free',
          email: 'user@example.com',
        },
        error: null,
      })),
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('display-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('avatar-source')).toHaveTextContent('google');
    expect(screen.getByTestId('plan')).toHaveTextContent('free');
  });

  it('handles session hydration error gracefully', async () => {
    supabaseAuthMock.getSession.mockRejectedValueOnce(
      new Error('Network error')
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('handles profile fetch error gracefully', async () => {
    supabaseAuthMock.getSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-1', email: 'user@example.com' },
        },
      },
      error: null,
    });

    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({
        data: null,
        error: new Error('DB error'),
      })),
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('display-name')).toHaveTextContent('user');
  });

  it('sets pro plan from profile', async () => {
    supabaseAuthMock.getSession.mockResolvedValueOnce({
      data: {
        session: {
          user: { id: 'user-1', email: 'pro@example.com' },
        },
      },
      error: null,
    });

    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({
        data: {
          display_name: 'Pro User',
          avatar_url: null,
          plan: 'pro',
          email: 'pro@example.com',
        },
        error: null,
      })),
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('plan')).toHaveTextContent('pro');
    });
  });

  it('clears profile on sign out', async () => {
    supabaseAuthMock.getSession.mockResolvedValueOnce({
      data: {
        session: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
            user_metadata: { full_name: 'Test User' },
          },
        },
      },
      error: null,
    });

    supabaseFromMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({
        data: {
          display_name: 'Test User',
          avatar_url: null,
          plan: 'free',
          email: 'user@example.com',
        },
        error: null,
      })),
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByTestId('sign-out').click();
    });

    expect(supabaseAuthMock.signOut).toHaveBeenCalled();
  });

  it('reacts to auth state changes', async () => {
    supabaseAuthMock.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    act(() => {
      authStateChangeCallbackRef.current?.('SIGNED_IN', {
        user: {
          id: 'user-2',
          email: 'new@example.com',
          user_metadata: { full_name: 'New User' },
        },
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('display-name')).toHaveTextContent('New User');
  });
});
