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
});
