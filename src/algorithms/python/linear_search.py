def linear_search(arr, target):
    """
    Linear Search Algorithm
    Time Complexity: O(n) average and worst case; O(1) best case (target at index 0)
    Space Complexity: O(1)

    Checks each element in order from the start until the target is found or the
    array ends. Does not require sorted input.

    Args:
        arr (list): List of comparable elements (any order)
        target: Value to find

    Returns:
        int: Index of target if present, otherwise -1
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1


# Example usage and test
if __name__ == "__main__":
    data = [2, 4, 6, 8, 10]
    for t in (6, 2, 99):
        idx = linear_search(data, t)
        print(f"linear_search({data}, {t}) -> {idx}")
