import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
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
      switch (e.key) {
        case 'w': setMovement(m => ({ ...m, forward: true })); break;
        case 's': setMovement(m => ({ ...m, backward: true })); break;
        case 'a': setMovement(m => ({ ...m, left: true })); break;
        case 'd': setMovement(m => ({ ...m, right: true })); break;
        default: break;
      }
    };
    const handleKeyUp = (e) => {
      switch (e.key) {
        case 'w': setMovement(m => ({ ...m, forward: false })); break;
        case 's': setMovement(m => ({ ...m, backward: false })); break;
        case 'a': setMovement(m => ({ ...m, left: false })); break;
        case 'd': setMovement(m => ({ ...m, right: false })); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    const direction = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const upVector = new THREE.Vector3(0, 1, 0);

    camera.getWorldDirection(direction);
    direction.normalize();
    sideVector.crossVectors(upVector, direction).normalize();

    if (movement.forward) camera.position.addScaledVector(direction, speed);
    if (movement.backward) camera.position.addScaledVector(direction, -speed);
    if (movement.left) camera.position.addScaledVector(sideVector, speed);
    if (movement.right) camera.position.addScaledVector(sideVector, -speed);
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
