/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function Boom() {
  throw new Error('test crash');
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <span>content</span>
      </ErrorBoundary>
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders fallback when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<span>something went wrong</span>}>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('something went wrong')).toBeInTheDocument();
    spy.mockRestore();
  });

  it('renders nothing when a child throws and no fallback provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(container.innerHTML).toBe('');
    spy.mockRestore();
  });
});
