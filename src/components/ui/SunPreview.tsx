import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, useTexture } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

function SunMesh() {
    const meshRef = useRef<THREE.Mesh>(null);
    const sunTexture = useTexture('/textures/sun-face.jpg');

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={2} color="#f59e0b" />
            <Sphere args={[2.5, 64, 64]} ref={meshRef} rotation={[0, Math.PI / 1.5, 0]}>
                <meshStandardMaterial
                    map={sunTexture}
                    emissive="#ffffff"
                    emissiveMap={sunTexture}
                    emissiveIntensity={0.8}
                    roughness={0.5}
                />
            </Sphere>
        </group>
    );
}

export default function SunPreview() {
    return (
        <div className="w-full h-40 md:h-48 rounded-xl overflow-hidden bg-gradient-to-b from-black/50 to-transparent border border-amber-500/20 mb-6">
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                <Suspense fallback={null}>
                    <SunMesh />
                </Suspense>
            </Canvas>
        </div>
    );
}
