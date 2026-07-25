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

  it('renders built-in fallback when a child throws and no fallback provided', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Try again' })
    ).toBeInTheDocument();
    spy.mockRestore();
  });

  it('recovers when resetKey changes', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary resetKey={1}>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKey={2}>
        <span>recovered content</span>
      </ErrorBoundary>
    );
    expect(screen.getByText('recovered content')).toBeInTheDocument();
    spy.mockRestore();
  });
});
