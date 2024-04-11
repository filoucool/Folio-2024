import React from 'react';
import { useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

function AxisTriad({ size = 1 }) {
  const { scene } = useThree();

  // Create and add the axes helper to the scene
  React.useEffect(() => {
    const axesHelper = new THREE.AxesHelper(size);
    scene.add(axesHelper);

    // Cleanup function to remove the helper when the component is unmounted
    return () => {
      scene.remove(axesHelper);
    };
  }, [scene, size]);

  return (
    <>
      {/* Position the text elements to label the axes */}
      <Text position={[size, 0, 0]} fontSize={0.1} color="red">X</Text>
      <Text position={[0, size, 0]} fontSize={0.1} color="green">Y</Text>
      <Text position={[0, 0, size]} fontSize={0.1} color="blue">Z</Text>
    </>
  );
}

export default AxisTriad;
