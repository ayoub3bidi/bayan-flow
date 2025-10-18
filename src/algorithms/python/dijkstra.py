import heapq

def dijkstra(grid, start, end):
    """
    Dijkstra's Algorithm for Pathfinding
    Time Complexity: O((V + E) log V) where V is vertices and E is edges
    Space Complexity: O(V)
    
    Dijkstra's algorithm finds the shortest path between nodes in a weighted graph.
    It uses a priority queue to always explore the most promising node first.
    
    Args:
        grid (list): 2D grid representing the map (0 = walkable, 1 = wall)
        start (tuple): Starting position (row, col)
        end (tuple): Target position (row, col)
        
    Returns:
        list: Path from start to end as list of (row, col) tuples, or None if no path exists
    """
    rows, cols = len(grid), len(grid[0])
    
    # Priority queue: stores (distance, row, col)
    pq = [(0, start[0], start[1])]
    
    # Dictionary to store the shortest distance to each cell
    distances = {start: 0}
    
    # Dictionary to reconstruct the path
    came_from = {}
    
    # Directions: up, down, left, right
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while pq:
        current_dist, row, col = heapq.heappop(pq)
        
        # If we reached the end, reconstruct the path
        if (row, col) == end:
            path = []
            current = end
            while current in came_from:
                path.append(current)
                current = came_from[current]
            path.append(start)
            return path[::-1]  # Reverse to get start -> end
        
        # Skip if we've already found a better path to this cell
        if current_dist > distances.get((row, col), float('inf')):
            continue
        
        # Explore all 4 directions
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            
            # Check if the new position is valid
            if (0 <= new_row < rows and 
                0 <= new_col < cols and 
                grid[new_row][new_col] == 0):
                
                # In an unweighted grid, each step costs 1
                new_dist = current_dist + 1
                
                # If we found a shorter path to this cell
                if new_dist < distances.get((new_row, new_col), float('inf')):
                    distances[(new_row, new_col)] = new_dist
                    came_from[(new_row, new_col)] = (row, col)
                    heapq.heappush(pq, (new_dist, new_row, new_col))
    
    # No path found
    return None


# Example usage and test
if __name__ == "__main__":
    # Create a sample grid (0 = walkable, 1 = wall)
    test_grid = [
        [0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 1, 1, 0],
        [0, 0, 0, 0, 0]
    ]
    
    start_pos = (0, 0)
    end_pos = (4, 4)
    
    print(f"Grid size: {len(test_grid)}x{len(test_grid[0])}")
    print(f"Start: {start_pos}, End: {end_pos}")
    
    path = dijkstra(test_grid, start_pos, end_pos)
    
    if path:
        print(f"Path found with {len(path)} steps:")
        print(f"Path: {path}")
        print(f"Total distance: {len(path) - 1}")
    else:
        print("No path found!")
    
    # Test with weighted grid (if you want to extend it)
    print("\nNote: This implementation treats all cells as equal weight (1).")
    print("For weighted grids, modify the grid to store weights instead of 0/1.")
