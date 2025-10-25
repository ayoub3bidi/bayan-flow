def merge_sort(arr):
    """
    Merge Sort Algorithm
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    
    Merge Sort divides the array into two halves, recursively sorts them,
    and then merges the sorted halves back together.
    
    Args:
        arr (list): The array to sort
        
    Returns:
        list: The sorted array
    """
    # Base case: arrays with 0 or 1 element are already sorted
    if len(arr) <= 1:
        return arr.copy()
    
    # Divide the array into two halves
    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]
    
    # Recursively sort both halves
    left_sorted = merge_sort(left_half)
    right_sorted = merge_sort(right_half)
    
    # Merge the sorted halves
    return merge(left_sorted, right_sorted)


def merge(left, right):
    """
    Merge two sorted arrays into one sorted array
    
    Args:
        left (list): First sorted array
        right (list): Second sorted array
        
    Returns:
        list: Merged sorted array
    """
    result = []
    left_index = 0
    right_index = 0
    
    # Compare elements from both arrays and add the smaller one to result
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            result.append(left[left_index])
            left_index += 1
        else:
            result.append(right[right_index])
            right_index += 1
    
    # Add remaining elements from left array (if any)
    while left_index < len(left):
        result.append(left[left_index])
        left_index += 1
    
    # Add remaining elements from right array (if any)
    while right_index < len(right):
        result.append(right[right_index])
        right_index += 1
    
    return result


# Example usage and test
if __name__ == "__main__":
    # Test with sample data
    test_array = [64, 34, 25, 12, 22, 11, 90]
    print(f"Original array: {test_array}")
    
    sorted_array = merge_sort(test_array)
    print(f"Sorted array: {sorted_array}")
    
    # Test with edge cases
    print(f"Empty array: {merge_sort([])}")
    print(f"Single element: {merge_sort([42])}")
    print(f"Already sorted: {merge_sort([1, 2, 3, 4, 5])}")
    print(f"Reverse sorted: {merge_sort([5, 4, 3, 2, 1])}")
    print(f"Duplicates: {merge_sort([3, 1, 4, 1, 5, 9, 2, 6, 5])}")


