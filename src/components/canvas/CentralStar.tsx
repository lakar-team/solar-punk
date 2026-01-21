'use client';

import { Sphere, useTexture, Html } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { profile } from '@/data/profile';
import { useStore } from '@/store/useStore';

export default function CentralStar() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    const { setActivePlanet } = useStore();
    const sunTexture = useTexture('/textures/sun-face.jpg');

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
        }
    });

    return (
        <group>
            {/* The Star Itself */}
            <Sphere args={[5, 64, 64]} ref={meshRef}
                rotation={[0, Math.PI / 1.5, 0]} // Initial rotation to face camera
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                onClick={(e) => {
                    e.stopPropagation();
                    setActivePlanet('cv-core');
                }}
            >
                <meshStandardMaterial
                    map={sunTexture}
                    emissive={hovered ? "#fbbf24" : "#ffffff"} // White emissive makes the texture show better
                    emissiveMap={sunTexture} // Use texture as emissive map too
                    emissiveIntensity={hovered ? 1.5 : 0.8}
                    roughness={0.5}
                />
            </Sphere>

            {/* Glow Halo */}
            <pointLight distance={80} intensity={5} color="#f59e0b" />

            {/* Label above Star */}
            <Html position={[0, 7, 0]} center>
                <div className={`pointer-events-none whitespace-nowrap text-sm font-bold transition-all duration-300 ${hovered ? 'text-amber-400 scale-110' : 'text-white/90'}`}>
                    {profile.name}
                    <div className="text-[10px] text-amber-500/70 text-center">Click to view CV</div>
                </div>
            </Html>
        </group>
    );
}
