def interpolation_search(arr, target):
    """
    Interpolation Search Algorithm
    Average time ~O(log log n) for uniformly distributed keys; worst case O(n).
    Space Complexity: O(1)

    Requires a sorted array (ascending). Estimates the next probe index from
    values at the current bounds (not the midpoint).

    Args:
        arr (list): Sorted list of comparable elements (ascending order)
        target: Value to find

    Returns:
        int: Index of target if present, otherwise -1
    """
    n = len(arr)
    if n == 0:
        return -1

    lo = 0
    hi = n - 1

    while lo <= hi and target >= arr[lo] and target <= arr[hi]:
        if lo == hi:
            return lo if arr[lo] == target else -1
        if arr[hi] == arr[lo]:
            return lo if arr[lo] == target else -1

        pos = lo + (target - arr[lo]) * (hi - lo) // (arr[hi] - arr[lo])
        if pos < lo:
            pos = lo
        elif pos > hi:
            pos = hi

        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            lo = pos + 1
        else:
            hi = pos - 1

    return -1


# Example usage and test
if __name__ == "__main__":
    data = [10, 20, 30, 40, 50]
    for t in (30, 10, 50, 25):
        idx = interpolation_search(data, t)
        print(f"interpolation_search({data}, {t}) -> {idx}")
