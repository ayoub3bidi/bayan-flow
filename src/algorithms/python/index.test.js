import { describe, it, expect, vi } from 'vitest';
import { getPythonCode, getAlgorithmDisplayName } from './index';

// Mock the raw imports
vi.mock('./bubble_sort.py?raw', () => ({
  default:
    'def bubble_sort(arr):\n    """Bubble Sort Algorithm"""\n    return sorted(arr)',
}));

vi.mock('./quick_sort.py?raw', () => ({
  default:
    'def quick_sort(arr):\n    """Quick Sort Algorithm"""\n    return sorted(arr)',
}));

vi.mock('./merge_sort.py?raw', () => ({
  default:
    'def merge_sort(arr):\n    """Merge Sort Algorithm"""\n    return sorted(arr)',
}));

describe('Python Algorithms Index', () => {
  describe('getPythonCode', () => {
    it('returns Python code for bubble sort', () => {
      const code = getPythonCode('bubbleSort');
      expect(code).toContain('def bubble_sort');
      expect(code).toContain('Bubble Sort Algorithm');
    });

    it('returns Python code for quick sort', () => {
      const code = getPythonCode('quickSort');
      expect(code).toContain('def quick_sort');
      expect(code).toContain('Quick Sort Algorithm');
    });

    it('returns Python code for merge sort', () => {
      const code = getPythonCode('mergeSort');
      expect(code).toContain('def merge_sort');
      expect(code).toContain('Merge Sort Algorithm');
    });

    it('returns null for unknown algorithm', () => {
      const code = getPythonCode('unknownSort');
      expect(code).toBeNull();
    });

    it('returns null for undefined algorithm', () => {
      const code = getPythonCode(undefined);
      expect(code).toBeNull();
    });

    it('returns null for null algorithm', () => {
      const code = getPythonCode(null);
      expect(code).toBeNull();
    });
  });

  describe('getAlgorithmDisplayName', () => {
    it('returns correct display name for bubble sort', () => {
      const name = getAlgorithmDisplayName('bubbleSort');
      expect(name).toBe('Bubble Sort');
    });

    it('returns correct display name for quick sort', () => {
      const name = getAlgorithmDisplayName('quickSort');
      expect(name).toBe('Quick Sort');
    });

    it('returns correct display name for merge sort', () => {
      const name = getAlgorithmDisplayName('mergeSort');
      expect(name).toBe('Merge Sort');
    });

    it('returns algorithm name as fallback for unknown algorithm', () => {
      const name = getAlgorithmDisplayName('unknownSort');
      expect(name).toBe('unknownSort');
    });

    it('returns algorithm name as fallback for undefined', () => {
      const name = getAlgorithmDisplayName(undefined);
      expect(name).toBe(undefined);
    });

    it('returns algorithm name as fallback for null', () => {
      const name = getAlgorithmDisplayName(null);
      expect(name).toBe(null);
    });
  });

  describe('algorithm coverage', () => {
    it('has Python implementations for all supported algorithms', () => {
      const supportedAlgorithms = ['bubbleSort', 'quickSort', 'mergeSort'];

      supportedAlgorithms.forEach(algorithm => {
        const code = getPythonCode(algorithm);
        const displayName = getAlgorithmDisplayName(algorithm);

        expect(code).toBeTruthy();
        expect(code).toContain('def ');
        expect(displayName).toBeTruthy();
        expect(displayName).not.toBe(algorithm); // Should have a proper display name
      });
    });
  });
});
