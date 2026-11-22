/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useTranslation } from 'react-i18next';
import { ANIMATION_SPEEDS, GRID_SIZES } from '../constants';

export const useSettingsConfig = () => {
  const { t } = useTranslation();

  const gridSizeOptions = [
    { value: GRID_SIZES.SMALL, label: t('gridSizes.small') },
    { value: GRID_SIZES.MEDIUM, label: t('gridSizes.medium') },
    { value: GRID_SIZES.LARGE, label: t('gridSizes.large') },
  ];

  const speedOptions = [
    { value: ANIMATION_SPEEDS.SLOW, label: '0.5×' },
    { value: ANIMATION_SPEEDS.MEDIUM, label: '1×' },
    { value: ANIMATION_SPEEDS.FAST, label: '2×' },
    { value: ANIMATION_SPEEDS.VERY_FAST, label: '4×' },
    { value: ANIMATION_SPEEDS.ULTRA_FAST, label: '8×' },
  ];

  return {
    gridSizeOptions,
    speedOptions,
  };
};
