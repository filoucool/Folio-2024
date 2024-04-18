import React, { Suspense, useState, useEffect, useRef } from 'react';
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
import { Debug } from '@react-three/cannon';

function Model({ modelPath, position }) {
  const [ref] = useBox(() => ({
    mass: 100,
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
  // Environment Parameters 
  const walkSpeed = 3.5;
  const runSpeed = 8;
  const bobbingSpeed = 12;
  const bobbingAmount = 0.09;
  const footstepVolumeWalking = 0.05;
  const footstepVolumeRunning = 0.2;
  const footstepPlaybackSpeedWalking = 1.0;
  const footstepPlaybackSpeedRunning = 1.5;
  const footstepCutoffWalking = 0.95;
  const footstepCutoffRunning = 0.4;

  // useStates
  const [isRunning, setIsRunning] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { camera, clock } = useThree();
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });

  // useRefs
  const currentVelocity = useRef([0, 0, 0]);
  const footstepAudioRef = useRef(new Audio('/media/Audio/footsteps.mp3'));
  const audioPlayingRef = useRef(false);

  const [ref, api] = useBox(() => ({
    mass: 70,
    position: [0, 0, 0],
    args: [0.9, 4, 0.9],
    type: 'Dynamic',
    linearDamping: 0.9,
    angularDamping: 1,
    allowSleep: false
  }));

  useEffect(() => {
    footstepAudioRef.current.load();
  }, [isRunning]);

    // Subscribe to velocity updates
    useEffect(() => {
      const unsubscribe = api.velocity.subscribe((velocity) => {
          currentVelocity.current = velocity;
      });
      return () => unsubscribe();
    }, [api.velocity]);
  
    // Subscribe to position updates
    useEffect(() => {
      const unsubscribe = api.position.subscribe(pos => {
        camera.position.set(pos[0], pos[1] + 2, pos[2]);
        if (isMoving) {
          camera.position.y += Math.sin(clock.getElapsedTime() * bobbingSpeed) * bobbingAmount;
        }
      });
      return () => unsubscribe();
    }, [api.position, isMoving, camera, clock]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      footstepAudioRef.current.playbackRate = isRunning ? footstepPlaybackSpeedRunning : footstepPlaybackSpeedWalking;
      footstepAudioRef.current.volume = isRunning ? footstepVolumeRunning : footstepVolumeWalking;

      if (isMoving && footstepAudioRef.current.paused) {
        footstepAudioRef.current.play();
      } else if (!isMoving) {
        footstepAudioRef.current.pause();
        footstepAudioRef.current.currentTime = 0;
      }

      if (footstepAudioRef.current.currentTime > footstepAudioRef.current.duration - (isRunning ? footstepCutoffRunning : footstepCutoffWalking)) {
        footstepAudioRef.current.currentTime = 0;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isMoving, isRunning]);

  useFrame(() => {
    if (!isMoving) {
      api.velocity.set(0, currentVelocity.current[1], 0); 
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

    api.velocity.set(direction.x, currentVelocity.current[1], direction.z);
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
          <Physics gravity={[0, -9.81, 0]} allowSleep={false}>
          <Debug color="black" scale={1.1} >
            <MoveControls />
            <ambientLight intensity={0.1} />
            <directionalLight color="white" position={[1, 10, 15]} />
            <Suspense fallback={null}>
              <Environment background={true} files="/media/textures/concrete_wall.jpg" />
              <Model modelPath={modelPath} position={[1, 0, -2]} />
            </Suspense>
            <PointerLockControls />
            <GroundPlane />
            <AxisTriad size={4} />
            <TexturedFloor texturePath={floorTexturePath} />
            <FallingCube />
            </Debug>
          </Physics>
        </Canvas>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

export default App;
