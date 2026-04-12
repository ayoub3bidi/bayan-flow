def binary_search(arr, target):
    """
    Binary Search Algorithm
    Time Complexity: O(log n) average and worst case
    Space Complexity: O(1)

    Requires a sorted array (ascending). Repeatedly compares the target
    with the middle element and discards half of the remaining range until
    the target is found or the range is empty.

    Args:
        arr (list): Sorted list of comparable elements (ascending order)
        target: Value to find

    Returns:
        int: Index of target if present, otherwise -1
    """
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1


# Example usage and test
if __name__ == "__main__":
    data = [3, 7, 11, 15, 19, 25, 31]
    for t in (15, 3, 31, 10):
        idx = binary_search(data, t)
        print(f"binary_search({data}, {t}) -> {idx}")
