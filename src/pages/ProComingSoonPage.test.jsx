/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { renderWithI18n, screen, fireEvent, waitFor } from '../test/testUtils';
import ProComingSoonPage from './ProComingSoonPage';

vi.mock('@/hooks/useAuth.js', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    profile: null,
  })),
}));

vi.mock('@/components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/services/waitlistService.js', () => ({
  joinWaitlist: vi.fn(),
  readStoredWaitlistEmail: vi.fn(() => null),
  getWaitlistPublicCount: vi.fn(() => Promise.resolve(0)),
}));

import {
  joinWaitlist,
  getWaitlistPublicCount,
} from '@/services/waitlistService.js';

function renderPage(path = '/pro') {
  return renderWithI18n(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/pro" element={<ProComingSoonPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProComingSoonPage', () => {
  beforeEach(() => {
    vi.mocked(joinWaitlist).mockReset();
    vi.mocked(getWaitlistPublicCount).mockReset();
    vi.mocked(getWaitlistPublicCount).mockResolvedValue(0);
    Object.defineProperty(window, 'scrollTo', {
      value: vi.fn(),
      writable: true,
    });
  });

  it('renders headline and features', () => {
    renderPage('/pro');
    expect(
      screen.getByRole('heading', {
        name: /go further with the pro plan/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/what the pro plan unlocks/i)).toBeInTheDocument();
    expect(screen.getByText(/and more to come/i)).toBeInTheDocument();
    expect(document.querySelectorAll('.pro-sorting-tile')).toHaveLength(6);
  });

  it('submits email and shows success state', async () => {
    vi.mocked(joinWaitlist).mockResolvedValue({
      status: 'joined',
      position: 7,
    });

    renderPage('/pro?source=landing');

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /join the waitlist/i }));

    await waitFor(() => {
      expect(screen.getByText(/you are on the list/i)).toBeInTheDocument();
    });

    expect(joinWaitlist).toHaveBeenCalledWith('user@example.com', {
      userId: null,
      source: 'landing',
    });
  });

  it('shows already joined state', async () => {
    vi.mocked(joinWaitlist).mockResolvedValue({ status: 'already_joined' });

    renderPage('/pro');

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /join the waitlist/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/you are already on the waitlist/i)
      ).toBeInTheDocument();
    });
  });

  it('shows waitlist count when above threshold', async () => {
    vi.mocked(getWaitlistPublicCount).mockResolvedValue(127);

    renderPage('/pro');

    await waitFor(() => {
      expect(
        screen.getByText(/127 learners are on the waitlist/i)
      ).toBeInTheDocument();
    });
  });

  it('does not clobber email after user starts typing', async () => {
    const { useAuth } = await import('@/hooks/useAuth.js');
    useAuth.mockReturnValue({
      user: { id: 'u1', email: 'initial@example.com' },
      profile: null,
    });

    renderPage('/pro');

    const input = screen.getByLabelText(/email address/i);
    expect(input).toHaveValue('initial@example.com');

    fireEvent.change(input, { target: { value: 'typed@example.com' } });
    expect(input).toHaveValue('typed@example.com');

    await waitFor(() => {
      expect(input).toHaveValue('typed@example.com');
    });
  });

  it('hides waitlist count when below threshold', async () => {
    vi.mocked(getWaitlistPublicCount).mockResolvedValue(30);

    renderPage('/pro');

    await waitFor(() => {
      expect(getWaitlistPublicCount).toHaveBeenCalled();
    });

    expect(
      screen.queryByText(/learners are on the waitlist/i)
    ).not.toBeInTheDocument();
  });
});
