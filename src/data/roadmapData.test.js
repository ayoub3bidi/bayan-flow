/**
 * Copyright (c) 2025 Bayan Flow
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

import { describe, it, expect } from 'vitest';
import { roadmapData } from './roadmapData';

describe('roadmapData', () => {
  describe('Data Structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(roadmapData)).toBe(true);
    });

    it('should have at least one entry', () => {
      expect(roadmapData.length).toBeGreaterThan(0);
    });

    it('should have entries with required fields', () => {
      roadmapData.forEach((entry, _) => {
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('title');
        expect(entry).toHaveProperty('highlights');
        expect(entry).toHaveProperty('status');

        // Optional fields
        expect(entry).toHaveProperty('videoUrl');
        expect(entry).toHaveProperty('articleUrl');
      });
    });
  });

  describe('Entry Properties', () => {
    it('should have unique IDs', () => {
      const ids = roadmapData.map(entry => entry.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid status values', () => {
      const validStatuses = ['completed', 'in-progress', 'planned'];
      roadmapData.forEach(entry => {
        expect(validStatuses).toContain(entry.status);
      });
    });

    it('should have string values for text fields', () => {
      roadmapData.forEach(entry => {
        expect(typeof entry.date).toBe('string');
        expect(typeof entry.title).toBe('string');
        expect(typeof entry.status).toBe('string');
        expect(typeof entry.videoUrl).toBe('string');
        expect(typeof entry.articleUrl).toBe('string');
      });
    });

    it('should have highlights as a non-empty array of strings', () => {
      roadmapData.forEach(entry => {
        expect(Array.isArray(entry.highlights)).toBe(true);
        expect(entry.highlights.length).toBeGreaterThan(0);
        entry.highlights.forEach(highlight => {
          expect(typeof highlight).toBe('string');
          expect(highlight.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have numeric IDs', () => {
      roadmapData.forEach(entry => {
        expect(typeof entry.id).toBe('number');
      });
    });
  });

  describe('Data Content', () => {
    it('should have non-empty titles', () => {
      roadmapData.forEach(entry => {
        expect(entry.title.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty highlights', () => {
      roadmapData.forEach(entry => {
        expect(entry.highlights.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty dates', () => {
      roadmapData.forEach(entry => {
        expect(entry.date.length).toBeGreaterThan(0);
      });
    });

    it('should have valid video URLs (empty string or valid URL)', () => {
      roadmapData.forEach(entry => {
        if (entry.videoUrl) {
          // If videoUrl is provided, it should be a valid URL format
          expect(entry.videoUrl).toMatch(/^https?:\/\/.+/);
        }
      });
    });

    it('should have valid article URLs (empty string or valid URL)', () => {
      roadmapData.forEach(entry => {
        if (entry.articleUrl) {
          // If articleUrl is provided, it should be a valid URL format
          expect(entry.articleUrl).toMatch(/^https?:\/\/.+/);
        }
      });
    });
  });

  describe('Specific Entries', () => {
    it('should have initial release entry', () => {
      const initialRelease = roadmapData.find(entry => entry.id === 1);
      expect(initialRelease).toBeDefined();
      if (initialRelease) {
        expect(initialRelease.title).toContain('0.1.0');
        expect(initialRelease.status).toBe('completed');
      }
    });

    it('should have entries in chronological order by ID', () => {
      const ids = roadmapData.map(entry => entry.id);
      const sortedIds = [...ids].sort((a, b) => a - b);
      expect(ids).toEqual(sortedIds);
    });
  });

  describe('Status Distribution', () => {
    it('should have at least one completed entry', () => {
      const completed = roadmapData.filter(
        entry => entry.status === 'completed'
      );
      expect(completed.length).toBeGreaterThan(0);
    });
  });
});
