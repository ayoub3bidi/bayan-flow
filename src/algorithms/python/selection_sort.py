def selection_sort(arr):
    """
    Selection Sort Algorithm
    Time Complexity: O(n²)
    Space Complexity: O(1)
    
    Selection Sort divides the array into sorted and unsorted regions.
    It repeatedly finds the minimum element from the unsorted region
    and moves it to the end of the sorted region.
    
    Args:
        arr (list): The array to sort
        
    Returns:
        list: The sorted array
    """
    # Create a copy to avoid modifying the original array
    array = arr.copy()
    n = len(array)
    
    # Traverse through all array elements
    for i in range(n - 1):
        # Find the minimum element in the unsorted region
        min_index = i
        
        for j in range(i + 1, n):
            if array[j] < array[min_index]:
                min_index = j
        
        # Swap the found minimum element with the first unsorted element
        if min_index != i:
            array[i], array[min_index] = array[min_index], array[i]
    
    return array


# Example usage and test
if __name__ == "__main__":
    # Test with sample data
    test_array = [64, 34, 25, 12, 22, 11, 90]
    print(f"Original array: {test_array}")
    
    sorted_array = selection_sort(test_array)
    print(f"Sorted array: {sorted_array}")
    
    # Test with edge cases
    print(f"Empty array: {selection_sort([])}")
    print(f"Single element: {selection_sort([42])}")
    print(f"Already sorted: {selection_sort([1, 2, 3, 4, 5])}")
    print(f"Reverse sorted: {selection_sort([5, 4, 3, 2, 1])}")
    print(f"Duplicates: {selection_sort([3, 1, 4, 1, 5, 9, 2, 6, 5])}")


