import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Plane } from '@react-three/drei';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { createRoot } from 'react-dom/client';
import AxisTriad from './AxisTriad';

function Model({ modelPath }) {
  const glb = useLoader(GLTFLoader, modelPath);
  return <primitive object={glb.scene} />;
}

function RestrictedZone() {
  // Assuming a simple rectangular zone for demonstration
  const position = [-1, -3.50, 0]; // Slightly above the ground to be visible
  const args = [6, 4]; // Size of the zone
  return (
    <Plane args={args} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Applying color through the material */}
      <meshStandardMaterial attach="material" color="red" />
    </Plane>
  );
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
  const [isOutside, setIsOutside] = useState(true);

  // Define the restricted zone's bounds
  const zoneBounds = {
    minX: -4,
    maxX: 2.5,
    minZ: -2,
    maxZ: 2,
  };

  useEffect(() => {
    camera.position.y = playerHeight;
  }, [camera.position.y, playerHeight]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'shift') {
        setIsRunning(true);
      } else {
        setMovement((m) => ({ ...m, [keyMap[key]]: true }));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
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

    // Calculate new position without applying it directly
    let newPosition = camera.position.clone();
    if (movement.forward) newPosition.addScaledVector(flatDirection, speed);
    if (movement.backward) newPosition.addScaledVector(flatDirection, -speed);
    if (movement.left) newPosition.addScaledVector(sideVector, speed);
    if (movement.right) newPosition.addScaledVector(sideVector, -speed);

    // Check if the new position is outside the restricted zone
    const isEnteringRestrictedZone = newPosition.x > zoneBounds.minX && newPosition.x < zoneBounds.maxX && newPosition.z > zoneBounds.minZ && newPosition.z < zoneBounds.maxZ;

    if (!isEnteringRestrictedZone || isOutside) {
      // Apply movement if not entering the restricted zone or already outside
      camera.position.copy(newPosition);
    }

    // Head bobbing effect
    if (movement.forward || movement.backward || movement.left || movement.right) {
      const time = clock.getElapsedTime();
      camera.position.y = playerHeight + Math.sin(time * bobbingSpeed) * bobbingAmount;
    } else {
      camera.position.y = playerHeight;
    }

    // Update the outside status based on the player's current position
    setIsOutside(!isEnteringRestrictedZone);
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
        <RestrictedZone />
        <AxisTriad size={4} />
      </Canvas>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

export default App;
