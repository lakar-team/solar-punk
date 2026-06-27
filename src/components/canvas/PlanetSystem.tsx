'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { categories } from '@/data/projects';
import { useStore } from '@/store/useStore';
import CategoryPlanet from './CategoryPlanet';

function OrbitRing({ radius }: { radius: number }) {
    const line = useMemo(() => {
        const points: THREE.Vector3[] = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: '#ffffff', opacity: 0.07, transparent: true });
        return new THREE.Line(geometry, material);
    }, [radius]);

    return <primitive object={line} />;
}

export default function PlanetSystem() {
    const { viewMode } = useStore();

    return (
        <group>
            {/* Orbit rings — solar view only */}
            {viewMode === 'solar' && categories.map((cat) => (
                <OrbitRing key={`orbit-${cat.id}`} radius={cat.orbitRadius} />
            ))}

            {/* Category planets (each renders its own moons) */}
            {categories.map((cat) => (
                <CategoryPlanet key={cat.id} category={cat} />
            ))}
        </group>
    );
}
