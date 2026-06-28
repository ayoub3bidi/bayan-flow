import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GoogleOneTap from './GoogleOneTap';
import { useAuth } from '../hooks/useAuth';
import { initOneTap } from '../lib/googleIdentity';
import * as authService from '../services/authService';

const mockNavigate = vi.fn();
let capturedOnCredential = null;

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/googleIdentity', () => ({
  initOneTap: vi.fn(options => {
    capturedOnCredential = options.onCredential;
    return Promise.resolve({ cancel: vi.fn() });
  }),
}));

vi.mock('../services/authService', () => ({
  signInWithGoogleIdToken: vi.fn(async () => undefined),
}));

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('GoogleOneTap', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    vi.mocked(initOneTap).mockReset();
    vi.mocked(authService.signInWithGoogleIdToken).mockReset();
    mockNavigate.mockReset();
    capturedOnCredential = null;
    vi.mocked(initOneTap).mockImplementation(options => {
      capturedOnCredential = options.onCredential;
      return Promise.resolve({ cancel: vi.fn() });
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

  it('does not initialize when auth is not configured', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: false,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleOneTap />
      </MemoryRouter>
    );

    expect(initOneTap).not.toHaveBeenCalled();
  });

  it('does not initialize when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: true,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleOneTap />
      </MemoryRouter>
    );

    expect(initOneTap).not.toHaveBeenCalled();
  });

  it('calls signInWithGoogleIdToken on credential and navigates from /', async () => {
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

    await act(async () => {
      await capturedOnCredential('google-credential');
    });

    expect(authService.signInWithGoogleIdToken).toHaveBeenCalledWith(
      'google-credential'
    );
    expect(mockNavigate).toHaveBeenCalledWith('/app', { replace: true });
  });

  it('does not navigate from /app on credential', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/app']}>
        <GoogleOneTap />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(initOneTap).toHaveBeenCalled();
    });

    await act(async () => {
      await capturedOnCredential('google-credential');
    });

    expect(authService.signInWithGoogleIdToken).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles credential error gracefully', async () => {
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

    vi.mocked(authService.signInWithGoogleIdToken).mockRejectedValueOnce(
      new Error('Auth failed')
    );

    await act(async () => {
      await capturedOnCredential('bad-credential');
    });

    expect(authService.signInWithGoogleIdToken).toHaveBeenCalledWith(
      'bad-credential'
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles initOneTap rejection gracefully', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isConfigured: true,
      isLoading: false,
      isAuthenticated: false,
    });

    const rejectError = new Error('GIS init failed');
    vi.mocked(initOneTap).mockRejectedValue(rejectError);

    render(
      <MemoryRouter initialEntries={['/']}>
        <GoogleOneTap />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(initOneTap).toHaveBeenCalled();
    });
  });
});
