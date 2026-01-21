'use client';

import { projects } from '@/data/projects';
import Planet from './Planet';
import * as THREE from 'three';

function OrbitRing({ radius }: { radius: number }) {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return (
        <line geometry={geometry}>
            <lineBasicMaterial color="#ffffff" opacity={0.1} transparent />
        </line>
    );
}

export default function PlanetSystem() {
    return (
        <group>
            {/* Orbit Rings */}
            {projects.map((project) => (
                <OrbitRing key={`orbit-${project.id}`} radius={project.orbitRadius} />
            ))}

            {/* Planets */}
            {projects.map((project) => (
                <Planet key={project.id} project={project} />
            ))}
        </group>
    );
}
