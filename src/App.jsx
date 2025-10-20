import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArrayVisualizer from './components/ArrayVisualizer';
import GridVisualizer from './components/GridVisualizer';
import ControlPanel from './components/ControlPanel';
import SettingsPanel from './components/SettingsPanel';
import FloatingActionButton from './components/FloatingActionButton';
import PythonCodePanel from './components/PythonCodePanel';
import { useVisualization } from './hooks/useVisualization';
import { usePathfindingVisualization } from './hooks/usePathfindingVisualization';
import { generateRandomArray } from './utils/arrayHelpers';
import { createEmptyGrid } from './utils/gridHelpers';
import { algorithms } from './algorithms';
import { pathfindingAlgorithms } from './algorithms/pathfinding';
import {
  DEFAULT_ARRAY_SIZE,
  DEFAULT_GRID_SIZE,
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
  ALGORITHM_TYPES,
} from './constants';

function App() {
  const [algorithmType, setAlgorithmType] = useState(ALGORITHM_TYPES.SORTING);
  const [arraySize, setArraySize] = useState(DEFAULT_ARRAY_SIZE);
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [array, setArray] = useState(() =>
    generateRandomArray(DEFAULT_ARRAY_SIZE)
  );
  const [speed, setSpeed] = useState(ANIMATION_SPEEDS.MEDIUM);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [selectedPathfindingAlgorithm, setSelectedPathfindingAlgorithm] =
    useState('bfs');
  const [mode, setMode] = useState(VISUALIZATION_MODES.AUTOPLAY);
  const [isPythonPanelOpen, setIsPythonPanelOpen] = useState(false);

  const sortingVisualization = useVisualization(array, speed, mode);
  const pathfindingVisualization = usePathfindingVisualization(
    gridSize,
    speed,
    mode
  );

  const visualization =
    algorithmType === ALGORITHM_TYPES.SORTING
      ? sortingVisualization
      : pathfindingVisualization;
  const handleGenerateArray = () => {
    if (algorithmType === ALGORITHM_TYPES.SORTING) {
      const newArray = generateRandomArray(arraySize);
      setArray(newArray);
    } else {
      pathfindingVisualization.generateNewGrid();
    }
  };
  const handleAlgorithmChange = algorithmName => {
    if (algorithmType === ALGORITHM_TYPES.SORTING) {
      setSelectedAlgorithm(algorithmName);
      sortingVisualization.reset();
    } else {
      setSelectedPathfindingAlgorithm(algorithmName);
      pathfindingVisualization.reset();
    }
  };
  const handleArraySizeChange = newSize => {
    setArraySize(newSize);
    const newArray = generateRandomArray(newSize);
    setArray(newArray);
  };

  const handleGridSizeChange = newSize => {
    setGridSize(newSize);
  };

  const handleAlgorithmTypeChange = newType => {
    setAlgorithmType(newType);
    // Reset visualizations when switching types
    if (newType === ALGORITHM_TYPES.SORTING) {
      sortingVisualization.reset();
    } else {
      pathfindingVisualization.reset();
    }
  };
  useEffect(() => {
    if (algorithmType === ALGORITHM_TYPES.SORTING) {
      const algorithmFunction = algorithms[selectedAlgorithm];
      if (algorithmFunction) {
        const steps = algorithmFunction(array);
        sortingVisualization.loadSteps(steps);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgorithm, array, algorithmType]);

  useEffect(() => {
    if (
      algorithmType === ALGORITHM_TYPES.PATHFINDING &&
      pathfindingVisualization.start &&
      pathfindingVisualization.end
    ) {
      const algorithmFunction =
        pathfindingAlgorithms[selectedPathfindingAlgorithm];
      if (algorithmFunction) {
        const grid = createEmptyGrid(gridSize, gridSize);
        const steps = algorithmFunction(
          grid,
          pathfindingVisualization.start,
          pathfindingVisualization.end,
          gridSize,
          gridSize
        );
        pathfindingVisualization.loadSteps(steps);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPathfindingAlgorithm,
    algorithmType,
    pathfindingVisualization.start,
    pathfindingVisualization.end,
    gridSize,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <SettingsPanel
                algorithmType={algorithmType}
                onAlgorithmTypeChange={handleAlgorithmTypeChange}
                selectedAlgorithm={
                  algorithmType === ALGORITHM_TYPES.SORTING
                    ? selectedAlgorithm
                    : selectedPathfindingAlgorithm
                }
                onAlgorithmChange={handleAlgorithmChange}
                speed={speed}
                onSpeedChange={setSpeed}
                arraySize={arraySize}
                onArraySizeChange={handleArraySizeChange}
                gridSize={gridSize}
                onGridSizeChange={handleGridSizeChange}
                onGenerateArray={handleGenerateArray}
                isPlaying={visualization.isPlaying}
                mode={mode}
                onModeChange={setMode}
              />
            </div>

            {/* Visualization Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Visualizer */}
              <div className="h-[500px]">
                {algorithmType === ALGORITHM_TYPES.SORTING ? (
                  <ArrayVisualizer
                    array={sortingVisualization.array}
                    states={sortingVisualization.states}
                    description={sortingVisualization.description}
                    isComplete={sortingVisualization.isComplete}
                    algorithm={selectedAlgorithm}
                  />
                ) : (
                  <GridVisualizer
                    states={pathfindingVisualization.states}
                    description={pathfindingVisualization.description}
                    isComplete={pathfindingVisualization.isComplete}
                    algorithm={selectedPathfindingAlgorithm}
                    gridSize={gridSize}
                  />
                )}
              </div>

              {/* Control Panel */}
              <ControlPanel
                isPlaying={visualization.isPlaying}
                isComplete={visualization.isComplete}
                isAutoplayActive={visualization.isAutoplayActive}
                mode={mode}
                onPlay={visualization.play}
                onPause={visualization.pause}
                onReset={visualization.reset}
                onStepForward={visualization.stepForward}
                onStepBackward={visualization.stepBackward}
                currentStep={visualization.currentStep}
                totalSteps={visualization.totalSteps}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Floating Action Button - Only show when panel is closed */}
      {!isPythonPanelOpen && (
        <FloatingActionButton
          onClick={() => setIsPythonPanelOpen(true)}
          disabled={!selectedAlgorithm}
        />
      )}

      {/* Python Code Panel */}
      <PythonCodePanel
        isOpen={isPythonPanelOpen}
        onClose={() => setIsPythonPanelOpen(false)}
        algorithm={
          algorithmType === ALGORITHM_TYPES.SORTING
            ? selectedAlgorithm
            : selectedPathfindingAlgorithm
        }
      />
    </div>
  );
}

export default App;
