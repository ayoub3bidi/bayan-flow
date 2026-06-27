/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthProvider.jsx';
import { useAuth } from '../hooks/useAuth.js';
import {
  mockSupabaseConfigured,
  resetSupabaseMocks,
  supabaseAuthMock,
  supabaseFromMock,
} from '../test/supabaseMock.js';

function AuthProbe() {
  const { isLoading, isAuthenticated, profile } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="display-name">{profile?.displayName ?? ''}</span>
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
  });
});
