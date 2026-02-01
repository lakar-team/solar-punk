'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, useTexture } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Project } from '@/data/projects';

interface PlanetMeshProps {
    project: Project;
}

function PlanetMesh({ project }: PlanetMeshProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Load textures
    const mainTexture = project.texturePath ? useTexture(project.texturePath) : null;
    const projectImage = project.image ? useTexture(project.image) : null;
    const activeTexture = projectImage || mainTexture;

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    const getColor = (textureType: string) => {
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

    return (
        <>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color={baseEmissive} />

            <Sphere args={[1.8, 32, 32]} ref={meshRef}>
                <meshStandardMaterial
                    map={activeTexture}
                    color={activeTexture ? '#ffffff' : getColor(project.texture)}
                    roughness={0.4}
                    metalness={0.6}
                    emissive={baseEmissive}
                    emissiveIntensity={0.8}
                />
            </Sphere>
        </>
    );
}

interface PlanetPreviewProps {
    project: Project;
}

export default function PlanetPreview({ project }: PlanetPreviewProps) {
    return (
        <div className="w-full h-48 md:h-56 rounded-xl overflow-hidden bg-gradient-to-b from-black/50 to-transparent border border-white/10 mb-6">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <Suspense fallback={null}>
                    <PlanetMesh project={project} />
                </Suspense>
            </Canvas>
        </div>
    );
}
