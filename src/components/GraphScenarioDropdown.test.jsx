/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithI18n, screen } from '../test/testUtils';
import GraphScenarioDropdown from './GraphScenarioDropdown';

function getBaseProps(overrides = {}) {
  return {
    scenarioOptions: [
      { id: 'linearChain', i18nKey: 'graphScenarios.linearChain' },
      { id: 'diamond', i18nKey: 'graphScenarios.diamond' },
    ],
    selectedScenario: 'linearChain',
    onScenarioSelect: vi.fn(),
    isDropdownOpen: true,
    setIsDropdownOpen: vi.fn(),
    isPlaying: false,
    dropdownRef: createRef(),
    ...overrides,
  };
}

describe('GraphScenarioDropdown', () => {
  it('shows the selected scenario and random graph option', () => {
    renderWithI18n(<GraphScenarioDropdown {...getBaseProps()} />);

    expect(
      screen.getByRole('button', { name: 'Graph scenario' })
    ).toHaveTextContent('Linear Chain (A→B→C→D)');
    expect(
      screen.getByRole('option', { name: 'Random graph' })
    ).toBeInTheDocument();
  });

  it('calls onScenarioSelect and closes the dropdown when an option is chosen', () => {
    const onScenarioSelect = vi.fn();
    const setIsDropdownOpen = vi.fn();

    renderWithI18n(
      <GraphScenarioDropdown
        {...getBaseProps({ onScenarioSelect, setIsDropdownOpen })}
      />
    );

    fireEvent.click(
      screen.getByRole('option', { name: 'Diamond Pattern (merge point)' })
    );

    expect(onScenarioSelect).toHaveBeenCalledWith('diamond');
    expect(setIsDropdownOpen).toHaveBeenCalledWith(false);
  });
});
