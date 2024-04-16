import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Plane, PointerLockControls, Html, Environment } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { createRoot } from 'react-dom/client';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import AxisTriad from './Dev/dev_tools';
import OverlayControl from './Components/OverlayControl';
import WelcomeScreen from './Components/WelcomeScreen';
import FallingCube from './Dev/Falling_Cube';
import TexturedFloor from './Components/TexturedFloor';

function Model({ modelPath, position }) {
  const glb = useLoader(GLTFLoader, modelPath);
  return (
    <primitive object={glb.scene} position={position} />
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
  const walkSpeed = 0.12;
  const runSpeed = 0.2;
  const playerHeight = 1.8;
  const bobbingSpeed = 12;
  const bobbingAmount = 0.09;
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    camera.position.y = playerHeight;
  },);

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
    let movementVector = new THREE.Vector3();

    // Calculate new position without applying it directly
    if (movement.forward) movementVector.add(flatDirection);
    if (movement.backward) movementVector.sub(flatDirection);
    if (movement.left) movementVector.add(sideVector);
    if (movement.right) movementVector.sub(sideVector);

    movementVector.normalize().multiplyScalar(speed);  // Normalize and apply speed

    let newPosition = camera.position.clone().add(movementVector);

    // Head bobbing effect
    camera.position.copy(newPosition);
    camera.position.y = isMoving ? playerHeight + Math.sin(clock.getElapsedTime() * bobbingSpeed) * bobbingAmount : playerHeight;
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

function CameraPositionDisplay() {
  const { camera } = useThree();
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    setPosition({
      x: camera.position.x.toFixed(2),
      y: camera.position.y.toFixed(2),
      z: camera.position.z.toFixed(2)
    });
  });

  return (
    <Html position={[0, 0, 0]} transform occlude>
      <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '8px', borderRadius: '5px' }}>
        x: {position.x}, y: {position.y}, z: {position.z}
      </div>
    </Html>
  );
}

function App() {
  const modelPath = '/media/3DModels/maker_desk.glb';
  const floorTexturePath = '/media/textures/garage_floor.jpg';
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  const startApp = () => {
    setShowWelcomeScreen(false);
  };

  if (showWelcomeScreen) {
    return <WelcomeScreen onStart={startApp} />;
  }

  return (
    <div>
      <OverlayControl />
      <div id="canvas-container" style={{ height: '100vh', width: '100vw' }}>
        <Canvas>
          <Physics>
            <ambientLight intensity={0.1} />
            <directionalLight color="white" position={[1, 10, 15]} />
            <Suspense fallback={null}>
              <Environment background={true} files="/media/textures/concrete_wall.jpg" />
              <Model modelPath={modelPath} position={[1, 0, -2]} />
            </Suspense>
            <PointerLockControls />
            <MoveControls />
            <AxisTriad size={4} />
            <CameraPositionDisplay />
            <TexturedFloor texturePath={floorTexturePath} />
            <FallingCube />
          </Physics>
        </Canvas>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

export default App;
