import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useLoader, useThree, useFrame  } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from '@react-three/drei';
import { createRoot } from 'react-dom/client';

function Model({ modelPath }) {
  const glb = useLoader(GLTFLoader, modelPath);
  return <primitive object={glb.scene} />;
}

function MoveControls() {
  const { camera } = useThree();
  const [movement, setMovement] = useState({ forward: false, backward: false, left: false, right: false });
  const speed = 0.05;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'w') setMovement(m => ({ ...m, forward: true }));
      if (e.key === 's') setMovement(m => ({ ...m, backward: true }));
      if (e.key === 'a') setMovement(m => ({ ...m, left: true }));
      if (e.key === 'd') setMovement(m => ({ ...m, right: true }));
    };
    const handleKeyUp = (e) => {
      if (e.key === 'w') setMovement(m => ({ ...m, forward: false }));
      if (e.key === 's') setMovement(m => ({ ...m, backward: false }));
      if (e.key === 'a') setMovement(m => ({ ...m, left: false }));
      if (e.key === 'd') setMovement(m => ({ ...m, right: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (movement.forward) camera.position.z -= speed;
    if (movement.backward) camera.position.z += speed;
    if (movement.left) camera.position.x -= speed;
    if (movement.right) camera.position.x += speed;
  });

  return null;
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
        <MoveControls />
      </Canvas>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

export default App;
