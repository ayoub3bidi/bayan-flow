/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

/**
 * @typedef {'light' | 'dark'} ExportThemeId
 */

/** @param {string | undefined} mode */
export function getVideoExportTheme(mode) {
  const isLight = mode === 'light';

  if (isLight) {
    return {
      shellBg: '#f3f4f6',
      headerBg: '#ffffff',
      headerText: '#111827',
      accentBorder: '#14b8a6',
      captionBg: 'rgba(255, 255, 255, 0.94)',
      captionBorder: 'rgba(209, 213, 219, 0.98)',
      stepAccent: '#0d9488',
      descText: '#374151',
      emptyBg: '#e5e7eb',
      emptyText: '#1f2937',
      titleShadow: '0 1px 4px rgba(0,0,0,0.06)',
      descShadow: 'none',
      captionShadow: '0 8px 28px rgba(0,0,0,0.1)',
      watermarkDiagonalRgb: '55, 65, 81',
      watermarkDiagonalTextShadow: '0 2px 14px rgba(255,255,255,0.75)',
      watermarkCornerText: '#1f2937',
      watermarkCornerTextShadow: '0 1px 3px rgba(255,255,255,0.9)',
      graphEdgeStroke: '#94a3b8',
      graphNodeRing: '#64748b',
      complexity: {
        pageBg: '#f3f4f6',
        heading: '#111827',
        subheading: '#6b7280',
        sectionLabel: '#64748b',
        labelMuted: '#6b7280',
        chartBg: '#ffffff',
        chartBorder: '#d1d5db',
        axisStroke: '#9ca3af',
        axisText: '#6b7280',
        fallbackBg: '#e5e7eb',
        fallbackText: '#4b5563',
      },
    };
  }

  return {
    shellBg: '#111827',
    headerBg: '#1f2937',
    headerText: '#f9fafb',
    accentBorder: '#14b8a6',
    captionBg: 'rgba(17, 24, 39, 0.92)',
    captionBorder: 'rgba(55, 65, 81, 0.95)',
    stepAccent: '#5eead4',
    descText: '#e5e7eb',
    emptyBg: '#1f2937',
    emptyText: '#ffffff',
    titleShadow: '0 2px 12px rgba(0,0,0,0.35)',
    descShadow: '0 1px 6px rgba(0,0,0,0.35)',
    captionShadow: '0 10px 36px rgba(0,0,0,0.5)',
    watermarkDiagonalRgb: '249, 250, 251',
    watermarkDiagonalTextShadow: '0 4px 28px rgba(0,0,0,0.45)',
    watermarkCornerText: '#f9fafb',
    watermarkCornerTextShadow: '0 1px 4px rgba(0,0,0,0.9)',
    graphEdgeStroke: '#9ca3af',
    graphNodeRing: '#374151',
    complexity: {
      pageBg: '#111827',
      heading: '#f9fafb',
      subheading: '#9ca3af',
      sectionLabel: '#9ca3af',
      labelMuted: '#6b7280',
      chartBg: '#1f2937',
      chartBorder: '#374151',
      axisStroke: '#6b7280',
      axisText: '#9ca3af',
      fallbackBg: '#111827',
      fallbackText: '#9ca3af',
    },
  };
}
