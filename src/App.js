import React, { Suspense, useState, useEffect, useRef } from 'react';
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
  const { camera, clock } = useThree();
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  const [isRunning, setIsRunning] = useState(false);
  const walkSpeed = 0.05;
  const runSpeed = 0.1;
  const playerHeight = 1.8;
  const bobbingSpeed = 12;
  const bobbingAmount = 0.08;

  useEffect(() => {
    camera.position.y = playerHeight;
  }, [camera.position.y]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase(); // Normalize key value to lowercase
      if (key === 'shift') {
        setIsRunning(true);
      } else {
        setMovement((m) => ({ ...m, [keyMap[key]]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase(); // Normalize key value to lowercase
      if (key === 'shift') {
        setIsRunning(false);
      } else {
        setMovement((m) => ({ ...m, [keyMap[key]]: false }));
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
    const flatDirection = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const upVector = new THREE.Vector3(0, 1, 0);
    camera.getWorldDirection(direction);
    flatDirection.set(direction.x, 0, direction.z).normalize();
    sideVector.crossVectors(upVector, flatDirection).normalize();

    const speed = isRunning ? runSpeed : walkSpeed;

    if (movement.forward) camera.position.addScaledVector(flatDirection, speed);
    if (movement.backward) camera.position.addScaledVector(flatDirection, -speed);
    if (movement.left) camera.position.addScaledVector(sideVector, speed);
    if (movement.right) camera.position.addScaledVector(sideVector, -speed);

    if (movement.forward || movement.backward || movement.left || movement.right) {
      const time = clock.getElapsedTime();
      camera.position.y = playerHeight + Math.sin(time * bobbingSpeed) * bobbingAmount;
    } else {
      camera.position.y = playerHeight;
    }
  });

  return null;
}

// Mapping keys to movement directions
const keyMap = {
  'w': 'forward',
  's': 'backward',
  'a': 'left',
  'd': 'right'
};

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
