def heap_sort(arr):
    """
    Heap Sort Algorithm
    Time Complexity: O(n log n)
    Space Complexity: O(1)
    
    Heap Sort is a comparison-based sorting algorithm that uses a binary heap
    data structure. It divides its input into a sorted and an unsorted region,
    and iteratively shrinks the unsorted region by extracting the largest element
    from the heap and inserting it into the sorted region.
    
    Args:
        arr (list): The array to sort
        
    Returns:
        list: The sorted array
    """
    # Create a copy to avoid modifying the original array
    array = arr.copy()
    n = len(array)
    
    # Build max heap (rearrange array)
    # Start from the last non-leaf node and heapify each node
    for i in range(n // 2 - 1, -1, -1):
        heapify(array, n, i)
    
    # Extract elements from heap one by one
    for i in range(n - 1, 0, -1):
        # Move current root (maximum) to end
        array[0], array[i] = array[i], array[0]
        
        # Call heapify on the reduced heap
        heapify(array, i, 0)
    
    return array


def heapify(arr, heap_size, root_index):
    """
    Heapify a subtree rooted at index root_index.
    
    Args:
        arr (list): The array to heapify
        heap_size (int): Size of heap
        root_index (int): Root index of subtree to heapify
    """
    largest = root_index  # Initialize largest as root
    left = 2 * root_index + 1  # Left child index
    right = 2 * root_index + 2  # Right child index
    
    # Check if left child exists and is greater than root
    if left < heap_size and arr[left] > arr[largest]:
        largest = left
    
    # Check if right child exists and is greater than largest so far
    if right < heap_size and arr[right] > arr[largest]:
        largest = right
    
    # If largest is not root, swap and continue heapifying
    if largest != root_index:
        arr[root_index], arr[largest] = arr[largest], arr[root_index]
        
        # Recursively heapify the affected subtree
        heapify(arr, heap_size, largest)


# Example usage and test
if __name__ == "__main__":
    # Test with sample data
    test_array = [64, 34, 25, 12, 22, 11, 90]
    print(f"Original array: {test_array}")
    
    sorted_array = heap_sort(test_array)
    print(f"Sorted array: {sorted_array}")
    
    # Test with edge cases
    print(f"Empty array: {heap_sort([])}")
    print(f"Single element: {heap_sort([42])}")
    print(f"Already sorted: {heap_sort([1, 2, 3, 4, 5])}")
    print(f"Reverse sorted: {heap_sort([5, 4, 3, 2, 1])}")
    print(f"Duplicates: {heap_sort([5, 2, 8, 2, 9, 1, 5, 5])}")


