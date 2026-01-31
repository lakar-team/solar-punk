'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Project } from '@/data/projects';
import { useStore } from '@/store/useStore';

interface PlanetProps {
    project: Project;
}

export default function Planet({ project }: PlanetProps) {
    const { setActivePlanet, setFocusedPlanet, focusedPlanetId, setPlanetPosition } = useStore();
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHover] = useState(false);

    // Random start angle for orbit variety
    const startAngle = useRef(Math.random() * Math.PI * 2).current;

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Orbit logic
        if (groupRef.current) {
            const radius = project.orbitRadius;
            const speed = project.orbitSpeed * 0.2; // Slow down for chill vibe
            const angle = startAngle + t * speed;

            groupRef.current.position.x = Math.cos(angle) * radius;
            groupRef.current.position.z = Math.sin(angle) * radius;

            // Publish position to store for camera tracking
            setPlanetPosition(project.id, groupRef.current.position);

            // Rotate planet itself
            if (meshRef.current) {
                meshRef.current.rotation.y += 0.01;
            }
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation();
        if (focusedPlanetId === project.id) {
            // Already focused, open HUD
            setActivePlanet(project.id);
        } else {
            // Focus on this planet first
            setFocusedPlanet(project.id);
        }
    };

    const getColor = (textureType: string) => {
        // Temp placeholder colors until textures are loaded
        if (textureType.includes('tech')) return '#3b82f6'; // Blue
        if (textureType.includes('scaffold')) return '#64748b'; // Grey
        if (textureType.includes('ice')) return '#a5f3fc'; // Cyan
        if (textureType.includes('desert')) return '#fdba74'; // Orange
        if (textureType.includes('gas')) return '#d8b4fe'; // Purple
        if (textureType.includes('forest')) return '#22c55e'; // Green
        if (textureType.includes('lava')) return '#ef4444'; // Red
        return '#cbd5e1';
    };

    const isWIP = project.status === 'in-progress';
    const isFocused = focusedPlanetId === project.id;
    const mainTexture = project.texturePath ? useTexture(project.texturePath) : null;
    const projectImage = project.image ? useTexture(project.image) : null;

    // Use projectImage if available, else abstract texture, else fallback color
    const activeTexture = projectImage || mainTexture;
    const baseEmissive = project.emissiveColor || '#22d3ee';

    return (
        <group ref={groupRef}>
            {/* Planet Mesh */}
            <Sphere
                args={[project.size * 0.4, 32, 32]}
                ref={meshRef}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
                onClick={handleClick}
            >
                <meshStandardMaterial
                    map={activeTexture}
                    color={activeTexture ? '#ffffff' : getColor(project.texture)}
                    roughness={0.4}
                    metalness={0.6}
                    emissive={baseEmissive}
                    emissiveIntensity={isFocused ? 3.5 : hovered ? 2.5 : 1.5} // Extra glow when focused
                />
            </Sphere>

            {/* Subtle light to make the planet pop */}
            <pointLight
                color={baseEmissive}
                intensity={isFocused ? 3.0 : 2.0}
                distance={project.size * 3}
                decay={1.2}
            />

            {/* Orbit Ring (Visual aid) */}
            {/* Note: This would be better as a shared geometry in the parent system to save draw calls, but putting here for simplicity first */}

            {/* Label */}
            <Html distanceFactor={15}>
                <div className={`pointer-events-none select-none text-xs font-bold text-white transition-opacity duration-300 ${isFocused ? 'opacity-100 text-amber-400' : hovered ? 'opacity-100' : 'opacity-60'}`}>
                    {project.name}
                    {isWIP && <span className="block text-[10px] text-yellow-400">(WIP)</span>}
                    {isFocused && <span className="block text-[10px] text-amber-300">Click to open</span>}
                </div>
            </Html>
        </group>
    );
}
