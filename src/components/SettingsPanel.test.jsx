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

  it('renders graph scenario options with random graph at the bottom', () => {
    renderWithI18n(<SettingsPanel {...getBaseProps()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Graph scenario' }));

    const labels = screen
      .getAllByRole('option')
      .map(option => option.textContent);

    expect(labels).toEqual([
      'Linear Chain (A→B→C→D)',
      'Diamond Pattern (merge point)',
      'Single Node (trivial case)',
      'Random graph',
    ]);
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

    const sliders = screen.getAllByRole('slider');

    expect(sliders).toHaveLength(2);
    expect(sliders[1]).toBeEnabled();
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

    const sliders = screen.getAllByRole('slider');

    expect(sliders[1]).toHaveAttribute('min', '3');
    expect(sliders[1]).toHaveAttribute('max', '6');
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});
