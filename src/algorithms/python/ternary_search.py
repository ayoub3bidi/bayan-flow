def ternary_search(arr, target):
    """
    Ternary Search Algorithm (sorted array)
    Time Complexity: O(log n) average and worst case
    Space Complexity: O(1)

    Requires a sorted array (ascending). Each iteration compares the target
    with elements at two indices that partition the current range into three
    parts, then discards at least one third of the range.

    Args:
        arr (list): Sorted list of comparable elements (ascending order)
        target: Value to find

    Returns:
        int: Index of target if present, otherwise -1
    """
    left = 0
    right = len(arr) - 1

    while left <= right:
        third = (right - left) // 3
        mid1 = left + third
        mid2 = right - third
        if arr[mid1] == target:
            return mid1
        if arr[mid2] == target:
            return mid2
        if target < arr[mid1]:
            right = mid1 - 1
        elif target > arr[mid2]:
            left = mid2 + 1
        else:
            left = mid1 + 1
            right = mid2 - 1

    return -1


# Example usage and test
if __name__ == "__main__":
    data = [3, 7, 11, 15, 19, 25, 31]
    for t in (15, 3, 31, 10):
        idx = ternary_search(data, t)
        print(f"ternary_search({data}, {t}) -> {idx}")
