/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, renderWithI18n, screen } from '../test/testUtils';
import ControlPanel from './ControlPanel';
import { ALGORITHM_TYPES } from '../constants';
import { BELOW_LG_MEDIA_QUERY } from '../hooks/useIsBelowLg';

function stubMatchMedia(isBelowLg) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(query => ({
      matches: query === BELOW_LG_MEDIA_QUERY ? isBelowLg : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }))
  );
}

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
    onSeek: vi.fn(),
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

  beforeEach(() => {
    stubMatchMedia(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('opens category_controls gate when anonymous user clicks sort order', () => {
    const onGatedFeatureClick = vi.fn();
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({
          isGated: true,
          onGatedFeatureClick,
        })}
      />
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Toggle initial array order for sorting',
      })
    );

    expect(onGatedFeatureClick).toHaveBeenCalledWith('category_controls');
  });

  it('shows a Settings button when onOpenSettings is provided on narrow viewports', () => {
    stubMatchMedia(true);
    const onOpenSettings = vi.fn();
    renderWithI18n(<ControlPanel {...getBaseProps({ onOpenSettings })} />);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('shows all feature buttons directly on narrow viewports', () => {
    stubMatchMedia(true);
    renderWithI18n(<ControlPanel {...getBaseProps()} />);

    expect(
      screen.getByRole('button', { name: refreshLabel() })
    ).toBeInTheDocument();
  });

  it('shows visualizations remaining above the progress bar when provided', () => {
    renderWithI18n(
      <ControlPanel {...getBaseProps({ visualizationsRemaining: 7 })} />
    );

    expect(screen.getByText(/7 visualizations remaining/i)).toBeInTheDocument();
  });

  it('renders a seekable timeline with the correct range for Free users', () => {
    const onSeek = vi.fn();
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({
          currentStep: 2,
          totalSteps: 5,
          onSeek,
        })}
      />
    );

    const slider = screen.getByRole('slider', { name: 'Scrub through steps' });
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '4');
    expect(slider).toHaveValue('2');

    expect(
      screen.getByText('Drag the timeline to skip steps')
    ).toBeInTheDocument();
    expect(screen.getByTestId('seek-thumb')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '3' } });
    expect(onSeek).toHaveBeenCalledWith(3);
  });

  it('disables the timeline and hides the seek affordances when there are no steps', () => {
    renderWithI18n(<ControlPanel {...getBaseProps({ totalSteps: 0 })} />);

    const slider = screen.getByRole('slider', { name: 'Scrub through steps' });
    expect(slider).toBeDisabled();
    expect(
      screen.queryByText('Drag the timeline to skip steps')
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId('seek-thumb')).not.toBeInTheDocument();
  });

  it('shows a locked timeline for anonymous users that gates to sign-in on click', () => {
    const onGatedFeatureClick = vi.fn();
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({
          isGated: true,
          currentStep: 2,
          totalSteps: 5,
          onGatedFeatureClick,
        })}
      />
    );

    expect(
      screen.queryByRole('slider', { name: 'Scrub through steps' })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/step 3 of 5/i)).toBeInTheDocument();
    expect(screen.getByText('Sign in to skip steps')).toBeInTheDocument();
    expect(screen.getByTestId('seek-thumb')).toBeInTheDocument();
    expect(
      screen.queryByText('Drag the timeline to skip steps')
    ).not.toBeInTheDocument();

    const timeline = screen.getByRole('button', {
      name: 'Sign in to skip steps',
    });
    fireEvent.click(timeline);
    expect(onGatedFeatureClick).toHaveBeenCalledWith('timeline_scrub');

    fireEvent.keyDown(timeline, { key: 'Enter' });
    expect(onGatedFeatureClick).toHaveBeenCalledTimes(2);
  });

  it('hides the locked timeline affordances when a gated user has no steps', () => {
    renderWithI18n(
      <ControlPanel {...getBaseProps({ isGated: true, totalSteps: 0 })} />
    );

    expect(screen.queryByTestId('seek-thumb')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign in to skip steps')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sign in to skip steps' })
    ).not.toBeInTheDocument();
  });
});
