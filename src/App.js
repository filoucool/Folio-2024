import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Plane, PointerLockControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { createRoot } from 'react-dom/client';
import AxisTriad from './AxisTriad';

function Model({ modelPath }) {
  const glb = useLoader(GLTFLoader, modelPath);
  return <primitive object={glb.scene} />;
}

function RestrictedZone() {
  const position = [-1, -3.50, 0];
  const args = [6, 4];
  return (
    <Plane args={args} position={position} rotation={[-Math.PI / 2, 0, 0]}>
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
  const [isMoving, setIsMoving] = useState(false);

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
      } else if (keyMap[key]) {
        setMovement(prevMovement => {
          const updatedMovement = { ...prevMovement, [keyMap[key]]: true };
          setIsMoving(Object.values(updatedMovement).some(value => value));
          return updatedMovement;
        });
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (key === 'shift') {
        setIsRunning(false);
      } else if (keyMap[key]) {
        setMovement(prevMovement => {
          const updatedMovement = { ...prevMovement, [keyMap[key]]: false };
          setIsMoving(Object.values(updatedMovement).some(value => value));
          return updatedMovement;
        });
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

    // Head bobbing effect
    if (!isPositionInRestrictedZone(newPosition)) {
      camera.position.copy(newPosition);
      camera.position.y = isMoving ? playerHeight + Math.sin(clock.getElapsedTime() * bobbingSpeed) * bobbingAmount : playerHeight;
    }
  });

  // Check if the new position is in the restricted zone
  function isPositionInRestrictedZone(position) {
    return position.x > zoneBounds.minX && position.x < zoneBounds.maxX &&
           position.z > zoneBounds.minZ && position.z < zoneBounds.maxZ;
  }

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
