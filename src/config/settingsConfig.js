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
    { value: ANIMATION_SPEEDS.SLOW, label: t('speeds.slow') },
    { value: ANIMATION_SPEEDS.MEDIUM, label: t('speeds.medium') },
    { value: ANIMATION_SPEEDS.FAST, label: t('speeds.fast') },
    { value: ANIMATION_SPEEDS.VERY_FAST, label: t('speeds.veryFast') },
  ];

  return {
    gridSizeOptions,
    speedOptions,
  };
};
