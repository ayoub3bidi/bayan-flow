/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GoogleOneTap from './GoogleOneTap';
import { useAuth } from '../hooks/useAuth';
import { initOneTap } from '../lib/googleIdentity';
import * as authService from '../services/authService';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/googleIdentity', () => ({
  initOneTap: vi.fn(),
}));

vi.mock('../services/authService', () => ({
  signInWithGoogleIdToken: vi.fn(async () => undefined),
}));

describe('GoogleOneTap', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    vi.mocked(initOneTap).mockReset();
    vi.mocked(authService.signInWithGoogleIdToken).mockReset();
    vi.mocked(initOneTap).mockResolvedValue({
      cancel: vi.fn(),
    });
  });

  it('does not initialize One Tap when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleOneTap />
      </MemoryRouter>
    );

    expect(initOneTap).not.toHaveBeenCalled();
  });

  it('initializes One Tap on landing when signed out', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleOneTap />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(initOneTap).toHaveBeenCalled();
    });
  });

  it('does not initialize One Tap on roadmap', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/roadmap']}>
        <GoogleOneTap />
      </MemoryRouter>
    );

    expect(initOneTap).not.toHaveBeenCalled();
  });
});
