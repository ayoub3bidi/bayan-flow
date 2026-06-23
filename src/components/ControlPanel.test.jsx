/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { fireEvent, renderWithI18n, screen } from '../test/testUtils';
import ControlPanel from './ControlPanel';
import { ALGORITHM_TYPES } from '../constants';

function getBaseProps(overrides = {}) {
  return {
    isPlaying: false,
    isComplete: false,
    mode: 'manual',
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onReset: vi.fn(),
    onStepForward: vi.fn(),
    onStepBackward: vi.fn(),
    currentStep: 0,
    totalSteps: 5,
    onGenerateInput: vi.fn(),
    algorithmType: ALGORITHM_TYPES.SORTING,
    isFullScreen: false,
    onToggleFullScreen: vi.fn(),
    onExportVideo: vi.fn(),
    onCancelExport: vi.fn(),
    exportState: 'idle',
    isSoundEnabled: false,
    isSoundTogglePending: false,
    onToggleSound: vi.fn(),
    ...overrides,
  };
}

describe('ControlPanel', () => {
  const refreshLabel = () => 'Generate New Input';

  it('shows data refresh shuffle when category has hasDataRefresh true (sorting)', () => {
    renderWithI18n(<ControlPanel {...getBaseProps()} />);

    expect(
      screen.getByRole('button', { name: refreshLabel() })
    ).toBeInTheDocument();
  });

  it('shows data refresh shuffle when category has hasDataRefresh true (pathfinding)', () => {
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({ algorithmType: ALGORITHM_TYPES.PATHFINDING })}
      />
    );

    expect(
      screen.getByRole('button', { name: refreshLabel() })
    ).toBeInTheDocument();
  });

  it('disables shuffle when isPlaying', () => {
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({
          algorithmType: ALGORITHM_TYPES.PATHFINDING,
          isPlaying: true,
        })}
      />
    );

    expect(screen.getByRole('button', { name: refreshLabel() })).toBeDisabled();
  });

  it('renders the sound toggle with pressed-state semantics', () => {
    renderWithI18n(
      <ControlPanel {...getBaseProps({ isSoundEnabled: true })} />
    );

    const toggle = screen.getByRole('button', { name: 'Sound On' });

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(toggle).toHaveAttribute('title', 'Sound On');
  });

  it('forwards sound toggle clicks and respects pending state', () => {
    const onToggleSound = vi.fn();
    renderWithI18n(<ControlPanel {...getBaseProps({ onToggleSound })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Sound Off' }));
    expect(onToggleSound).toHaveBeenCalledTimes(1);
  });

  it('disables the sound toggle while the audio state is pending', () => {
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({
          isSoundTogglePending: true,
        })}
      />
    );

    expect(screen.getByRole('button', { name: 'Sound Off' })).toBeDisabled();
  });
});
