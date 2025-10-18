import { describe, it, expect } from 'vitest';
import {
  generateRandomStartEnd,
  createEmptyGrid,
  isValidGridSize,
} from './gridHelpers';

describe('Grid Helpers', () => {
  describe('generateRandomStartEnd', () => {
    it('should generate start and end positions', () => {
      const { start, end } = generateRandomStartEnd(10, 10);
      expect(start).toHaveProperty('row');
      expect(start).toHaveProperty('col');
      expect(end).toHaveProperty('row');
      expect(end).toHaveProperty('col');
    });

    it('should generate positions within bounds', () => {
      const rows = 10;
      const cols = 10;
      const { start, end } = generateRandomStartEnd(rows, cols);

      expect(start.row).toBeGreaterThanOrEqual(0);
      expect(start.row).toBeLessThan(rows);
      expect(start.col).toBeGreaterThanOrEqual(0);
      expect(start.col).toBeLessThan(cols);

      expect(end.row).toBeGreaterThanOrEqual(0);
      expect(end.row).toBeLessThan(rows);
      expect(end.col).toBeGreaterThanOrEqual(0);
      expect(end.col).toBeLessThan(cols);
    });

    it('should generate different start and end positions', () => {
      const { start, end } = generateRandomStartEnd(10, 10);
      const isSame = start.row === end.row && start.col === end.col;
      expect(isSame).toBe(false);
    });

    it('should work with small grids', () => {
      const { start, end } = generateRandomStartEnd(2, 2);
      expect(start).toBeTruthy();
      expect(end).toBeTruthy();
      const isSame = start.row === end.row && start.col === end.col;
      expect(isSame).toBe(false);
    });
  });

  describe('createEmptyGrid', () => {
    it('should create a grid with correct dimensions', () => {
      const rows = 5;
      const cols = 5;
      const grid = createEmptyGrid(rows, cols);

      expect(grid.length).toBe(rows);
      expect(grid[0].length).toBe(cols);
    });

    it('should initialize all cells to 0', () => {
      const grid = createEmptyGrid(3, 3);
      grid.forEach(row => {
        row.forEach(cell => {
          expect(cell).toBe(0);
        });
      });
    });

    it('should create independent rows', () => {
      const grid = createEmptyGrid(3, 3);
      grid[0][0] = 1;

      expect(grid[0][0]).toBe(1);
      expect(grid[1][0]).toBe(0);
      expect(grid[2][0]).toBe(0);
    });

    it('should handle rectangular grids', () => {
      const grid = createEmptyGrid(3, 5);
      expect(grid.length).toBe(3);
      expect(grid[0].length).toBe(5);
    });
  });

  describe('isValidGridSize', () => {
    it('should accept valid sizes', () => {
      expect(isValidGridSize(5)).toBe(true);
      expect(isValidGridSize(10)).toBe(true);
      expect(isValidGridSize(25)).toBe(true);
      expect(isValidGridSize(50)).toBe(true);
    });

    it('should reject sizes below minimum', () => {
      expect(isValidGridSize(4)).toBe(false);
      expect(isValidGridSize(0)).toBe(false);
      expect(isValidGridSize(-1)).toBe(false);
    });

    it('should reject sizes above maximum', () => {
      expect(isValidGridSize(51)).toBe(false);
      expect(isValidGridSize(100)).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isValidGridSize(5)).toBe(true); // minimum
      expect(isValidGridSize(50)).toBe(true); // maximum
    });
  });
});
