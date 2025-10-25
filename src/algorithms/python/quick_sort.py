def quick_sort(arr):
    """
    Quick Sort Algorithm
    Time Complexity: O(n log n) average, O(n²) worst case
    Space Complexity: O(log n) average, O(n) worst case
    
    Quick Sort picks an element as a pivot and partitions the array around
    the pivot. It then recursively sorts the sub-arrays.
    
    Args:
        arr (list): The array to sort
        
    Returns:
        list: The sorted array
    """
    # Create a copy to avoid modifying the original array
    array = arr.copy()
    
    def _quick_sort_helper(low, high):
        """Helper function for recursive quick sort"""
        if low < high:
            # Partition the array and get the pivot index
            pivot_index = partition(low, high)
            
            # Recursively sort elements before and after partition
            _quick_sort_helper(low, pivot_index - 1)
            _quick_sort_helper(pivot_index + 1, high)
    
    def partition(low, high):
        """
        Partition function using Lomuto partition scheme
        Places the pivot element at its correct position in sorted array
        """
        # Choose the rightmost element as pivot
        pivot = array[high]
        
        # Index of smaller element (indicates right position of pivot)
        i = low - 1
        
        for j in range(low, high):
            # If current element is smaller than or equal to pivot
            if array[j] <= pivot:
                i += 1
                array[i], array[j] = array[j], array[i]
        
        # Place pivot at correct position
        array[i + 1], array[high] = array[high], array[i + 1]
        return i + 1
    
    # Start the recursive sorting
    _quick_sort_helper(0, len(array) - 1)
    return array


# Example usage and test
if __name__ == "__main__":
    # Test with sample data
    test_array = [64, 34, 25, 12, 22, 11, 90]
    print(f"Original array: {test_array}")
    
    sorted_array = quick_sort(test_array)
    print(f"Sorted array: {sorted_array}")
    
    # Test with edge cases
    print(f"Empty array: {quick_sort([])}")
    print(f"Single element: {quick_sort([42])}")
    print(f"Already sorted: {quick_sort([1, 2, 3, 4, 5])}")
    print(f"Reverse sorted: {quick_sort([5, 4, 3, 2, 1])}")
    print(f"Duplicates: {quick_sort([3, 1, 4, 1, 5, 9, 2, 6, 5])}")


