import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { usePlane } from '@react-three/cannon';

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

  export default TexturedFloor