/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a styled tooltip after hover delay', () => {
    render(
      <Tooltip label="Sign in with Google">
        <button type="button">G</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'G' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Sign in with Google'
    );
  });

  it('shows tooltip immediately on focus', () => {
    render(
      <Tooltip label="Sign in with Google">
        <button type="button">G</button>
      </Tooltip>
    );

    fireEvent.focus(screen.getByRole('button', { name: 'G' }));
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Sign in with Google'
    );
  });
});
