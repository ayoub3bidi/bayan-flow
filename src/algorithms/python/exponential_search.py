def exponential_search(arr, target):
    """
    Exponential Search Algorithm
    Time Complexity: O(log n) worst case on a finite sorted array; O(log i)
    when the target lies at index i in unbounded models
    Space Complexity: O(1)

    Requires a sorted array (ascending). Doubles an index until the target is
    bracketed or the array ends, then runs binary search on the bracket.

    Args:
        arr (list): Sorted list of comparable elements (ascending order)
        target: Value to find

    Returns:
        int: Index of target if present, otherwise -1
    """
    n = len(arr)
    if n == 0:
        return -1
    if arr[0] == target:
        return 0
    if arr[0] > target:
        return -1

    bound = 1
    while bound < n:
        if arr[bound] == target:
            return bound
        if arr[bound] > target:
            break
        bound *= 2

    left = bound // 2
    right = min(bound, n - 1)

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
    data = [2, 4, 6, 8, 10, 12, 14, 16]
    for t in (14, 2, 16, 7):
        idx = exponential_search(data, t)
        print(f"exponential_search({data}, {t}) -> {idx}")
