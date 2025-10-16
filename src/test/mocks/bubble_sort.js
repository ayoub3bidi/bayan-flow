export default `def bubble_sort(arr):
    """
    Bubble Sort Algorithm
    Time Complexity: O(n²)
    Space Complexity: O(1)
    """
    array = arr.copy()
    n = len(array)
    
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if array[j] > array[j + 1]:
                array[j], array[j + 1] = array[j + 1], array[j]
                swapped = True
        if not swapped:
            break
    
    return array`;
