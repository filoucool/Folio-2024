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
  const { camera, clock } = useThree();
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  const speed = 0.05;
  const playerHeight = 1.8; // Adjust for desired camera height
  const bobbingSpeed = 12; // Adjust for desired bobbing speed
  const bobbingAmount = 0.08; // Adjust for desired bobbing amount

  useEffect(() => {
    camera.position.y = playerHeight; // Set initial camera height
  }, [camera.position.y]); // Depend on camera.position.y to avoid resetting it unnecessarily

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
    const flatDirection = new THREE.Vector3();
    const sideVector = new THREE.Vector3();
    const upVector = new THREE.Vector3(0, 1, 0);

    camera.getWorldDirection(direction);
    flatDirection.set(direction.x, 0, direction.z).normalize(); // Remove vertical component
    sideVector.crossVectors(upVector, flatDirection).normalize(); // Adjust side vector for flat movement

    if (movement.forward) camera.position.addScaledVector(flatDirection, speed);
    if (movement.backward) camera.position.addScaledVector(flatDirection, -speed);
    if (movement.left) camera.position.addScaledVector(sideVector, speed);
    if (movement.right) camera.position.addScaledVector(sideVector, -speed);

    // Head bobbing effect
    if (movement.forward || movement.backward || movement.left || movement.right) {
      const time = clock.getElapsedTime();
      camera.position.y = playerHeight + Math.sin(time * bobbingSpeed) * bobbingAmount;
    } else {
      // Reset camera height if not moving
      camera.position.y = playerHeight;
    }
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
