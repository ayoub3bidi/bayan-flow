/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ALGORITHM_TYPES, ALGORITHM_TYPE_LIST } from '../constants';
import { CATEGORY_CONFIG } from '../registry/categoryConfig';

/**
 * @param {import('i18next').TFunction} t
 * @param {typeof CATEGORY_CONFIG[string]} cfg
 */
export function buildAlgorithmsForCategory(t, cfg) {
  return cfg.algorithmKeys.map(key => ({
    value: key,
    label: t(`${cfg.i18nPrefix}.${key}`),
    complexity: t(`complexity.${key}`),
  }));
}

/**
 * @param {import('i18next').TFunction} t
 * @param {typeof CATEGORY_CONFIG[string]} cfg
 */
export function buildGroupsForCategory(t, cfg) {
  return cfg.groupDefs.map(def => ({
    label: t(def.labelKey),
    algorithms: def.algorithms,
  }));
}

/**
 * i18n-aware algorithm lists and groups derived from CATEGORY_CONFIG (single source of truth).
 *
 * @returns {{
 *   byType: Record<string, { algorithms: Array<{value: string, label: string, complexity: string}>, groups: Array<{label: string, algorithms: string[]}> }>,
 *   sortingAlgorithms: Array,
 *   pathfindingAlgorithms: Array,
 *   sortingGroups: Array,
 *   pathfindingGroups: Array,
 * }}
 */
export const useAlgorithmConfig = () => {
  const { t } = useTranslation();

  const byType = useMemo(() => {
    const out = {};
    for (const type of ALGORITHM_TYPE_LIST) {
      const cfg = CATEGORY_CONFIG[type];
      out[type] = {
        algorithms: buildAlgorithmsForCategory(t, cfg),
        groups: buildGroupsForCategory(t, cfg),
      };
    }
    return out;
  }, [t]);

  return {
    byType,
    sortingAlgorithms: byType[ALGORITHM_TYPES.SORTING].algorithms,
    pathfindingAlgorithms: byType[ALGORITHM_TYPES.PATHFINDING].algorithms,
    sortingGroups: byType[ALGORITHM_TYPES.SORTING].groups,
    pathfindingGroups: byType[ALGORITHM_TYPES.PATHFINDING].groups,
  };
};
