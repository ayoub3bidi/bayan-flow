/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithI18n, screen } from '../test/testUtils';
import SettingsPanel from './SettingsPanel';
import { ALGORITHM_TYPES, VISUALIZATION_MODES } from '../constants';

vi.mock('../config/algorithmConfig', () => ({
  useAlgorithmConfig: () => ({
    byType: {
      sorting: { algorithms: [], groups: [] },
      pathfinding: { algorithms: [], groups: [] },
      searching: { algorithms: [], groups: [] },
      treeTraversal: { algorithms: [], groups: [] },
      graphAlgorithm: {
        algorithms: [
          { value: 'topologicalSort', label: 'Topological Sort (DFS)' },
        ],
        groups: [
          {
            label: 'Topological ordering',
            algorithms: ['topologicalSort'],
          },
        ],
      },
    },
  }),
}));

vi.mock('../config/settingsConfig', () => ({
  useSettingsConfig: () => ({
    speedOptions: [
      { label: 'Slow', value: 8000 },
      { label: 'Medium', value: 4800 },
      { label: 'Fast', value: 2400 },
    ],
  }),
}));

vi.mock('./AlgorithmDropdown', () => ({
  default: ({ selectedAlgorithm }) => (
    <div data-testid="algorithm-dropdown">{selectedAlgorithm}</div>
  ),
}));

function getBaseProps(overrides = {}) {
  return {
    algorithmType: ALGORITHM_TYPES.GRAPH_ALGORITHM,
    onAlgorithmTypeChange: vi.fn(),
    selectedAlgorithm: 'topologicalSort',
    onAlgorithmChange: vi.fn(),
    speed: 4800,
    onSpeedChange: vi.fn(),
    arraySize: 20,
    onArraySizeChange: vi.fn(),
    gridSize: 15,
    onGridSizeChange: vi.fn(),
    searchGraphNodeCount: 12,
    onSearchGraphNodeCountChange: vi.fn(),
    treeNodeCount: 15,
    onTreeNodeCountChange: vi.fn(),
    graphNodeCount: 10,
    onGraphNodeCountChange: vi.fn(),
    selectedGraphScenario: 'linearChain',
    onGraphScenarioChange: vi.fn(),
    graphScenarioOptions: [
      { id: 'linearChain', i18nKey: 'graphScenarios.linearChain' },
      { id: 'diamond', i18nKey: 'graphScenarios.diamond' },
      { id: 'singleNode', i18nKey: 'graphScenarios.singleNode' },
    ],
    isPlaying: false,
    mode: VISUALIZATION_MODES.MANUAL,
    onModeChange: vi.fn(),
    user: { id: 'test-user' }, // Signed-in user by default for tests
    onLockedAlgorithmClick: vi.fn(),
    ...overrides,
  };
}

describe('SettingsPanel', () => {
  it('does not render the sound section anymore', () => {
    renderWithI18n(<SettingsPanel {...getBaseProps()} />);

    expect(screen.queryByText('Sound')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sound On' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sound Off' })
    ).not.toBeInTheDocument();
  });

  it('shows the graph scenario selector in the settings panel for graph algorithms', () => {
    renderWithI18n(<SettingsPanel {...getBaseProps()} />);

    expect(
      screen.getByRole('button', { name: 'Graph scenario' })
    ).toBeInTheDocument();
  });

  it('renders graph scenario options with random graph first', () => {
    renderWithI18n(<SettingsPanel {...getBaseProps()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Graph scenario' }));

    const labels = screen
      .getAllByRole('option')
      .map(option => option.textContent);

    expect(labels).toEqual([
      'Random graph',
      'Linear Chain (A→B→C→D)',
      'Diamond Pattern (merge point)',
      'Single Node (trivial case)',
    ]);
  });

  it('renders upcoming categories as disabled teasers, last one full width', () => {
    const onAlgorithmTypeChange = vi.fn();
    renderWithI18n(
      <SettingsPanel {...getBaseProps({ onAlgorithmTypeChange })} />
    );

    const dp = screen.getByRole('button', {
      name: 'Dynamic Programming — coming soon',
    });
    const strings = screen.getByRole('button', {
      name: 'String Algorithms — coming soon',
    });
    expect(dp).toBeDisabled();
    expect(strings).toBeDisabled();
    expect(screen.getAllByText('Soon')).toHaveLength(2);

    fireEvent.click(dp);
    expect(onAlgorithmTypeChange).not.toHaveBeenCalled();

    // 7 tiles on a 3-per-row grid: the 7th stretches across the last row.
    expect(strings).toHaveClass('col-span-6');
    expect(dp).toHaveClass('col-span-2');
  });

  it('labels mode buttons and sliders for assistive tech', () => {
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({
          mode: VISUALIZATION_MODES.AUTOPLAY,
          selectedGraphScenario: null,
        })}
      />
    );

    expect(screen.getByRole('button', { name: 'Autoplay' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Manual' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByLabelText(/^Speed/)).toHaveAttribute('type', 'range');
    expect(screen.getByLabelText(/^Graph vertices/)).toHaveAttribute(
      'type',
      'range'
    );
  });

  it('forwards graph scenario changes', () => {
    const onGraphScenarioChange = vi.fn();
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({ onGraphScenarioChange, selectedGraphScenario: '' })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Graph scenario' }));
    fireEvent.click(
      screen.getByRole('option', { name: 'Diamond Pattern (merge point)' })
    );

    expect(onGraphScenarioChange).toHaveBeenCalledWith('diamond');
  });

  it('replaces the graph size slider with guidance while a preset scenario is selected', () => {
    renderWithI18n(<SettingsPanel {...getBaseProps()} />);

    expect(
      screen.queryByRole('slider', { name: /graph vertices/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        'Preset scenarios use a fixed node count. Select Random graph to change it.'
      )
    ).toBeInTheDocument();
  });

  it('shows the graph size slider when random graph generation is selected', () => {
    renderWithI18n(
      <SettingsPanel {...getBaseProps({ selectedGraphScenario: null })} />
    );

    expect(screen.getAllByRole('slider')).toHaveLength(1);
    expect(
      screen.getByRole('slider', { name: /graph vertices/i })
    ).toBeEnabled();
  });

  it('uses the Floyd-Warshall node cap for the graph size slider', () => {
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({
          selectedAlgorithm: 'floydWarshallAlgorithm',
          selectedGraphScenario: null,
          graphNodeCount: 6,
        })}
      />
    );

    const slider = screen.getByRole('slider', { name: /graph vertices/i });

    expect(slider).toHaveAttribute('min', '3');
    expect(slider).toHaveAttribute('max', '6');
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('lets anonymous users switch to manual mode during the trial', () => {
    const onModeChange = vi.fn();
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({
          user: null,
          mode: VISUALIZATION_MODES.AUTOPLAY,
          onModeChange,
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /manual/i }));

    expect(onModeChange).toHaveBeenCalledWith(VISUALIZATION_MODES.MANUAL);
  });

  it('lets anonymous users change speed during the trial', () => {
    const onSpeedChange = vi.fn();
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({
          user: null,
          mode: VISUALIZATION_MODES.AUTOPLAY,
          onSpeedChange,
        })}
      />
    );

    fireEvent.change(screen.getAllByRole('slider')[0], {
      target: { value: '0' },
    });

    expect(onSpeedChange).toHaveBeenCalledTimes(1);
  });

  it('lets anonymous users pick any graph scenario during the trial', () => {
    const onGraphScenarioChange = vi.fn();
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({
          user: null,
          selectedGraphScenario: '',
          onGraphScenarioChange,
        })}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Graph scenario' }));
    fireEvent.click(
      screen.getByRole('option', { name: 'Diamond Pattern (merge point)' })
    );

    expect(onGraphScenarioChange).toHaveBeenCalledWith('diamond');
  });

  it('shows the use-case line for the selected algorithm', () => {
    renderWithI18n(
      <SettingsPanel {...getBaseProps({ selectedAlgorithm: 'dijkstra' })} />
    );

    expect(screen.getByText('Use cases:')).toBeInTheDocument();
    expect(screen.getByText(/GPS routing/)).toBeInTheDocument();
  });

  it('hides the use-case line when no use-case string exists', () => {
    renderWithI18n(
      <SettingsPanel {...getBaseProps({ selectedAlgorithm: 'unknownKey' })} />
    );

    expect(screen.queryByText('Use cases:')).not.toBeInTheDocument();
  });

  it('hides the speed control in manual mode and shows it in autoplay', () => {
    const { rerender } = renderWithI18n(<SettingsPanel {...getBaseProps()} />);
    expect(screen.queryByLabelText(/^Speed/)).not.toBeInTheDocument();

    rerender(
      <SettingsPanel
        {...getBaseProps({ mode: VISUALIZATION_MODES.AUTOPLAY })}
      />
    );
    expect(screen.getByLabelText(/^Speed/)).toBeInTheDocument();
  });

  it('swaps the use-case line for "Why it matters" while a tip is active', () => {
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({
          selectedAlgorithm: 'dijkstra',
          algorithmTip: 'dijkstra',
        })}
      />
    );

    const tip = screen.getByText(/every navigation app/);
    const useCase = screen.getByText(/GPS routing/);
    expect(tip).toHaveAttribute('aria-hidden', 'false');
    expect(useCase).toHaveAttribute('aria-hidden', 'true');
    expect(tip).toHaveClass('opacity-100');
    expect(useCase).toHaveClass('opacity-0');
  });

  it('ignores a tip meant for a different algorithm', () => {
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({
          selectedAlgorithm: 'dijkstra',
          algorithmTip: 'quickSort',
        })}
      />
    );

    expect(screen.getByText(/GPS routing/)).toHaveAttribute(
      'aria-hidden',
      'false'
    );
  });

  it('hides control mode and speed when playback settings live in the control bar', () => {
    renderWithI18n(
      <SettingsPanel
        {...getBaseProps({
          mode: VISUALIZATION_MODES.AUTOPLAY,
          showPlaybackSettings: false,
        })}
      />
    );

    expect(screen.queryByText('Control Mode')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Autoplay' })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Speed/)).not.toBeInTheDocument();
  });
});
