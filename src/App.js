import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from '@react-three/drei'; // If you're okay with OrbitControls for now
import { createRoot } from 'react-dom/client';
import { PointerLockControls } from '@react-three/drei';

function App() {
  return (
    <div id="canvas-container">
    <Canvas>
      <ambientLight intensity={0.1} />
      <directionalLight color="blue" position={[1, 10, 15]} />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
      </mesh>
    </Canvas>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)

export default App;
