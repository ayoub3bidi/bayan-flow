def fibonacci_search(arr, target):
    """
    Fibonacci Search Algorithm
    Time Complexity: O(log n) average and worst case
    Space Complexity: O(1)

    Requires a sorted array (ascending). Probes use Fibonacci-number offsets
    from the current window start (no division in the loop).

    Args:
        arr (list): Sorted list of comparable elements (ascending order)
        target: Value to find

    Returns:
        int: Index of target if present, otherwise -1
    """
    n = len(arr)
    if n == 0:
        return -1

    fib_m2 = 0
    fib_m1 = 1
    fib_m = fib_m1 + fib_m2
    while fib_m < n + 1:
        fib_m2 = fib_m1
        fib_m1 = fib_m
        fib_m = fib_m2 + fib_m1

    offset = 0

    while fib_m > 1:
        if offset >= n:
            return -1
        i = min(offset + fib_m2, n - 1)
        val = arr[i]
        if val < target:
            offset = i + 1
            fib_m = fib_m1
            fib_m1 = fib_m2
            fib_m2 = fib_m - fib_m1
        elif val > target:
            fib_m = fib_m2
            fib_m1 = fib_m1 - fib_m2
            fib_m2 = fib_m - fib_m1
        else:
            return i

    if offset < n and arr[offset] == target:
        return offset
    return -1


# Example usage and test
if __name__ == "__main__":
    data = [1, 3, 5, 7, 9, 11, 13]
    for t in (7, 1, 13, 4):
        idx = fibonacci_search(data, t)
        print(f"fibonacci_search({data}, {t}) -> {idx}")
