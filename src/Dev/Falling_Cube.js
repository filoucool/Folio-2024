import { useBox } from '@react-three/cannon';

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

export default FallingCube