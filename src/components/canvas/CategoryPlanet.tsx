'use client';

import { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { Category } from '@/data/projects';
import { projects } from '@/data/projects';
import { useStore } from '@/store/useStore';
import Moon from './Moon';

interface CategoryPlanetProps {
    category: Category;
}

function TexturedMaterial({ texturePath, emissive, emissiveIntensity, opacity }: {
    texturePath: string;
    emissive: string;
    emissiveIntensity: number;
    opacity: number;
}) {
    const texture = useTexture(texturePath);
    return (
        <meshStandardMaterial
            map={texture}
            roughness={0.8}
            metalness={0.1}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
            transparent={opacity < 1}
            opacity={opacity}
        />
    );
}

export default function CategoryPlanet({ category }: CategoryPlanetProps) {
    const { viewMode, focusedCategoryId, setFocusedCategory, setViewMode, setPlanetPosition } = useStore();
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const worldPosCache = useRef(new THREE.Vector3());
    const [hovered, setHover] = useState(false);
    const startAngle = useRef(Math.random() * Math.PI * 2).current;

    const isFocused = focusedCategoryId === category.id;
    const isLunarView = viewMode === 'lunar';
    const isDimmed = isLunarView && !isFocused;
    const moonsActive = isLunarView && isFocused;

    const categoryProjects = projects.filter(p => p.category === category.id);
    const planetRadius = category.size * 0.4;
    const emissiveIntensity = isDimmed ? 0.02 : hovered ? 0.5 : 0.18;
    const opacity = isDimmed ? 0.22 : 1.0;

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        const angle = startAngle + t * category.orbitSpeed * 0.2;
        groupRef.current.position.x = Math.cos(angle) * category.orbitRadius;
        groupRef.current.position.z = Math.sin(angle) * category.orbitRadius;

        // Publish world position for camera to follow in lunar view
        groupRef.current.getWorldPosition(worldPosCache.current);
        setPlanetPosition(category.id, worldPosCache.current);

        if (meshRef.current) {
            meshRef.current.rotation.y += 0.003;
        }
    });

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        if (isLunarView) return;
        setFocusedCategory(category.id);
        setViewMode('lunar');
    };

    return (
        <group ref={groupRef}>
            {/* Planet sphere */}
            <Sphere
                args={[planetRadius, 32, 32]}
                ref={meshRef}
                onPointerOver={() => !isLunarView && setHover(true)}
                onPointerOut={() => setHover(false)}
                onClick={handleClick}
            >
                <Suspense
                    fallback={
                        <meshStandardMaterial
                            color={isDimmed ? '#1a1a1a' : category.color}
                            emissive={category.emissiveColor}
                            emissiveIntensity={emissiveIntensity}
                            roughness={0.8}
                            transparent={opacity < 1}
                            opacity={opacity}
                        />
                    }
                >
                    <TexturedMaterial
                        texturePath={category.texturePath}
                        emissive={category.emissiveColor}
                        emissiveIntensity={emissiveIntensity}
                        opacity={opacity}
                    />
                </Suspense>
            </Sphere>

            {/* Atmosphere glow — skip when dimmed */}
            {!isDimmed && (
                <Sphere args={[planetRadius * 1.08, 32, 32]}>
                    <meshBasicMaterial
                        color={category.emissiveColor}
                        transparent
                        opacity={isFocused ? 0.12 : hovered ? 0.07 : 0.03}
                        blending={THREE.AdditiveBlending}
                        side={THREE.BackSide}
                        depthWrite={false}
                    />
                </Sphere>
            )}

            {/* Point light for local illumination */}
            <pointLight
                color={category.emissiveColor}
                intensity={isDimmed ? 0.2 : isFocused ? 2.5 : 1.8}
                distance={category.size * 6}
                decay={1.5}
            />

            {/* Category label — solar view only */}
            {!isLunarView && (
                <Html distanceFactor={15} center>
                    <div
                        className="pointer-events-none select-none text-center"
                        style={{ opacity: hovered ? 1 : 0.75, transition: 'opacity 0.3s' }}
                    >
                        <div
                            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-widest border whitespace-nowrap"
                            style={{
                                background: hovered ? `${category.color}28` : 'rgba(0,0,0,0.55)',
                                borderColor: hovered ? category.color : 'rgba(255,255,255,0.18)',
                                color: hovered ? category.color : 'rgba(255,255,255,0.75)',
                            }}
                        >
                            {category.name}
                        </div>
                        {hovered && (
                            <div
                                className="text-[9px] mt-1 uppercase tracking-widest"
                                style={{ color: 'rgba(255,255,255,0.4)' }}
                            >
                                Click to explore
                            </div>
                        )}
                    </div>
                </Html>
            )}

            {/* Moons — always rendered, active flag controls size + clickability */}
            {categoryProjects.map((project, i) => (
                <Moon
                    key={project.id}
                    project={project}
                    moonIndex={i}
                    totalMoons={categoryProjects.length}
                    categoryColor={category.emissiveColor}
                    active={moonsActive}
                />
            ))}
        </group>
    );
}
