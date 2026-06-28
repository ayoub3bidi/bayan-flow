import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('GoogleAuthCallback', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders completing sign-in message', () => {
    render(
      <MemoryRouter>
        <GoogleAuthCallback />
      </MemoryRouter>
    );
    expect(
      screen.getByText(text => text.includes('Completing sign-in'))
    ).toBeInTheDocument();
  });

  it('navigates to /app on mount', () => {
    render(
      <MemoryRouter>
        <GoogleAuthCallback />
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith('/app', { replace: true });
  });
});
