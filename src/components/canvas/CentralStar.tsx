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
                    emissiveIntensity={hovered ? 2.5 : 1.8} // Increased for Bloom post-processing
                    roughness={0.5}
                />
            </Sphere>

            {/* Glowing Corona (Atmosphere/Flare) */}
            <Sphere args={[5.3, 32, 32]}>
                <meshBasicMaterial
                    color="#f59e0b"
                    transparent
                    opacity={0.3}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                />
            </Sphere>
            <Sphere args={[6.0, 32, 32]}>
                <meshBasicMaterial
                    color="#fbbf24"
                    transparent
                    opacity={0.15}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Glow Halo Light */}
            <pointLight distance={120} intensity={8} color="#f59e0b" decay={2} />

            {/* Label above Star */}
            <Html position={[0, 8, 0]} center>
                <div className={`pointer-events-none whitespace-nowrap text-sm font-bold transition-all duration-300 ${hovered ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'text-white/90 drop-shadow-md'}`}>
                    {profile.name}
                    <div className="text-[10px] text-amber-500/70 text-center">Click to view CV</div>
                </div>
            </Html>
        </group>
    );
}
