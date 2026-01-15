export type ProjectType = 'work' | 'hobby' | 'research' | 'merch' | 'core';
export type ProjectStatus = 'complete' | 'in-progress';

export interface Project {
    id: string;
    name: string;
    type: ProjectType;
    size: number; // 1-10 scale
    texture: string; // Placeholder for texture path or procedural color ID
    status: ProjectStatus;
    description: string;
    orbitRadius: number; // Distance from sun
    orbitSpeed: number; // Multiplier for orbit speed
}

export const projects: Project[] = [
    {
        id: 'lakar-portfolio',
        name: 'Lakar Portfolio',
        type: 'work',
        size: 8,
        texture: 'planet-tech',
        status: 'complete',
        description: 'My main design portfolio, showcasing high-impact visual work.',
        orbitRadius: 15,
        orbitSpeed: 0.5,
    },
    {
        id: 'project-aibo',
        name: 'Project Aibo',
        type: 'work',
        size: 6,
        texture: 'planet-scaffold',
        status: 'in-progress',
        description: 'An AI-driven robotic companion project. Currently under construction.',
        orbitRadius: 22,
        orbitSpeed: 0.3,
    },
    {
        id: 'power-lunch',
        name: 'Power Lunch',
        type: 'work',
        size: 6,
        texture: 'planet-scaffold',
        status: 'in-progress',
        description: 'A dynamic host listing system for professional meetups.',
        orbitRadius: 28,
        orbitSpeed: 0.25,
    },
    {
        id: 'phd-research',
        name: 'PhD Research',
        type: 'research',
        size: 5,
        texture: 'planet-ice',
        status: 'complete',
        description: 'Deep dive into academic research and technological innovation.',
        orbitRadius: 35,
        orbitSpeed: 0.2,
    },
    {
        id: 'merch-designs',
        name: 'Merch Designs',
        type: 'merch',
        size: 4,
        texture: 'planet-desert',
        status: 'complete',
        description: 'Creative merchandise designs and apparel.',
        orbitRadius: 40,
        orbitSpeed: 0.15,
    },
    {
        id: 'book-design',
        name: 'Book Design',
        type: 'work',
        size: 4,
        texture: 'planet-gas',
        status: 'complete',
        description: 'Editorial and cover design for published works.',
        orbitRadius: 45,
        orbitSpeed: 0.12,
    },
    {
        id: 'smart-home',
        name: 'Smart Home',
        type: 'hobby',
        size: 3,
        texture: 'planet-forest',
        status: 'complete',
        description: 'IoT and automation projects for the modern home.',
        orbitRadius: 50,
        orbitSpeed: 0.1,
    },
    {
        id: 'apps-games',
        name: 'Apps & Games',
        type: 'hobby',
        size: 4,
        texture: 'planet-lava',
        status: 'complete',
        description: 'Various experimental applications and game jams.',
        orbitRadius: 55,
        orbitSpeed: 0.08,
    },
];
