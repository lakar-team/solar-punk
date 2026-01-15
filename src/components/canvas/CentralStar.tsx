'use client';

import { Sphere, MeshDistortMaterial, Text } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { profile } from '@/data/profile';

export default function CentralStar() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group>
            {/* The Star Itself */}
            <Sphere args={[4, 64, 64]} ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <MeshDistortMaterial
                    color={hovered ? "#fbbf24" : "#f59e0b"}
                    emissive={hovered ? "#d97706" : "#b45309"}
                    emissiveIntensity={2}
                    distort={0.4}
                    speed={2}
                    roughness={0}
                />
            </Sphere>

            {/* Glow Halo */}
            <pointLight distance={50} intensity={4} color="#f59e0b" />

            {/* Label above Star (Hidden unless close or consistently visible?) */}
            <Text
                position={[0, 6, 0]}
                fontSize={0.8}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                font="/fonts/Inter-Bold.woff" // Optional: need to handle fonts, defaulting to standard if not present
            >
                {profile.name}
            </Text>
        </group>
    );
}
