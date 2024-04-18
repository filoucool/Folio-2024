import React from 'react';
import { usePlane } from '@react-three/cannon';

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

  export default GroundPlane