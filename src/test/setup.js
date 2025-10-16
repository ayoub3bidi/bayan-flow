import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

// Mock raw Python file imports for tests
vi.mock('../algorithms/python/bubble_sort.py?raw', () => ({
  default: `def bubble_sort(arr):
    """
    Bubble Sort Algorithm
    Time Complexity: O(n²)
    Space Complexity: O(1)
    """
    array = arr.copy()
    n = len(array)
    
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if array[j] > array[j + 1]:
                array[j], array[j + 1] = array[j + 1], array[j]
                swapped = True
        if not swapped:
            break
    
    return array`,
}));

vi.mock('../algorithms/python/quick_sort.py?raw', () => ({
  default: `def quick_sort(arr):
    """
    Quick Sort Algorithm
    Time Complexity: O(n log n) average, O(n²) worst case
    Space Complexity: O(log n)
    """
    array = arr.copy()
    
    def _quick_sort_helper(low, high):
        if low < high:
            pivot_index = partition(low, high)
            _quick_sort_helper(low, pivot_index - 1)
            _quick_sort_helper(pivot_index + 1, high)
    
    def partition(low, high):
        pivot = array[high]
        i = low - 1
        
        for j in range(low, high):
            if array[j] <= pivot:
                i += 1
                array[i], array[j] = array[j], array[i]
        
        array[i + 1], array[high] = array[high], array[i + 1]
        return i + 1
    
    _quick_sort_helper(0, len(array) - 1)
    return array`,
}));

vi.mock('../algorithms/python/merge_sort.py?raw', () => ({
  default: `def merge_sort(arr):
    """
    Merge Sort Algorithm
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if len(arr) <= 1:
        return arr.copy()
    
    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]
    
    left_sorted = merge_sort(left_half)
    right_sorted = merge_sort(right_half)
    
    return merge(left_sorted, right_sorted)

def merge(left, right):
    result = []
    left_index = 0
    right_index = 0
    
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            result.append(left[left_index])
            left_index += 1
        else:
            result.append(right[right_index])
            right_index += 1
    
    while left_index < len(left):
        result.append(left[left_index])
        left_index += 1
    
    while right_index < len(right):
        result.append(right[right_index])
        right_index += 1
    
    return result`,
}));
