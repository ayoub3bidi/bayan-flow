from collections import deque

def bfs(grid, start, end):
    """
    Breadth-First Search (BFS) Pathfinding Algorithm
    Time Complexity: O(V + E) where V is vertices and E is edges
    Space Complexity: O(V)
    
    BFS explores all neighbor nodes at the present depth before moving to nodes
    at the next depth level. It guarantees the shortest path in unweighted graphs.
    
    Args:
        grid (list): 2D grid representing the map (0 = walkable, 1 = wall)
        start (tuple): Starting position (row, col)
        end (tuple): Target position (row, col)
        
    Returns:
        list: Path from start to end as list of (row, col) tuples, or None if no path exists
    """
    rows, cols = len(grid), len(grid[0])
    
    # Queue for BFS: stores (row, col, path)
    queue = deque([(start[0], start[1], [start])])
    
    # Set to track visited cells
    visited = {start}
    
    # Directions: up, down, left, right
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    
    while queue:
        row, col, path = queue.popleft()
        
        # Check if we reached the end
        if (row, col) == end:
            return path
        
        # Explore all 4 directions
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            
            # Check if the new position is valid
            if (0 <= new_row < rows and 
                0 <= new_col < cols and 
                grid[new_row][new_col] == 0 and 
                (new_row, new_col) not in visited):
                
                visited.add((new_row, new_col))
                new_path = path + [(new_row, new_col)]
                queue.append((new_row, new_col, new_path))
    
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
    
    path = bfs(test_grid, start_pos, end_pos)
    
    if path:
        print(f"Path found with {len(path)} steps:")
        print(f"Path: {path}")
    else:
        print("No path found!")
    
    # Test with no path (blocked)
    blocked_grid = [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ]
    
    no_path = bfs(blocked_grid, (0, 1), (2, 1))
    print(f"\nBlocked grid result: {no_path}")
