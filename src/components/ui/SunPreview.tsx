'use client';

import { Sphere, useTexture } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SunPreview() {
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
