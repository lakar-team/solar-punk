'use client';

import { projects } from '@/data/projects';
import Planet from './Planet';

export default function PlanetSystem() {
    return (
        <group>
            {projects.map((project) => (
                <Planet key={project.id} project={project} />
            ))}

            {/* Visual Orbit Rings could go here later */}
        </group>
    );
}
