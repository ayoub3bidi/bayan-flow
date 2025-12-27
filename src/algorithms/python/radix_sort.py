def radix_sort(arr):
    """
    Radix Sort Algorithm
    Time Complexity: O(nk)
    Space Complexity: O(n + k)
    
    Radix Sort is a non-comparative sorting algorithm. It avoids comparison by
    creating and distributing elements into buckets according to their radix.
    For elements with more than one significant digit, this bucketing process
    is repeated for each digit, while preserving the ordering of the prior step,
    until all digits have been considered.
    
    Args:
        arr (list): The array to sort
        
    Returns:
        list: The sorted array
    """
    # Create a copy to avoid modifying the original array
    array = arr.copy()
    
    if not array:
        return array

    # Handle negative numbers by shifting
    min_val = min(array)
    if min_val < 0:
        array = [x - min_val for x in array]
    else:
        min_val = 0

    max_val = max(array)
    exp = 1

    while max_val // exp > 0:
        counting_sort_by_digit(array, exp)
        exp *= 10

    # Shift back if we handled negative numbers
    if min_val < 0:
        array = [x + min_val for x in array]
    
    return array


def counting_sort_by_digit(arr, exp):
    """
    Helper function to perform counting sort on the array according to
    the digit represented by exp.
    """
    n = len(arr)
    output = [0] * n
    count = [0] * 10

    # Store count of occurrences in count[]
    for i in range(n):
        index = (arr[i] // exp) % 10
        count[index] += 1

    # Change count[i] so that count[i] now contains actual
    # position of this digit in output[]
    for i in range(1, 10):
        count[i] += count[i - 1]

    # Build the output array
    # Iterate in reverse to maintain stability
    i = n - 1
    while i >= 0:
        index = (arr[i] // exp) % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
        i -= 1

    # Copy the output array to arr[], so that arr now
    # contains sorted numbers according to current digit
    for i in range(n):
        arr[i] = output[i]


# Example usage and test
if __name__ == "__main__":
    # Test with sample data
    test_array = [170, 45, 75, 90, 802, 24, 2, 66]
    print(f"Original array: {test_array}")
    
    sorted_array = radix_sort(test_array)
    print(f"Sorted array: {sorted_array}")
    
    # Test with edge cases
    print(f"Empty array: {radix_sort([])}")
    print(f"Single element: {radix_sort([42])}")
    print(f"Already sorted: {radix_sort([1, 2, 3, 4, 5])}")
    print(f"Reverse sorted: {radix_sort([5, 4, 3, 2, 1])}")
    print(f"Negative numbers: {radix_sort([-5, -2, 3, -1, 0, 10])}")


