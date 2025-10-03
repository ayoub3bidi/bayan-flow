/**
 * Generates a random array of specified size with values between min and max
 * @param {number} size - The size of the array to generate
 * @param {number} min - Minimum value (default: 5)
 * @param {number} max - Maximum value (default: 500)
 * @returns {number[]} - Random array
 */
export const generateRandomArray = (size, min = 5, max = 500) => {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (max - min + 1) + min)
  );
};

/**
 * Generates a nearly sorted array (useful for testing)
 * @param {number} size - The size of the array
 * @param {number} swaps - Number of random swaps to perform
 * @returns {number[]} - Nearly sorted array
 */
export const generateNearlySortedArray = (size, swaps = 5) => {
  const arr = Array.from({ length: size }, (_, i) => (i + 1) * 10);
  for (let i = 0; i < swaps; i++) {
    const idx1 = Math.floor(Math.random() * size);
    const idx2 = Math.floor(Math.random() * size);
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
  }
  return arr;
};

/**
 * Generates a reversed array
 * @param {number} size - The size of the array
 * @returns {number[]} - Reversed array
 */
export const generateReversedArray = size => {
  return Array.from({ length: size }, (_, i) => (size - i) * 10);
};

/**
 * Checks if an array is sorted
 * @param {number[]} arr - Array to check
 * @returns {boolean} - True if sorted, false otherwise
 */
export const isSorted = arr => {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) {
      return false;
    }
  }
  return true;
};

/**
 * Deep clones an array
 * @param {Array} arr - Array to clone
 * @returns {Array} - Cloned array
 */
export const cloneArray = arr => {
  return JSON.parse(JSON.stringify(arr));
};

/**
 * Delays execution for animation purposes
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} - Promise that resolves after delay
 */
export const delay = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
