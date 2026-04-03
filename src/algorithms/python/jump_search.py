def jump_search(arr, target):
    """
    Jump Search Algorithm
    Time Complexity: O(√n) average and worst case
    Space Complexity: O(1)

    Requires a sorted array (ascending). Jumps in blocks of about √n until
    the block end is at least the target, then scans linearly forward.

    Args:
        arr (list): Sorted list of comparable elements (ascending order)
        target: Value to find

    Returns:
        int: Index of target if present, otherwise -1
    """
    n = len(arr)
    if n == 0:
        return -1

    m = max(1, int(n**0.5))
    prev = 0

    while True:
        jump_idx = min(prev + m - 1, n - 1)
        if arr[jump_idx] >= target:
            break
        prev += m
        if prev >= n:
            return -1

    while arr[prev] < target:
        prev += 1
        if prev >= n:
            return -1

    if arr[prev] == target:
        return prev
    return -1


# Example usage and test
if __name__ == "__main__":
    data = [3, 7, 11, 15, 19, 25, 31]
    for t in (15, 3, 31, 10):
        idx = jump_search(data, t)
        print(f"jump_search({data}, {t}) -> {idx}")
