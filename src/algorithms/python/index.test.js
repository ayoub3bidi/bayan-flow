/**
 * Copyright (c) 2025 Ayoub Abidi
 * Licensed under Elastic License 2.0 OR Commercial
 * See LICENSE for details.
 */

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

vi.mock('./counting_sort.py?raw', () => ({
  default:
    'def counting_sort(arr):\n    """Counting Sort Algorithm"""\n    return sorted(arr)',
}));

vi.mock('./bfs.py?raw', () => ({
  default:
    'def bfs(grid, start, end):\n    """Breadth-First Search Algorithm"""\n    return []',
}));

vi.mock('./dijkstra.py?raw', () => ({
  default:
    'def dijkstra(grid, start, end):\n    """Dijkstra\'s Algorithm"""\n    return []',
}));

vi.mock('./astar.py?raw', () => ({
  default:
    'def astar(grid, start, end):\n    """A* Search Algorithm"""\n    return []',
}));

vi.mock('./bidirectional_search.py?raw', () => ({
  default:
    'def bidirectional_search(grid, start, end):\n    """Bidirectional Search Algorithm"""\n    return []',
}));

vi.mock('./greedy_best_first_search.py?raw', () => ({
  default:
    'def greedy_best_first_search(grid, start, end):\n    """Greedy Best-First Search Algorithm"""\n    return []',
}));

vi.mock('./jump_point_search.py?raw', () => ({
  default:
    'def jump_point_search(grid, start, end):\n    """Jump Point Search Algorithm"""\n    return []',
}));

vi.mock('./bellman_ford.py?raw', () => ({
  default:
    'def bellman_ford(grid, start, end):\n    """Bellman-Ford Algorithm"""\n    return []',
}));

vi.mock('./ida_star.py?raw', () => ({
  default:
    'def ida_star(grid, start, end):\n    """IDA* Search Algorithm"""\n    return []',
}));

vi.mock('./binary_search.py?raw', () => ({
  default:
    'def binary_search(arr, target):\n    """Binary Search Algorithm"""\n    return -1',
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

    it('returns Python code for Counting Sort', () => {
      const code = getPythonCode('countingSort');
      expect(code).toContain('def counting_sort');
      expect(code).toContain('Counting Sort Algorithm');
    });

    it('returns Python code for BFS', () => {
      const code = getPythonCode('bfs');
      expect(code).toContain('def bfs');
      expect(code).toContain('Breadth-First Search');
    });

    it('returns Python code for Dijkstra', () => {
      const code = getPythonCode('dijkstra');
      expect(code).toContain('def dijkstra');
      expect(code).toContain('Dijkstra');
    });

    it('returns Python code for A*', () => {
      const code = getPythonCode('aStar');
      expect(code).toContain('def astar');
      expect(code).toContain('A* Search');
    });

    it('returns Python code for Bidirectional Search', () => {
      const code = getPythonCode('bidirectionalSearch');
      expect(code).toContain('def bidirectional_search');
      expect(code).toContain('Bidirectional Search');
    });

    it('returns Python code for Greedy Best-First Search', () => {
      const code = getPythonCode('greedyBestFirstSearch');
      expect(code).toContain('def greedy_best_first_search');
      expect(code).toContain('Greedy Best-First Search');
    });

    it('returns Python code for Jump Point Search', () => {
      const code = getPythonCode('jumpPointSearch');
      expect(code).toContain('def jump_point_search');
      expect(code).toContain('Jump Point Search');
    });

    it('returns Python code for Bellman-Ford', () => {
      const code = getPythonCode('bellmanFord');
      expect(code).toContain('def bellman_ford');
      expect(code).toContain('Bellman-Ford');
    });

    it('returns Python code for IDA*', () => {
      const code = getPythonCode('idaStar');
      expect(code).toContain('def ida_star');
      expect(code).toContain('IDA* Search');
    });

    it('returns Python code for binary search', () => {
      const code = getPythonCode('binarySearch');
      expect(code).toContain('def binary_search');
      expect(code).toContain('Binary Search Algorithm');
    });

    it('returns Python code for jump search', () => {
      const code = getPythonCode('jumpSearch');
      expect(code).toContain('def jump_search');
      expect(code).toContain('Jump Search Algorithm');
    });

    it('returns Python code for interpolation search', () => {
      const code = getPythonCode('interpolationSearch');
      expect(code).toContain('def interpolation_search');
      expect(code).toContain('Interpolation Search Algorithm');
    });

    it('returns Python code for exponential search', () => {
      const code = getPythonCode('exponentialSearch');
      expect(code).toContain('def exponential_search');
      expect(code).toContain('Exponential Search Algorithm');
    });

    it('returns Python code for fibonacci search', () => {
      const code = getPythonCode('fibonacciSearch');
      expect(code).toContain('def fibonacci_search');
      expect(code).toContain('Fibonacci Search Algorithm');
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

    it('returns correct display name for counting sort', () => {
      const name = getAlgorithmDisplayName('countingSort');
      expect(name).toBe('Counting Sort');
    });

    it('returns correct display name for BFS', () => {
      const name = getAlgorithmDisplayName('bfs');
      expect(name).toBe('Breadth-First Search (BFS)');
    });

    it('returns correct display name for Dijkstra', () => {
      const name = getAlgorithmDisplayName('dijkstra');
      expect(name).toBe("Dijkstra's Algorithm");
    });

    it('returns correct display name for A*', () => {
      const name = getAlgorithmDisplayName('aStar');
      expect(name).toBe('A* Search');
    });

    it('returns correct display name for Bidirectional Search', () => {
      const name = getAlgorithmDisplayName('bidirectionalSearch');
      expect(name).toBe('Bidirectional Search');
    });

    it('returns correct display name for Greedy Best-First Search', () => {
      const name = getAlgorithmDisplayName('greedyBestFirstSearch');
      expect(name).toBe('Greedy Best-First Search');
    });

    it('returns correct display name for Jump Point Search', () => {
      const name = getAlgorithmDisplayName('jumpPointSearch');
      expect(name).toBe('Jump Point Search');
    });

    it('returns correct display name for Bellman-Ford', () => {
      const name = getAlgorithmDisplayName('bellmanFord');
      expect(name).toBe('Bellman-Ford Algorithm');
    });

    it('returns correct display name for IDA*', () => {
      const name = getAlgorithmDisplayName('idaStar');
      expect(name).toBe('Iterative Deepening A* (IDA*)');
    });

    it('returns correct display name for binary search', () => {
      const name = getAlgorithmDisplayName('binarySearch');
      expect(name).toBe('Binary Search');
    });

    it('returns correct display name for jump search', () => {
      const name = getAlgorithmDisplayName('jumpSearch');
      expect(name).toBe('Jump Search');
    });

    it('returns correct display name for exponential search', () => {
      const name = getAlgorithmDisplayName('exponentialSearch');
      expect(name).toBe('Exponential Search');
    });

    it('returns correct display name for fibonacci search', () => {
      const name = getAlgorithmDisplayName('fibonacciSearch');
      expect(name).toBe('Fibonacci Search');
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
      const supportedAlgorithms = [
        'bubbleSort',
        'quickSort',
        'mergeSort',
        'countingSort',
        'bfs',
        'dijkstra',
        'aStar',
        'bidirectionalSearch',
        'greedyBestFirstSearch',
        'jumpPointSearch',
        'bellmanFord',
        'idaStar',
        'binarySearch',
        'jumpSearch',
        'interpolationSearch',
        'exponentialSearch',
        'fibonacciSearch',
      ];

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
