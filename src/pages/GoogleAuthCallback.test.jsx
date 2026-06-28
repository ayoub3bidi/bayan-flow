import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GoogleAuthCallback from './GoogleAuthCallback';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/services/authService', () => ({
  getSession: vi.fn(),
}));

import { getSession } from '@/services/authService';

describe('GoogleAuthCallback', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(getSession).mockReset();
  });

  it('renders completing sign-in message', () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: 'test' },
      access_token: 'token',
    });
    render(
      <MemoryRouter>
        <GoogleAuthCallback />
      </MemoryRouter>
    );
    expect(
      screen.getByText(text => text.includes('Completing sign-in'))
    ).toBeInTheDocument();
  });

  it('navigates to /app on mount when session exists', async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: { id: 'test' },
      access_token: 'token',
    });
    render(
      <MemoryRouter>
        <GoogleAuthCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/app', { replace: true });
    });
  });

  it('navigates to / on mount when session is null', async () => {
    vi.mocked(getSession).mockResolvedValue(null);
    render(
      <MemoryRouter>
        <GoogleAuthCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('navigates to / on mount when getSession fails', async () => {
    vi.mocked(getSession).mockRejectedValue(new Error('Network error'));
    render(
      <MemoryRouter>
        <GoogleAuthCallback />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
