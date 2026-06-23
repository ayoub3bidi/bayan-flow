/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { useSettingsConfig } from './settingsConfig';

const wrapper = ({ children }) => (
  <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
);

describe('useSettingsConfig', () => {
  it('should return gridSizeOptions with 3 entries', () => {
    const { result } = renderHook(() => useSettingsConfig(), { wrapper });

    expect(result.current.gridSizeOptions).toBeDefined();
    expect(Array.isArray(result.current.gridSizeOptions)).toBe(true);
    expect(result.current.gridSizeOptions).toHaveLength(3);
  });

  it('each grid size option should have value and label', () => {
    const { result } = renderHook(() => useSettingsConfig(), { wrapper });

    result.current.gridSizeOptions.forEach(opt => {
      expect(opt).toHaveProperty('value');
      expect(opt).toHaveProperty('label');
      expect(typeof opt.value).toBe('number');
      expect(typeof opt.label).toBe('string');
    });
  });

  it('grid size values should match GRID_SIZES (from mocked constants: 15, 25, 35)', () => {
    const { result } = renderHook(() => useSettingsConfig(), { wrapper });

    const values = result.current.gridSizeOptions.map(o => o.value);
    expect(values).toContain(15);
    expect(values).toContain(25);
    expect(values).toContain(35);
  });

  it('should return speedOptions with 4 entries', () => {
    const { result } = renderHook(() => useSettingsConfig(), { wrapper });

    expect(result.current.speedOptions).toBeDefined();
    expect(Array.isArray(result.current.speedOptions)).toBe(true);
    expect(result.current.speedOptions).toHaveLength(4);
  });

  it('each speed option should have value and label', () => {
    const { result } = renderHook(() => useSettingsConfig(), { wrapper });

    result.current.speedOptions.forEach(opt => {
      expect(opt).toHaveProperty('value');
      expect(opt).toHaveProperty('label');
      expect(typeof opt.value).toBe('number');
      expect(typeof opt.label).toBe('string');
    });
  });

  it('speed values should match ANIMATION_SPEEDS (from mocked constants: 2000, 1000, 500, 250)', () => {
    const { result } = renderHook(() => useSettingsConfig(), { wrapper });

    const values = result.current.speedOptions.map(o => o.value);
    expect(values).toContain(2000);
    expect(values).toContain(1000);
    expect(values).toContain(500);
    expect(values).toContain(250);
  });

  it('should use translated labels for grid sizes', () => {
    const { result } = renderHook(() => useSettingsConfig(), { wrapper });

    const smallOption = result.current.gridSizeOptions.find(
      o => o.value === 15
    );
    expect(smallOption).toBeDefined();
    expect(i18n.t('gridSizes.small')).toBe(smallOption.label);
  });

  it('should use translated labels for speeds', () => {
    const { result } = renderHook(() => useSettingsConfig(), { wrapper });

    const slowOption = result.current.speedOptions.find(o => o.value === 2000);
    expect(slowOption).toBeDefined();
    expect(i18n.t('speeds.slow')).toBe(slowOption.label);
  });
});
