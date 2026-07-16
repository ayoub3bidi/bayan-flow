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

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip label="Test tooltip">
        <button type="button">Hover</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Hover' }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByRole('button', { name: 'Hover' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('hides tooltip on blur after focus', () => {
    render(
      <Tooltip label="Blur test">
        <button type="button">Focus</button>
      </Tooltip>
    );

    fireEvent.focus(screen.getByRole('button', { name: 'Focus' }));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.blur(screen.getByRole('button', { name: 'Focus' }));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows without delay when delay is zero', () => {
    render(
      <Tooltip label="Instant" delay={0}>
        <button type="button">Instant</button>
      </Tooltip>
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Instant' }));
    expect(screen.getByRole('tooltip')).toHaveTextContent('Instant');
  });
});
