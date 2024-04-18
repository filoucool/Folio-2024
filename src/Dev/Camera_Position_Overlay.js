import React, { useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

function CameraPositionOverlay() {
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

  export default CameraPositionOverlay