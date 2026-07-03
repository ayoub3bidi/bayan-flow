/**
 * @file Unit tests for entitlementService.js
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getUserPlan,
  canAccessAlgorithm,
  canUseManualControls,
  canChangeSpeed,
  canUseCategoryControls,
  canRunVisualization,
  incrementVisualizationCount,
  getRemainingVisualizations,
  canViewComplexityPanel,
  incrementComplexityViewCount,
  canRunVideoExport,
  incrementVideoExportCount,
  getExportWatermarkConfig,
  canCustomizeExportWatermark,
  resetAllSessionCounters,
} from '@/services/entitlementService';
import { PLAN_TIERS } from '@/constants/algorithmEntitlements';

describe('entitlementService', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: key => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString();
      },
      removeItem: key => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('getUserPlan', () => {
    it('should return anonymous for null user', () => {
      expect(getUserPlan(null)).toBe(PLAN_TIERS.ANONYMOUS);
    });

    it('should return free for signed-in user without pro plan', () => {
      const user = { id: '123', email: 'test@example.com' };
      expect(getUserPlan(user)).toBe(PLAN_TIERS.FREE);
    });

    it('should return free for signed-in user (pro tier not yet implemented)', () => {
      const user = { id: '123', email: 'test@example.com', plan: 'free' };
      expect(getUserPlan(user)).toBe(PLAN_TIERS.FREE);
    });

    it('should return pro for signed-in users with a pro plan', () => {
      const user = { id: '123', email: 'test@example.com', plan: 'pro' };
      expect(getUserPlan(user)).toBe(PLAN_TIERS.PRO);
    });
  });

  describe('canAccessAlgorithm', () => {
    it('should allow all algorithms for signed-in users', () => {
      const user = { id: '123' };
      expect(canAccessAlgorithm('quickSort', 'sorting', user)).toBe(true);
      expect(canAccessAlgorithm('bellmanFord', 'pathfinding', user)).toBe(true);
      expect(canAccessAlgorithm('primAlgorithm', 'graphAlgorithm', user)).toBe(
        true
      );
    });

    it('should allow anonymous tier algorithms for anonymous users', () => {
      expect(canAccessAlgorithm('bubbleSort', 'sorting', null)).toBe(true);
      expect(canAccessAlgorithm('bfs', 'pathfinding', null)).toBe(true);
      expect(canAccessAlgorithm('linearSearch', 'searching', null)).toBe(true);
    });

    it('should block non-anonymous-tier algorithms for anonymous users', () => {
      expect(canAccessAlgorithm('quickSort', 'sorting', null)).toBe(false);
      expect(canAccessAlgorithm('bellmanFord', 'pathfinding', null)).toBe(
        false
      );
      expect(canAccessAlgorithm('primAlgorithm', 'graphAlgorithm', null)).toBe(
        false
      );
    });
  });

  describe('canUseManualControls', () => {
    it('should return false for anonymous users', () => {
      expect(canUseManualControls(null)).toBe(false);
    });

    it('should return true for signed-in users', () => {
      const user = { id: '123' };
      expect(canUseManualControls(user)).toBe(true);
    });
  });

  describe('canChangeSpeed', () => {
    it('should return false for anonymous users', () => {
      expect(canChangeSpeed(null)).toBe(false);
    });

    it('should return true for signed-in users', () => {
      const user = { id: '123' };
      expect(canChangeSpeed(user)).toBe(true);
    });
  });

  describe('canUseCategoryControls', () => {
    it('should return false for anonymous users', () => {
      expect(canUseCategoryControls(null)).toBe(false);
    });

    it('should return true for signed-in users', () => {
      const user = { id: '123' };
      expect(canUseCategoryControls(user)).toBe(true);
    });
  });

  describe('canRunVisualization and incrementVisualizationCount', () => {
    it('should allow unlimited visualizations for signed-in users', () => {
      const user = { id: '123' };
      expect(canRunVisualization(user)).toBe(true);
      // After many increments (shouldn't affect signed-in users)
      for (let i = 0; i < 20; i++) {
        incrementVisualizationCount();
      }
      expect(canRunVisualization(user)).toBe(true);
    });

    it('should allow up to 12 visualizations for anonymous users', () => {
      expect(canRunVisualization(null)).toBe(true);
      for (let i = 0; i < 11; i++) {
        incrementVisualizationCount();
        expect(canRunVisualization(null)).toBe(true);
      }
      incrementVisualizationCount(); // 12th
      expect(canRunVisualization(null)).toBe(false);
    });

    it('should persist count in localStorage', () => {
      incrementVisualizationCount();
      incrementVisualizationCount();
      expect(localStorage.getItem('anon_viz_count')).toBe('2');
    });
  });

  describe('getRemainingVisualizations', () => {
    it('should return Infinity for signed-in users', () => {
      const user = { id: '123' };
      expect(getRemainingVisualizations(user)).toBe(Infinity);
    });

    it('should return correct remaining count for anonymous users', () => {
      expect(getRemainingVisualizations(null)).toBe(12);
      incrementVisualizationCount();
      expect(getRemainingVisualizations(null)).toBe(11);
      incrementVisualizationCount();
      incrementVisualizationCount();
      expect(getRemainingVisualizations(null)).toBe(9);
    });

    it('should not return negative values', () => {
      for (let i = 0; i < 15; i++) {
        incrementVisualizationCount();
      }
      expect(getRemainingVisualizations(null)).toBe(0);
    });
  });

  describe('canViewComplexityPanel and incrementComplexityViewCount', () => {
    it('should allow unlimited complexity views for signed-in users', () => {
      const user = { id: '123' };
      expect(canViewComplexityPanel(user)).toBe(true);
      for (let i = 0; i < 10; i++) {
        incrementComplexityViewCount();
      }
      expect(canViewComplexityPanel(user)).toBe(true);
    });

    it('should allow up to 2 complexity views for anonymous users', () => {
      expect(canViewComplexityPanel(null)).toBe(true);
      incrementComplexityViewCount();
      expect(canViewComplexityPanel(null)).toBe(true);
      incrementComplexityViewCount();
      expect(canViewComplexityPanel(null)).toBe(false);
    });

    it('should persist count in localStorage', () => {
      incrementComplexityViewCount();
      expect(localStorage.getItem('anon_complexity_views')).toBe('1');
    });
  });

  describe('video export entitlements', () => {
    it('should block anonymous users from video export', () => {
      expect(canRunVideoExport(null)).toBe(false);
    });

    it('should allow free users under the daily export guard', () => {
      const user = { id: '123' };

      expect(canRunVideoExport(user)).toBe(true);

      for (let i = 0; i < 49; i += 1) {
        incrementVideoExportCount(user);
      }

      expect(canRunVideoExport(user)).toBe(true);
    });

    it('should block free users at the daily export guard', () => {
      const user = { id: '123' };

      for (let i = 0; i < 50; i += 1) {
        incrementVideoExportCount(user);
      }

      expect(canRunVideoExport(user)).toBe(false);
    });

    it('should reset the free export guard on a new UTC day', () => {
      const user = { id: '123' };
      localStorage.setItem(
        'free_export_daily_123',
        JSON.stringify({ date: '2025-01-01', count: 50 })
      );

      expect(canRunVideoExport(user)).toBe(true);
    });

    it('should not limit pro users with the free export guard', () => {
      const user = { id: '123', plan: 'pro' };

      for (let i = 0; i < 60; i += 1) {
        incrementVideoExportCount(user);
      }

      expect(canRunVideoExport(user)).toBe(true);
    });

    it('should require the default watermark for free users', () => {
      const watermark = getExportWatermarkConfig({ id: '123' });

      expect(watermark).toEqual(
        expect.objectContaining({
          enabled: true,
          text: 'Bayan Flow',
        })
      );
    });

    it('should allow watermark customization only for pro users', () => {
      expect(canCustomizeExportWatermark({ id: 'free-user' })).toBe(false);
      expect(canCustomizeExportWatermark({ id: 'pro-user', plan: 'pro' })).toBe(
        true
      );
    });
  });

  describe('resetAllSessionCounters', () => {
    it('should clear all anonymous session counters', () => {
      incrementVisualizationCount();
      incrementVisualizationCount();
      incrementComplexityViewCount();
      expect(localStorage.getItem('anon_viz_count')).toBe('2');
      expect(localStorage.getItem('anon_complexity_views')).toBe('1');

      resetAllSessionCounters();

      expect(localStorage.getItem('anon_viz_count')).toBeNull();
      expect(localStorage.getItem('anon_complexity_views')).toBeNull();
    });

    it('should reset counters to zero after clearing', () => {
      incrementVisualizationCount();
      incrementVisualizationCount();
      incrementComplexityViewCount();

      resetAllSessionCounters();

      expect(getRemainingVisualizations(null)).toBe(12);
      expect(canViewComplexityPanel(null)).toBe(true);
    });
  });
});
