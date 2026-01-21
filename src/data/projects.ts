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
        id: 'refil-japan',
        name: 'Refil Japan',
        type: 'work',
        size: 7,
        texture: 'planet-tech',
        status: 'in-progress',
        description: 'Product & Innovation Consultant driving digital transformation. Creating automated workflows and bridging the gap between engineering teams and business goals.',
        orbitRadius: 15,
        orbitSpeed: 0.5,
    },
    {
        id: 'phd-research',
        name: 'Climate Tech R&D',
        type: 'research',
        size: 8,
        texture: 'planet-ice',
        status: 'complete',
        description: 'Developed novel passive cooling hardware (50% efficiency gain). Synthesized global environmental data to validate product-market fit.',
        orbitRadius: 25,
        orbitSpeed: 0.35,
    },
    {
        id: 'lakar-design',
        name: 'Lakar Design',
        type: 'work',
        size: 9,
        texture: 'planet-desert',
        status: 'complete',
        description: 'Founder & CEO. Bootstrapped to profitability with 100% YoY growth. Disrupted market by standardizing "affordable designer renovations" using UX strategy in physical spaces.',
        orbitRadius: 35,
        orbitSpeed: 0.25,
    },
    {
        id: 'power-lunch',
        name: 'Power Lunch',
        type: 'work',
        size: 6,
        texture: 'planet-scaffold',
        status: 'in-progress',
        description: 'A dynamic host listing system for professional meetups. Integrating Stripe and Supabase for seamless user interactions.',
        orbitRadius: 45,
        orbitSpeed: 0.18,
    },
    {
        id: 'project-aibo',
        name: 'Project Aibo',
        type: 'work',
        size: 6,
        texture: 'planet-scaffold',
        status: 'in-progress',
        description: 'An AI-driven robotic companion project. Focusing on hardware-software integration and interactive persona design.',
        orbitRadius: 55,
        orbitSpeed: 0.12,
    },
    {
        id: 'apps-games',
        name: 'Apps & Games',
        type: 'hobby',
        size: 4,
        texture: 'planet-lava',
        status: 'complete',
        description: 'Experimental applications and game jams exploring novel interaction patterns.',
        orbitRadius: 65,
        orbitSpeed: 0.08,
    },
];
