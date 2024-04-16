import React, { Suspense, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls, Html, Environment } from '@react-three/drei';
import { useBox, usePlane, Physics, useSphere } from '@react-three/cannon';
import * as THREE from 'three';
import { createRoot } from 'react-dom/client';
import AxisTriad from './Dev/dev_tools';
import OverlayControl from './Components/OverlayControl';
import WelcomeScreen from './Components/WelcomeScreen';
import FallingCube from './Dev/Falling_Cube';
import TexturedFloor from './Components/TexturedFloor';

function Model({ modelPath, position }) {
  const [ref] = useBox(() => ({
    mass: 1,
    position,
  }));
  const glb = useLoader(GLTFLoader, modelPath);
  return <primitive object={glb.scene} ref={ref} />;
}

function GroundPlane() {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0]
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry attach="geometry" args={[100, 100]} />
      <meshStandardMaterial attach="material" color="lightgrey" />
    </mesh>
  );
}

function MoveControls() {
  const { camera, clock } = useThree();
  const [ref, api] = useSphere(() => ({
    mass: 70,
    type: 'Dynamic',
    position: [0, 1.8, 0],
    linearDamping: 0.9,  // High linear damping to quickly reduce sliding
    angularDamping: 0.9  // Angular damping can also be set if needed
  }));
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  const [isRunning, setIsRunning] = useState(false);
  const walkSpeed = 1.5;
  const runSpeed = 3.0;
  const bobbingSpeed = 12;
  const bobbingAmount = 0.09;
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    api.position.subscribe(pos => {
      camera.position.set(pos[0], pos[1], pos[2]);
      if (isMoving) {
        camera.position.y += Math.sin(clock.getElapsedTime() * bobbingSpeed) * bobbingAmount;
      }
    });
  }, [api, isMoving, camera, clock]);

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
    if (!isMoving) {
      api.velocity.set(0, 0, 0);  // Stop the movement when no key is pressed
      return;
    }

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const forward = movement.forward ? 1 : movement.backward ? -1 : 0;
    const sideways = movement.left ? 1 : movement.right ? -1 : 0;

    const sideVector = new THREE.Vector3();
    sideVector.crossVectors(camera.up, direction);

    direction.multiplyScalar(forward).add(sideVector.multiplyScalar(sideways)).normalize();

    const speed = isRunning ? runSpeed : walkSpeed;
    direction.multiplyScalar(speed);

    api.velocity.set(direction.x, 0, direction.z);
  });

  return null;
}

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
          <Physics gravity={[0, -9.81, 0]}>
            <ambientLight intensity={0.1} />
            <directionalLight color="white" position={[1, 10, 15]} />
            <Suspense fallback={null}>
              <Environment background={true} files="/media/textures/concrete_wall.jpg" />
              <Model modelPath={modelPath} position={[1, 0, -2]} />
            </Suspense>
            <PointerLockControls />
            <MoveControls />
            <GroundPlane />
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
