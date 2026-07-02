import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequireAuth from './RequireAuth';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('RequireAuth', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('redirects to / when not configured', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      isConfigured: false,
    });

    renderWithRouter(
      <RequireAuth>
        <div data-testid="children" />
      </RequireAuth>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('shows loading placeholder while isLoading is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      isConfigured: true,
    });

    const { container } = renderWithRouter(
      <RequireAuth>
        <div data-testid="children" />
      </RequireAuth>
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });

  it('redirects to / when unauthenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      isConfigured: true,
    });

    renderWithRouter(
      <RequireAuth>
        <div data-testid="children" />
      </RequireAuth>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('renders children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      isConfigured: true,
    });

    renderWithRouter(
      <RequireAuth>
        <div data-testid="children" />
      </RequireAuth>
    );

    expect(screen.getByTestId('children')).toBeInTheDocument();
  });
});
