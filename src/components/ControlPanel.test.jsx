/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderWithI18n, screen } from '../test/testUtils';
import ControlPanel from './ControlPanel';
import { ALGORITHM_TYPES } from '../constants';
import i18n from '../i18n';

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
}));

vi.mock('../utils/soundManager', () => ({
  soundManager: {
    playUIClick: vi.fn(),
    playArrayGenerate: vi.fn(),
  },
}));

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
    onGenerateArray: vi.fn(),
    algorithmType: ALGORITHM_TYPES.SORTING,
    isFullScreen: false,
    onToggleFullScreen: vi.fn(),
    onExportVideo: vi.fn(),
    onCancelExport: vi.fn(),
    exportState: 'idle',
    ...overrides,
  };
}

describe('ControlPanel', () => {
  const shuffleLabel = () => i18n.t('controls.generateArray');

  it('does not show data refresh shuffle when category has hasDataRefresh false', () => {
    renderWithI18n(<ControlPanel {...getBaseProps()} />);

    expect(screen.queryByRole('button', { name: shuffleLabel() })).toBeNull();
  });

  it('shows data refresh shuffle when category has hasDataRefresh true', () => {
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({ algorithmType: ALGORITHM_TYPES.PATHFINDING })}
      />
    );

    expect(
      screen.getByRole('button', { name: shuffleLabel() })
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

    expect(screen.getByRole('button', { name: shuffleLabel() })).toBeDisabled();
  });
});
