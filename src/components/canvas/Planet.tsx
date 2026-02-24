'use client';

import { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Project } from '@/data/projects';
import { useStore } from '@/store/useStore';

interface PlanetProps {
    project: Project;
}

// Separate component for textured material to safely use useTexture hook
function TexturedMaterial({
    texturePath,
    color,
    emissive,
    emissiveIntensity,
    isWIP
}: {
    texturePath: string;
    color: string;
    emissive: string;
    emissiveIntensity: number;
    isWIP: boolean;
}) {
    const texture = useTexture(texturePath);

    return (
        <meshStandardMaterial
            map={texture}
            color={color}
            roughness={0.8}
            metalness={isWIP ? 0.8 : 0.1}
            bumpMap={texture} // Use color map as a cheap bump map for terrain depth
            bumpScale={0.015}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
        />
    );
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
        // Set both focus (for camera) and active (for HUD) on click
        setFocusedPlanet(project.id);
        setActivePlanet(project.id);
    };

    const getColor = (textureType: string) => {
        // Temp placeholder colors until textures are loaded
        if (!textureType) return '#cbd5e1';
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
    const baseEmissive = project.emissiveColor || '#22d3ee';
    const fallbackColor = getColor(project.texture || '');

    // Determine which texture to use (if any)
    const textureToLoad = project.image || project.texturePath;

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
                <Suspense fallback={
                    <meshStandardMaterial
                        color={fallbackColor}
                        roughness={0.8}
                        metalness={isWIP ? 0.8 : 0.1}
                        emissive={baseEmissive}
                        emissiveIntensity={isFocused ? 0.8 : hovered ? 0.5 : 0.1}
                    />
                }>
                    {textureToLoad ? (
                        <TexturedMaterial
                            texturePath={textureToLoad}
                            color="#ffffff"
                            emissive={baseEmissive}
                            emissiveIntensity={isFocused ? 0.8 : hovered ? 0.5 : 0.1}
                            isWIP={isWIP}
                        />
                    ) : (
                        <meshStandardMaterial
                            color={fallbackColor}
                            roughness={0.8}
                            metalness={isWIP ? 0.8 : 0.1}
                            emissive={baseEmissive}
                            emissiveIntensity={isFocused ? 0.8 : hovered ? 0.5 : 0.1}
                        />
                    )}
                </Suspense>
            </Sphere>

            {/* Atmospheric / Rim Glow Layer */}
            <Sphere args={[project.size * 0.42, 32, 32]}>
                <meshBasicMaterial
                    color={baseEmissive}
                    transparent
                    opacity={isFocused ? 0.15 : 0.05}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                    depthWrite={false}
                />
            </Sphere>

            {/* Subtle light to make the planet pop */}
            <pointLight
                color={baseEmissive}
                intensity={isFocused ? 3.0 : 2.0}
                distance={project.size * 3}
                decay={1.2}
            />

            {/* Label */}
            <Html distanceFactor={15}>
                <div className={`pointer-events-none select-none text-xs font-bold text-white transition-opacity duration-300 ${isFocused ? 'opacity-100 text-amber-400' : hovered ? 'opacity-100' : 'opacity-60'}`}>
                    {project.name}
                    {isWIP && <span className="block text-[10px] text-yellow-400">(WIP)</span>}
                </div>
            </Html>
        </group>
    );
}
