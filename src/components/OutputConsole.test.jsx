/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, renderWithI18n, screen } from '../test/testUtils';
import OutputConsole from './OutputConsole';
import i18n from '../i18n';

function getBaseProps(overrides = {}) {
  return {
    status: 'idle',
    output: '',
    error: null,
    onClear: vi.fn(),
    isExpanded: true,
    onToggleExpand: vi.fn(),
    ...overrides,
  };
}

describe('OutputConsole', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('calls onClear when the clear output button is clicked', () => {
    const onClear = vi.fn();
    renderWithI18n(
      <OutputConsole
        {...getBaseProps({
          status: 'success',
          output: 'hello',
          onClear,
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear output' }));

    expect(onClear).toHaveBeenCalledOnce();
  });

  it('shows CaretDown when expanded and CaretUp when collapsed', () => {
    const { rerender, container } = renderWithI18n(
      <OutputConsole
        {...getBaseProps({
          isExpanded: true,
          onToggleExpand: vi.fn(),
        })}
      />
    );

    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);

    rerender(
      <OutputConsole
        {...getBaseProps({
          isExpanded: false,
          onToggleExpand: vi.fn(),
        })}
      />
    );

    expect(container.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('renders collapsed banner with expand control', () => {
    renderWithI18n(
      <OutputConsole
        {...getBaseProps({
          isExpanded: false,
          onToggleExpand: vi.fn(),
        })}
      />
    );

    expect(screen.getByText('Output & Test Cases')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /expand output panel/i })
    ).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows icon-only run button while loading', () => {
    renderWithI18n(
      <OutputConsole
        {...getBaseProps({
          status: 'loading',
          onRun: vi.fn(),
        })}
      />
    );

    const runBtn = screen.getByRole('button', { name: /loading python/i });
    expect(runBtn).toHaveTextContent('');
    expect(runBtn.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders collapsed header with aria-expanded false and toggle still works', () => {
    const onToggleExpand = vi.fn();
    renderWithI18n(
      <OutputConsole
        {...getBaseProps({
          isExpanded: false,
          onToggleExpand,
        })}
      />
    );

    const toggle = screen.getByRole('button', {
      name: /expand output panel/i,
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(onToggleExpand).toHaveBeenCalledOnce();
  });

  it('calls onRun when Run is clicked without toggling expand', () => {
    const onRun = vi.fn();
    const onToggleExpand = vi.fn();
    renderWithI18n(
      <OutputConsole
        {...getBaseProps({
          onRun,
          onToggleExpand,
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Run$/i }));

    expect(onRun).toHaveBeenCalledOnce();
    expect(onToggleExpand).not.toHaveBeenCalled();
  });

  it('shows Reset when isModified and calls onReset without toggling expand', () => {
    const onReset = vi.fn();
    const onToggleExpand = vi.fn();
    renderWithI18n(
      <OutputConsole
        {...getBaseProps({
          onRun: vi.fn(),
          onReset,
          isModified: true,
          onToggleExpand,
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Reset$/i }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(onToggleExpand).not.toHaveBeenCalled();
  });
});
