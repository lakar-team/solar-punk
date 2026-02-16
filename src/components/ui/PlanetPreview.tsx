'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, useTexture } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Project } from '@/data/projects';

interface PlanetMeshProps {
    project: Project;
}

function TexturedMaterial({
    texturePath,
    color,
    emissive,
    emissiveIntensity
}: {
    texturePath: string;
    color: string;
    emissive: string;
    emissiveIntensity: number;
}) {
    const texture = useTexture(texturePath);

    return (
        <meshStandardMaterial
            map={texture}
            color={color}
            roughness={0.7}
            metalness={0.2}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity}
        />
    );
}

function PlanetMesh({ project }: PlanetMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    const getColor = (textureType: string) => {
        if (!textureType) return '#cbd5e1';
        if (textureType.includes('tech')) return '#3b82f6';
        if (textureType.includes('scaffold')) return '#64748b';
        if (textureType.includes('ice')) return '#a5f3fc';
        if (textureType.includes('desert')) return '#fdba74';
        if (textureType.includes('gas')) return '#d8b4fe';
        if (textureType.includes('forest')) return '#22c55e';
        if (textureType.includes('lava')) return '#ef4444';
        return '#cbd5e1';
    };

    const baseEmissive = project.emissiveColor || '#22d3ee';
    const fallbackColor = getColor(project.texture || '');

    // Determine which texture to use (if any)
    const textureToLoad = project.image || project.texturePath;

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color={baseEmissive} />

            <Sphere args={[1.8, 32, 32]} ref={meshRef}>
                <Suspense fallback={
                    <meshStandardMaterial
                        color={fallbackColor}
                        roughness={0.7}
                        metalness={0.2}
                        emissive={baseEmissive}
                        emissiveIntensity={0.2}
                    />
                }>
                    {textureToLoad ? (
                        <TexturedMaterial
                            texturePath={textureToLoad}
                            color="#ffffff"
                            emissive={baseEmissive}
                            emissiveIntensity={0.2}
                        />
                    ) : (
                        <meshStandardMaterial
                            color={fallbackColor}
                            roughness={0.7}
                            metalness={0.2}
                            emissive={baseEmissive}
                            emissiveIntensity={0.2}
                        />
                    )}
                </Suspense>
            </Sphere>
        </>
    );
}

interface PlanetPreviewProps {
    project: Project;
}

export default function PlanetPreview({ project }: PlanetPreviewProps) {
    if (!project) return null;

    return (
        <div className="w-full h-40 md:h-48 rounded-xl overflow-hidden bg-gradient-to-b from-black/50 to-transparent border border-white/10 mb-4 group/preview">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <Suspense fallback={null}>
                    <PlanetMesh project={project} />
                </Suspense>
            </Canvas>
        </div>
    );
}
