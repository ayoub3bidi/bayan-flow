export default `def merge_sort(arr):
    """
    Merge Sort Algorithm
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if len(arr) <= 1:
        return arr.copy()
    
    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]
    
    left_sorted = merge_sort(left_half)
    right_sorted = merge_sort(right_half)
    
    return merge(left_sorted, right_sorted)

def merge(left, right):
    result = []
    left_index = 0
    right_index = 0
    
    while left_index < len(left) and right_index < len(right):
        if left[left_index] <= right[right_index]:
            result.append(left[left_index])
            left_index += 1
        else:
            result.append(right[right_index])
            right_index += 1
    
    while left_index < len(left):
        result.append(left[left_index])
        left_index += 1
    
    while right_index < len(right):
        result.append(right[right_index])
        right_index += 1
    
    return result`;
