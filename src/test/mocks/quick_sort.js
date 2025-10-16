export default `def quick_sort(arr):
    """
    Quick Sort Algorithm
    Time Complexity: O(n log n) average, O(n²) worst case
    Space Complexity: O(log n)
    """
    array = arr.copy()
    
    def _quick_sort_helper(low, high):
        if low < high:
            pivot_index = partition(low, high)
            _quick_sort_helper(low, pivot_index - 1)
            _quick_sort_helper(pivot_index + 1, high)
    
    def partition(low, high):
        pivot = array[high]
        i = low - 1
        
        for j in range(low, high):
            if array[j] <= pivot:
                i += 1
                array[i], array[j] = array[j], array[i]
        
        array[i + 1], array[high] = array[high], array[i + 1]
        return i + 1
    
    _quick_sort_helper(0, len(array) - 1)
    return array`;
