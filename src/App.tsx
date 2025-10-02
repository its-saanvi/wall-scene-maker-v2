import React, { useState, useRef, useEffect } from 'react';
import { SceneProvider, useScene } from './components/SceneProvider';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { EditingToolbar } from './components/EditingToolbar';
import { EditingProvider, useEditing } from './components/EditingProvider';
import { Sidebar } from './components/Sidebar'; // Import Sidebar
import './App.css';

function App() {
  return (
    <EditingProvider>
      <SceneProvider>
        <AppContent />
      </SceneProvider>
    </EditingProvider>
  );
}

const AppContent: React.FC = () => {
  const { originalCanvasSize, displayCanvasSize, backgroundImage } = useScene();
  const { isEditing } = useEditing();
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current) {
        const scaleX = displayCanvasSize.width / originalCanvasSize.width;
        const scaleY = displayCanvasSize.height / originalCanvasSize.height;
        setScale(Math.min(scaleX, scaleY));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [originalCanvasSize, displayCanvasSize]);

  return (
    <div style={{ display: 'grid', gridTemplateRows: '60px 1fr', height: '100vh', width: '100vw', margin: 0, padding: 0 }}>
      <Toolbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <div ref={canvasContainerRef} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
          <div
            style={{
              position: 'relative',
              width: originalCanvasSize.width,
              height: originalCanvasSize.height,
              border: backgroundImage ? 'none' : '1px solid #414868', // Conditional border
              transform: `scale(${scale})`,
              transformOrigin: 'center top',
              marginTop: '10px',
            }}
          >
            <Canvas scale={scale} />
          </div>
        </div>
      </div>
      {isEditing && <EditingToolbar />}
    </div>
  );
};

export default App;
