import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ArrayVisualizer from './components/ArrayVisualizer';
import ControlPanel from './components/ControlPanel';
import SettingsPanel from './components/SettingsPanel';
import { useVisualization } from './hooks/useVisualization';
import { generateRandomArray } from './utils/arrayHelpers';
import { algorithms } from './algorithms';
import {
  DEFAULT_ARRAY_SIZE,
  ANIMATION_SPEEDS,
  VISUALIZATION_MODES,
} from './constants';

function App() {
  const [arraySize, setArraySize] = useState(DEFAULT_ARRAY_SIZE);
  const [array, setArray] = useState(() =>
    generateRandomArray(DEFAULT_ARRAY_SIZE)
  );
  const [speed, setSpeed] = useState(ANIMATION_SPEEDS.MEDIUM);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [mode, setMode] = useState(VISUALIZATION_MODES.AUTOPLAY);
  const visualization = useVisualization(array, speed, mode);
  const handleGenerateArray = () => {
    const newArray = generateRandomArray(arraySize);
    setArray(newArray);
  };
  const handleAlgorithmChange = algorithmName => {
    setSelectedAlgorithm(algorithmName);
    visualization.reset();
  };
  const handleArraySizeChange = newSize => {
    setArraySize(newSize);
    const newArray = generateRandomArray(newSize);
    setArray(newArray);
  };
  useEffect(() => {
    const algorithmFunction = algorithms[selectedAlgorithm];
    if (algorithmFunction) {
      const steps = algorithmFunction(array);
      visualization.loadSteps(steps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAlgorithm, array]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header repoOwner="ayoub3bidi" repoName="algorithm-visualizer" />
      <main className="flex-1 pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Panel */}
            <div className="lg:col-span-1">
              <SettingsPanel
                selectedAlgorithm={selectedAlgorithm}
                onAlgorithmChange={handleAlgorithmChange}
                speed={speed}
                onSpeedChange={setSpeed}
                arraySize={arraySize}
                onArraySizeChange={handleArraySizeChange}
                onGenerateArray={handleGenerateArray}
                isPlaying={visualization.isPlaying}
                mode={mode}
                onModeChange={setMode}
              />
            </div>

            {/* Visualization Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Array Visualizer */}
              <div className="h-[500px]">
                <ArrayVisualizer
                  array={visualization.array}
                  states={visualization.states}
                  description={visualization.description}
                />
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
      <Footer
        repoOwner="ayoub3bidi"
        repoName="algorithm-visualizer"
        version="0.0.0"
        authorName="Ayoub Abidi"
        authorGithub="ayoub3bidi"
      />
    </div>
  );
}

export default App;
