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
    link?: string; // External or internal link
    image?: string; // Path to thumbnail/texture image
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
        link: '/docs/phd-research.pdf',
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
        link: '/docs/lakar-projects.pdf',
        image: '/textures/lakar-1.jpg',
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
        id: 'kanji-sniper',
        name: 'Kanji Sniper',
        type: 'hobby',
        size: 5,
        texture: 'planet-lava',
        status: 'complete',
        description: 'An interactive Japanese learning game. Test your kanji speed and accuracy!',
        orbitRadius: 65,
        orbitSpeed: 0.1,
        link: '/games/kanji-sniper.html',
    },
    {
        id: 'demon-hunter',
        name: 'Demon Hunter',
        type: 'hobby',
        size: 4,
        texture: 'planet-ice',
        status: 'complete',
        description: 'An experimental action game built with HTML/JS.',
        orbitRadius: 75,
        orbitSpeed: 0.08,
        link: '/games/demon-hunter.html',
        image: '/textures/demon-hunter.png',
    },
    {
        id: 'momotaro-book',
        name: 'Momotaro Kids Book',
        type: 'hobby',
        size: 5,
        texture: 'planet-forest',
        status: 'complete',
        description: 'Bilingual Japanese-English children\'s book retelling the classic tale of Momotaro.',
        orbitRadius: 85,
        orbitSpeed: 0.06,
        link: 'https://www.amazon.com/dp/B0GCV34Z4S',
        image: '/textures/momotaro.jpg',
    },
    {
        id: 'redbubble-shop',
        name: 'Lakar Design Shop',
        type: 'merch',
        size: 6,
        texture: 'planet-desert',
        status: 'complete',
        description: 'Custom apparel and merch from Stellar to Climate Tech collections.',
        orbitRadius: 95,
        orbitSpeed: 0.04,
        link: 'https://www.redbubble.com/people/lakardesign/shop',
        image: '/textures/merch-stellar.png',
    },
    {
        id: 'nature-vibe-channel',
        name: 'Nature Vibe YouTube',
        type: 'hobby',
        size: 4,
        texture: 'planet-gas',
        status: 'complete',
        description: 'A YouTube channel dedicated to serene nature vibes and ambiance.',
        orbitRadius: 105,
        orbitSpeed: 0.03,
        link: 'https://www.youtube.com/@naturevibechannel',
        image: '/textures/nature-vibe.jpg',
    },
];
