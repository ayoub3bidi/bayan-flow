/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, renderWithI18n, screen, within } from '../test/testUtils';
import ControlPanel from './ControlPanel';
import { ALGORITHM_TYPES, ANIMATION_SPEEDS } from '../constants';
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

  it('disables full screen while the Blocks tab is docked', () => {
    const onToggleFullScreen = vi.fn();
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({ isFullScreenDisabled: true, onToggleFullScreen })}
      />
    );

    const button = screen.getByRole('button', { name: /full screen/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute(
      'title',
      'Full screen is unavailable while the Blocks tab is open'
    );
    fireEvent.click(button);
    expect(onToggleFullScreen).not.toHaveBeenCalled();
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

  it('lets anonymous users toggle sort order during the trial', () => {
    const onSortOrderChange = vi.fn();
    renderWithI18n(
      <ControlPanel {...getBaseProps({ isGated: true, onSortOrderChange })} />
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Toggle initial array order for sorting',
      })
    );

    expect(onSortOrderChange).toHaveBeenCalledTimes(1);
  });

  describe('array view toggle', () => {
    const viewLabel = 'Switch between bar and box view';

    it('is hidden unless the category opts in', () => {
      renderWithI18n(
        <ControlPanel {...getBaseProps({ onArrayViewChange: vi.fn() })} />
      );
      expect(
        screen.queryByRole('button', { name: viewLabel })
      ).not.toBeInTheDocument();
    });

    it('switches bars to boxes and back', () => {
      const onArrayViewChange = vi.fn();
      const { rerender } = renderWithI18n(
        <ControlPanel
          {...getBaseProps({
            showArrayViewToggle: true,
            arrayView: 'bars',
            onArrayViewChange,
          })}
        />
      );

      const button = screen.getByRole('button', { name: viewLabel });
      expect(button).toHaveAttribute('aria-pressed', 'true');
      fireEvent.click(button);
      expect(onArrayViewChange).toHaveBeenLastCalledWith('boxes');

      rerender(
        <ControlPanel
          {...getBaseProps({
            showArrayViewToggle: true,
            arrayView: 'boxes',
            onArrayViewChange,
          })}
        />
      );
      fireEvent.click(screen.getByRole('button', { name: viewLabel }));
      expect(onArrayViewChange).toHaveBeenLastCalledWith('bars');
    });

    it('stays available to anonymous users and during playback', () => {
      const onArrayViewChange = vi.fn();
      renderWithI18n(
        <ControlPanel
          {...getBaseProps({
            isGated: true,
            isPlaying: true,
            showArrayViewToggle: true,
            onArrayViewChange,
          })}
        />
      );

      const button = screen.getByRole('button', { name: viewLabel });
      expect(button).toBeEnabled();
      fireEvent.click(button);
      expect(onArrayViewChange).toHaveBeenCalledTimes(1);
    });
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

  it('lets anonymous users scrub the timeline during the trial', () => {
    const onSeek = vi.fn();
    renderWithI18n(
      <ControlPanel
        {...getBaseProps({
          isGated: true,
          currentStep: 2,
          totalSteps: 5,
          onSeek,
        })}
      />
    );

    fireEvent.change(
      screen.getByRole('slider', { name: 'Scrub through steps' }),
      { target: { value: '4' } }
    );

    expect(onSeek).toHaveBeenCalledWith(4);
    expect(
      screen.getByText('Drag the timeline to skip steps')
    ).toBeInTheDocument();
  });

  describe('playback row', () => {
    const playbackProps = overrides =>
      getBaseProps({
        onModeChange: vi.fn(),
        speed: ANIMATION_SPEEDS.MEDIUM,
        onSpeedChange: vi.fn(),
        ...overrides,
      });

    it('shows Manual and every speed in one row, Manual pressed by default', () => {
      renderWithI18n(<ControlPanel {...playbackProps()} />);

      const group = screen.getByRole('group', { name: 'Control Mode' });
      expect(
        within(group)
          .getAllByRole('button')
          .map(b => b.textContent)
      ).toEqual(['Manual', '0.5×', '1×', '2×', '4×', '8×']);
      expect(screen.getByRole('button', { name: 'Manual' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(
        screen.getByRole('button', { name: 'Autoplay 1×' })
      ).toHaveAttribute('aria-pressed', 'false');
    });

    it('picking a speed switches to autoplay at that speed', () => {
      const props = playbackProps();
      renderWithI18n(<ControlPanel {...props} />);

      fireEvent.click(screen.getByRole('button', { name: 'Autoplay 2×' }));

      expect(props.onSpeedChange).toHaveBeenCalledWith(ANIMATION_SPEEDS.FAST);
      expect(props.onModeChange).toHaveBeenCalledWith('autoplay');
    });

    it('does not report a speed change when re-picking the current speed', () => {
      const props = playbackProps();
      renderWithI18n(<ControlPanel {...props} />);

      fireEvent.click(screen.getByRole('button', { name: 'Autoplay 1×' }));

      expect(props.onSpeedChange).not.toHaveBeenCalled();
      expect(props.onModeChange).toHaveBeenCalledWith('autoplay');
    });

    it('marks the active speed in autoplay and switches back to manual', () => {
      const props = playbackProps({
        mode: 'autoplay',
        speed: ANIMATION_SPEEDS.VERY_FAST,
      });
      renderWithI18n(<ControlPanel {...props} />);

      expect(
        screen.getByRole('button', { name: 'Autoplay 4×' })
      ).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(screen.getByRole('button', { name: 'Manual' }));
      expect(props.onModeChange).toHaveBeenCalledWith('manual');
    });

    it('locks the row while playing', () => {
      renderWithI18n(
        <ControlPanel
          {...playbackProps({ mode: 'autoplay', isPlaying: true })}
        />
      );

      within(screen.getByRole('group', { name: 'Control Mode' }))
        .getAllByRole('button')
        .forEach(button => expect(button).toBeDisabled());
    });

    it('leaves playback settings to the settings sheet below lg', () => {
      stubMatchMedia(true);
      renderWithI18n(<ControlPanel {...playbackProps()} />);

      expect(
        screen.queryByRole('group', { name: 'Control Mode' })
      ).not.toBeInTheDocument();
    });
  });
});
