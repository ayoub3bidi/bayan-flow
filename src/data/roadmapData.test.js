/**
 * Copyright (c) 2025 Ayoub Abidi
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
        expect(entry).toHaveProperty('description');
        expect(entry).toHaveProperty('status');

        // Optional fields
        expect(entry).toHaveProperty('videoUrl');
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
        expect(typeof entry.description).toBe('string');
        expect(typeof entry.status).toBe('string');
        expect(typeof entry.videoUrl).toBe('string');
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

    it('should have non-empty descriptions', () => {
      roadmapData.forEach(entry => {
        expect(entry.description.length).toBeGreaterThan(0);
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
