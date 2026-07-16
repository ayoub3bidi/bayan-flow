/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BannedScreen from './BannedScreen.jsx';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    profile: {
      displayName: 'Blocked User',
      email: 'blocked@example.com',
    },
    signOut: vi.fn(),
  }),
}));

vi.mock('./UserMenu', () => ({
  default: () => <div data-testid="user-menu" />,
}));

describe('BannedScreen', () => {
  it('renders suspension messaging', () => {
    render(<BannedScreen />);

    expect(screen.getByText('Account suspended')).toBeInTheDocument();
    expect(screen.getByText(/contact@bayanflow.com/i)).toBeInTheDocument();
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });
});
