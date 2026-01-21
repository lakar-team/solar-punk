'use client';

import { projects } from '@/data/projects';
import Planet from './Planet';
import * as THREE from 'three';
import { useMemo } from 'react';

function OrbitRing({ radius }: { radius: number }) {
    const lineGeometry = useMemo(() => {
        const points = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
        }
        return new THREE.BufferGeometry().setFromPoints(points);
    }, [radius]);

    return (
        <primitive object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: '#ffffff', opacity: 0.1, transparent: true }))} />
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
