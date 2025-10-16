def bubble_sort(arr):
    """
    Bubble Sort Algorithm
    Time Complexity: O(n²)
    Space Complexity: O(1)
    
    Bubble Sort repeatedly steps through the list, compares adjacent elements
    and swaps them if they are in the wrong order. The pass through the list
    is repeated until the list is sorted.
    
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
        swapped = False
        
        # Last i elements are already in place
        for j in range(n - i - 1):
            # Traverse the array from 0 to n-i-1
            # Swap if the element found is greater than the next element
            if array[j] > array[j + 1]:
                array[j], array[j + 1] = array[j + 1], array[j]
                swapped = True
        
        # If no two elements were swapped by inner loop, then break
        if not swapped:
            break
    
    return array


# Example usage and test
if __name__ == "__main__":
    # Test with sample data
    test_array = [64, 34, 25, 12, 22, 11, 90]
    print(f"Original array: {test_array}")
    
    sorted_array = bubble_sort(test_array)
    print(f"Sorted array: {sorted_array}")
    
    # Test with edge cases
    print(f"Empty array: {bubble_sort([])}")
    print(f"Single element: {bubble_sort([42])}")
    print(f"Already sorted: {bubble_sort([1, 2, 3, 4, 5])}")
    print(f"Reverse sorted: {bubble_sort([5, 4, 3, 2, 1])}")
