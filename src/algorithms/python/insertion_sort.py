def insertion_sort(arr):
    """
    Insertion Sort Algorithm
    
    Time Complexity: O(n²) in average and worst case
                     O(n) in best case (already sorted)
    Space Complexity: O(1) - sorts in-place
    
    Description:
    Insertion sort builds the final sorted array one item at a time.
    It iterates through the array, removing one element per iteration,
    finding the location it belongs within the sorted list, and inserting it there.
    
    How it works:
    1. Start from the second element (index 1)
    2. Compare it with elements in the sorted portion (left side)
    3. Shift larger elements one position to the right
    4. Insert the element at its correct position
    5. Repeat for all remaining elements
    
    Use Cases:
    - Small datasets (efficient for small arrays)
    - Nearly sorted arrays (performs well, close to O(n))
    - Online algorithms (can sort data as it arrives)
    - When simplicity and easy implementation are priorities
    
    Args:
        arr: List of comparable elements to sort
        
    Returns:
        Sorted list in ascending order
    """
    array = arr.copy()
    n = len(array)
    
    # Start from second element (first element is trivially sorted)
    for i in range(1, n):
        # Current element to be inserted into sorted portion
        key = array[i]
        
        # Index of the last element in sorted portion
        j = i - 1
        
        # Move elements of array[0..i-1] that are greater than key
        # to one position ahead of their current position
        while j >= 0 and array[j] > key:
            array[j + 1] = array[j]
            j -= 1
        
        # Insert key at its correct position
        array[j + 1] = key
    
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
    ]
    
    for test in test_arrays:
        original = test.copy()
        sorted_arr = insertion_sort(test)
        print(f"Original: {original}")
        print(f"Sorted:   {sorted_arr}")
        print(f"Is sorted: {sorted_arr == sorted(original)}")
        print()


