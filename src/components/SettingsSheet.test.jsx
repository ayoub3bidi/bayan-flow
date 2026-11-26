/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithI18n } from '../test/testUtils';
import SettingsSheet from './SettingsSheet';

vi.mock('./SettingsPanel', () => ({
  default: () => <div data-testid="settings-panel">Settings panel</div>,
}));

describe('SettingsSheet', () => {
  it('renders nothing when closed', () => {
    const { container } = renderWithI18n(
      <SettingsSheet isOpen={false} onClose={vi.fn()} settingsPanelProps={{}} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('opens the sheet and closes via backdrop and close button', () => {
    const onClose = vi.fn();
    const { rerender } = renderWithI18n(
      <SettingsSheet isOpen onClose={onClose} settingsPanelProps={{}} />
    );

    expect(
      screen.getByRole('dialog', { name: 'Algorithm settings' })
    ).toBeTruthy();
    expect(screen.getByTestId('settings-panel')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(
      <SettingsSheet isOpen onClose={onClose} settingsPanelProps={{}} />
    );
    fireEvent.click(document.querySelector('[aria-hidden="true"]'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens as a start-edge drawer with placement="side"', () => {
    renderWithI18n(
      <SettingsSheet
        isOpen
        onClose={vi.fn()}
        settingsPanelProps={{}}
        placement="side"
      />
    );

    const dialog = screen.getByRole('dialog', { name: 'Algorithm settings' });
    expect(dialog.className).toContain('start-0');
    expect(dialog.className).not.toContain('inset-0');
  });
});
