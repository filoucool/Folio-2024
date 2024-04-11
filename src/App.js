import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei';
import { createRoot } from 'react-dom/client';
import { PointerLockControls } from '@react-three/drei';

function Model({ modelPath }) {
  const glb = useLoader(GLTFLoader, modelPath);
  return <primitive object={glb.scene} />;
}

function App() {
  const modelPath = '/media/3DModels/maker_desk.glb';

  return (
    <div id="canvas-container" style={{ height: '100vh', width: '100vw' }}>
      <Canvas>
        <ambientLight intensity={0.1} />
        <directionalLight color="white" position={[1, 10, 15]} />
        <Suspense fallback={null}>
          <Model modelPath={modelPath} />
        </Suspense>
        <PointerLockControls />
      </Canvas>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)

export default App;
