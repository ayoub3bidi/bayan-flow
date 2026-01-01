def shell_sort(arr):
    """
    Shell Sort Algorithm (Using Knuth's Gap Sequence)
    
    Time Complexity: O(n^(3/2)) with Knuth's sequence
    Space Complexity: O(1)

    Shell Sort is an optimization of Insertion Sort that allows the exchange of items
    that are far apart. The algorithm sorts elements at specific intervals (gaps),
    gradually reducing the gap until it becomes 1 (at which point it's essentially
    insertion sort on a nearly sorted array).
    
    This implementation uses Knuth's gap sequence: 1, 4, 13, 40, 121, 364...
    Formula: gap = (3^k - 1) / 2, which provides O(n^(3/2)) worst-case performance.
    This is significantly better than the original Shell sequence (n/2, n/4, n/8...)
    which has O(n²) worst-case complexity.
    
    Args:
        arr: List of comparable elements to sort
        
    Returns:
        Sorted list in ascending order
    """
    array = arr.copy()
    n = len(array)
    
    # Calculate initial gap using Knuth's sequence: (3^k - 1) / 2
    # Start with the largest gap less than n/3
    gap = 1
    while gap < n // 3:
        gap = gap * 3 + 1  # 1, 4, 13, 40, 121, 364...
    
    # Start with the calculated gap, then reduce using reverse formula
    while gap > 0:
        # Do a gapped insertion sort for this gap size
        # The first gap elements array[0..gap-1] are already in gapped order
        # Keep adding one more element until the entire array is gap sorted
        for i in range(gap, n):
            # Save array[i] in temp and make a hole at position i
            temp = array[i]
            
            # Shift earlier gap-sorted elements up until the correct
            # location for array[i] is found
            j = i
            while j >= gap and array[j - gap] > temp:
                array[j] = array[j - gap]
                j -= gap
            
            # Put temp (the original array[i]) in its correct location
            array[j] = temp
        
        # Reduce gap using Knuth's sequence: gap = (gap - 1) / 3
        gap = (gap - 1) // 3
    
    return array


# Example usage and testing
if __name__ == "__main__":
    # Test cases
    test_arrays = [
        [64, 34, 25, 12, 22, 11, 90],
        [5, 2, 4, 6, 1, 3],
        [1, 2, 3, 4, 5],  # Already sorted
        [5, 4, 3, 2, 1],  # Reverse sorted
        [42],  # Single element
        [],  # Empty array
        [3, 3, 3, 3, 3],  # All same elements
        [9, 7, 5, 11, 12, 2, 14, 3, 10, 6],  # Larger array
    ]
    
    print("Shell Sort Algorithm Test Results:\n")
    
    for test in test_arrays:
        original = test.copy()
        sorted_arr = shell_sort(test)
        is_correct = sorted_arr == sorted(original)
        
        print(f"Original: {original}")
        print(f"Sorted:   {sorted_arr}")
        print(f"Correct:  {'✓' if is_correct else '✗'}")
        print()
    
    # Demonstrate gap sequence
    print("\nGap Sequence Demonstration (for array size 20):")
    n = 20
    gap = n // 2
    gaps = []
    while gap > 0:
        gaps.append(gap)
        gap //= 2
    print(f"Gap sequence: {gaps}")
    print(f"Number of passes: {len(gaps)}")


