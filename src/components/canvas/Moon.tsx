'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { Project } from '@/data/projects';
import { useStore } from '@/store/useStore';

interface MoonProps {
    project: Project;
    moonIndex: number;
    totalMoons: number;
    categoryColor: string;
    active: boolean; // true when parent category is focused in lunar view
}

export default function Moon({ project, moonIndex, totalMoons, categoryColor, active }: MoonProps) {
    const { setActivePlanet } = useStore();
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    // Evenly distribute start angles, then vary per moon to avoid clustering
    const startAngle = useRef((moonIndex / totalMoons) * Math.PI * 2).current;

    // Spread moons across different radii and speeds
    const orbitRadius = 4.5 + moonIndex * 1.8;
    const orbitSpeed = 0.5 - moonIndex * 0.03;

    const moonColor = project.emissiveColor || categoryColor;

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        const angle = startAngle + t * orbitSpeed * 0.2;
        groupRef.current.position.x = Math.cos(angle) * orbitRadius;
        groupRef.current.position.z = Math.sin(angle) * orbitRadius;
    });

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        if (!active) return;
        e.stopPropagation();
        setActivePlanet(project.id);
    };

    const emissiveIntensity = hovered ? 1.0 : active ? 0.5 : 0.15;

    return (
        <group ref={groupRef} scale={active ? 1.0 : 0.38}>
            {/* Moon sphere */}
            <Sphere
                args={[0.7, active ? 16 : 6, active ? 16 : 6]}
                onClick={handleClick}
                onPointerOver={() => active && setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <meshStandardMaterial
                    color={moonColor}
                    emissive={moonColor}
                    emissiveIntensity={emissiveIntensity}
                    roughness={0.6}
                    metalness={0.2}
                />
            </Sphere>

            {/* Hover glow ring */}
            {active && hovered && (
                <Sphere args={[1.0, 12, 12]}>
                    <meshBasicMaterial
                        color={moonColor}
                        transparent
                        opacity={0.12}
                        blending={THREE.AdditiveBlending}
                        side={THREE.BackSide}
                        depthWrite={false}
                    />
                </Sphere>
            )}

            {/* Label — only in active (lunar) view */}
            {active && (
                <Html distanceFactor={10} center>
                    <div
                        className="pointer-events-none select-none text-center"
                        style={{ opacity: hovered ? 1 : 0.65, transition: 'opacity 0.2s' }}
                    >
                        <div
                            className="text-[11px] font-bold whitespace-nowrap px-2 py-0.5 rounded"
                            style={{
                                color: hovered ? 'white' : 'rgba(255,255,255,0.8)',
                                textShadow: '0 1px 6px rgba(0,0,0,1)',
                                background: hovered ? 'rgba(0,0,0,0.65)' : 'transparent',
                            }}
                        >
                            {project.name}
                        </div>
                        {project.status === 'in-progress' && (
                            <div
                                className="text-[9px] uppercase tracking-widest"
                                style={{ color: '#f59e0b', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
                            >
                                WIP
                            </div>
                        )}
                    </div>
                </Html>
            )}
        </group>
    );
}
