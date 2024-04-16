import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Plane, PointerLockControls, Html, Environment } from '@react-three/drei';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { createRoot } from 'react-dom/client';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import AxisTriad from './dev_tools';

function Model({ modelPath, position }) {
  const glb = useLoader(GLTFLoader, modelPath);
  return (
    <primitive object={glb.scene} position={position} />
  );
}

function TexturedFloor({ texturePath }) {
  const texture = useLoader(TextureLoader, texturePath);
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -3.51, 0],
    static: true,
  }));

  return (
    <mesh ref={ref}>
      <planeGeometry attach="geometry" args={[60, 60]} />
      <meshStandardMaterial attach="material" map={texture} />
    </mesh>
  );
}

function FallingCube() {
  const [ref] = useBox(() => ({
    mass: 1,
    position: [0, 5, 0], 
  }));

  return (
    <mesh ref={ref}>
      <boxGeometry  attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" color="blue" />
    </mesh>
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

function OverlayControl() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  useEffect(() => {
    const toggleOverlay = (event) => {
      if (event.key.toLowerCase() === 'm') {
        setIsOverlayVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', toggleOverlay);
    return () => {
      window.removeEventListener('keydown', toggleOverlay);
    };
  }, []);

  if (!isOverlayVisible) {
    return null;
  }

  return (
    <div id="overlay" style={{ display: isOverlayVisible ? 'block' : 'none' }}>
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        zIndex: 1000 
      }}>
      <img src="/media/Images/wasd-eye.png" alt="WASD controls" style={{
        position: "absolute",
        left: "-40vw",
        top: "10vh",
        maxHeight: "25vh",
        maxWidth: "25vw",
      }}/>
        <p style={{
          position: "absolute",
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: "10px 10px",
          borderRadius: "10px",
          left: "-42vw",
          textAlign: "center"
        }}>
          Use WASD to move around and the mouse to look around.
          <span style={{display: "block"}}>Press escape to leave the 3D environment.</span>
        </p>
        <p style={{
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: "10px 10px",
          borderRadius: "10px",
          textAlign: "center"
        }}>
          Welcome to my portfolio!
          <span style={{display: "block"}}>Press 'M' to show/hide the overlay.</span>
        </p>
      </div>
    </div>
  );
}

function WelcomeScreen({ onStart }) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Welcome to My Portfolio!</h1>
        <button onClick={onStart} style={{ padding: '10px 20px', fontSize: '20px', cursor: 'pointer' }}>Enter</button>
      </div>
    </div>
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
