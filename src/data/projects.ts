export type ProjectType = 'work' | 'hobby' | 'research' | 'merch' | 'core';
export type ProjectStatus = 'complete' | 'in-progress';
export type ProjectCategory = 'architecture' | 'digital' | 'products';

export interface Project {
    id: string;
    name: string;
    type: ProjectType;
    category: ProjectCategory;
    size: number; // 1-10 scale
    texture: string; // Style ID
    texturePath?: string; // Path to generated abstract texture
    emissiveColor?: string; // Bright color for visibility
    status: ProjectStatus;
    description: string;
    orbitRadius: number; // Distance from sun (legacy — not used in two-tier system)
    orbitSpeed: number; // Multiplier for orbit speed (legacy)
    link?: string; // External or internal link (never a PDF — PDFs go in detail pages)
    image?: string; // Path to thumbnail/texture image
    images?: string[]; // Multiple inline images shown in HUD panel (from public/)
    keyFacts?: string[]; // 2–4 punchy stats/highlights shown as chips in HUD
    detailPage?: string; // Route to dedicated detail page (e.g. '/lakar')
    sidebarScreenshot?: string; // A dedicated screenshot for the sidebar preview only
    hideEmbed?: boolean; // When true, don't show the live site preview (iframe/PDF)
    secondaryLinks?: { label: string; url: string }[]; // Additional non-PDF resource links
}

export interface Category {
    id: ProjectCategory;
    name: string;
    size: number;
    color: string;
    emissiveColor: string;
    orbitRadius: number;
    orbitSpeed: number;
    texturePath: string;
}

export const categories: Category[] = [
    {
        id: 'architecture',
        name: 'Architecture',
        size: 9,
        color: '#f59e0b',
        emissiveColor: '#fb923c',
        orbitRadius: 22,
        orbitSpeed: 0.35,
        texturePath: '/textures/planet-desert.png',
    },
    {
        id: 'digital',
        name: 'Digital',
        size: 7,
        color: '#3b82f6',
        emissiveColor: '#60a5fa',
        orbitRadius: 38,
        orbitSpeed: 0.22,
        texturePath: '/textures/planet-tech.png',
    },
    {
        id: 'products',
        name: 'Products',
        size: 5,
        color: '#22c55e',
        emissiveColor: '#4ade80',
        orbitRadius: 54,
        orbitSpeed: 0.15,
        texturePath: '/textures/planet-forest.png',
    },
];

export const projects: Project[] = [
    {
        id: 'hydrocalc',
        name: 'HydroCalc v2',
        type: 'work',
        category: 'digital',
        size: 8,
        texture: 'planet-tech',
        texturePath: '/textures/planet-tech.png',
        emissiveColor: '#3b82f6',
        status: 'complete',
        description: 'The problem was clear — hydraulic design in architecture is buried under fragmented manual lookups and JIS pipe flow charts that belong in a spreadsheet, not a professional workflow. I set out to digitize those legacy standards, converting analog engineering diagrams into precise mathematical models powering real-time calibration. The result is a suite where engineers can map entire water supply networks and automate the journey from fixture units to exact pipe diameters.',
        orbitRadius: 15,
        orbitSpeed: 0.5,
        link: '/apps/hydrocalc/index.html',
        keyFacts: [
            'Digitizes JIS B 8364 pipe flow standards',
            'Real-time sizing: fixture units → exact pipe diameters',
            'Maps full building water supply networks',
        ],
        secondaryLinks: [
            { label: 'JIS Hydraulic Engine', url: 'https://github.com/lakar-team/hydrocalc' },
            { label: 'Documentation', url: 'https://github.com/lakar-team/hydrocalc#readme' },
        ],
    },
    {
        id: 'building-energy',
        name: 'Building Energy',
        type: 'work',
        category: 'architecture',
        size: 7,
        texture: 'planet-scaffold',
        texturePath: '/textures/planet-desert.png',
        emissiveColor: '#fb923c',
        status: 'in-progress',
        description: 'Translating a decade of architectural practice into the precision language of building systems engineering. I produce HVAC drawings and AC load calculations for new residential and commercial builds across Tohoku — working directly with local municipalities and architecture firms to navigate Japanese building standards. The tools are Rebro and Stabro: Japan\'s specialist MEP and building energy platforms, which sit at the intersection of traditional engineering rigour and modern BIM workflow. The goal is always the same: buildings that are thermally honest from day one.',
        orbitRadius: 20,
        orbitSpeed: 0.45,
        images: [
            '/images/building-energy/hvac-duct-diagram.jpg',
            '/images/building-energy/ventilation-cycle.jpg',
        ],
        keyFacts: [
            'HVAC drawings & AC load calculations for new builds in Tohoku',
            'Software: Rebro (MEP/BIM) and Stabro (building energy)',
            'Clients: local municipalities and architecture firms',
            'Bridges research (PhD thermal comfort) with engineering practice',
        ],
        detailPage: '/building-energy',
    },
    {
        id: 'phd-research',
        name: 'Climate Tech R&D',
        type: 'research',
        category: 'architecture',
        size: 7,
        texture: 'planet-ice',
        texturePath: '/textures/planet-arctic.png',
        emissiveColor: '#a5f3fc',
        status: 'complete',
        description: 'The central question: how much can a small amount of context awareness amplify what a passive building system can already do? I engineered a solar-regenerated desiccant cooling system that achieved a validated 50% reduction in cooling loads — not through brute force, but by making it responsive to real-world environmental data. The bigger vision is buildings that are alive and self-regulating: structures that feel their environment, interpret that data, and adapt. This research is the first step toward that goal.',
        orbitRadius: 25,
        orbitSpeed: 0.35,
        images: ['/images/phd-research/mall-ac.jpg'],
        keyFacts: [
            '50% cooling load reduction — validated',
            'Tohoku University PhD, 2022–2025',
            'Key finding: opening windows at night fights cooling — building design must account for this',
            'Focus: hot-humid climates (SE Asia context)',
        ],
        detailPage: '/phd-research',
    },
    {
        id: 'sa-architects',
        name: 'S&A Architects',
        type: 'work',
        category: 'architecture',
        size: 5,
        texture: 'planet-scaffold',
        texturePath: '/textures/planet-desert.png',
        emissiveColor: '#60a5fa',
        status: 'complete',
        description: 'Within my first year as a Graduate Architect, I designed a sustainable low-rise master plan that secured a PAM Award 2017 for Denai Alam Phase J15. By anchoring housing nodes around connected green ribbons leading to a central social hub, the design prioritized human interaction and ecological flow. This concept was so successful it was adopted as a prototypical standard for one of Malaysia’s largest property developers, proving that human-centric urban design is as commercially viable as it is sustainable.',
        orbitRadius: 30,
        orbitSpeed: 0.3,
        keyFacts: [
            'PAM Award 2017 — Multiple Residential (Low Rise), Silver',
            'Denai Alam Phase J15, Shah Alam, Malaysia',
            'Adopted as prototypical standard by major Malaysian developer',
            'Design anchors housing nodes around connected green ribbons',
        ],
        detailPage: '/sa-architects',
    },
    {
        id: 'lakar-design',
        name: 'Lakar Design',
        type: 'work',
        category: 'architecture',
        size: 9,
        texture: 'planet-forest',
        texturePath: '/textures/planet-forest.png',
        emissiveColor: '#22c55e',
        status: 'complete',
        description: 'I spotted a gap most firms ignored: people wanted designer interiors but couldn\'t justify boutique prices. I founded Lakar Design to close that gap — building a repeatable, high-quality design system I could scale without sacrificing craft. The company grew with 100% YoY growth for eight straight years, while pioneering what I called "affordable designer renovations" as a standard product offering.',
        orbitRadius: 35,
        orbitSpeed: 0.25,
        images: [
            '/images/lakar/restaurant-exterior.jpg',
            '/images/lakar/tea-cafe.jpg',
            '/images/lakar/restaurant-interior.jpg',
            '/images/lakar/residential.jpg',
        ],
        keyFacts: [
            '100% YoY revenue growth for 8 consecutive years',
            '¥1.8M → ¥42M annual revenue (2016–2021)',
            '3 entities: design studio, design+build firm, Sdn Bhd',
            'Pioneered “affordable designer renovations” as a market category',
        ],
        detailPage: '/lakar',
    },
    {
        id: 'smart-home',
        name: 'Smart Home Lab',
        type: 'hobby',
        category: 'products',
        size: 6,
        texture: 'planet-tech',
        texturePath: '/textures/planet-tech.png',
        emissiveColor: '#fbbf24',
        status: 'complete',
        description: 'It started as a free add-on for architecture clients — a way to test smart home systems in real environments while I figured out what actually worked. Each client project was a live experiment: sensors, automations, dashboards, all field-tested against real usage. As my understanding deepened, I integrated a more comprehensive and personal version into my own home, treating the space as a living UX platform I could refine from the inside out.',
        orbitRadius: 40,
        orbitSpeed: 0.18,
        images: [
            '/images/smart-home/interior.jpg',
            '/images/smart-home/system-diagram.jpg',
        ],
        keyFacts: [
            'Field-tested across client projects before personal install',
            'Multi-protocol: Zigbee, IR, RF, WiFi, Bluetooth',
            'Controls: AC, lighting, curtains, door lock — unified app',
        ],
        detailPage: '/smart-home',
        secondaryLinks: [
            { label: '🎦 Watch Video Tour', url: 'https://drive.google.com/file/d/13btXTHvz0uGBelzHlF5YX623mW48Un44/view?usp=sharing' },
        ],
    },
    {
        id: 'cultural-engagement',
        name: 'Cultural Engagement',
        type: 'research',
        category: 'architecture',
        size: 5,
        texture: 'planet-forest',
        texturePath: '/textures/planet-forest.png',
        emissiveColor: '#86efac',
        status: 'complete',
        description: 'I was invited to present at the Japan Institute of Architects international symposium, representing the Malaysian architectural perspective on cross-cultural design thinking. The experience forced me to distil years of professional practice into a framework that could translate across cultural and technical borders. It deepened my belief that the most durable innovations emerge when different design philosophies are allowed to genuinely intersect.',
        orbitRadius: 42,
        orbitSpeed: 0.16,
        keyFacts: [
            'Invited speaker at Japan Institute of Architects symposium',
            'Represented the Malaysian architectural perspective on cross-cultural design',
        ],
        detailPage: '/cultural-engagement',
    },
    {
        id: 'project-aibo',
        name: 'Project Aibo',
        type: 'work',
        category: 'digital',
        size: 4,
        texture: 'planet-scaffold',
        texturePath: '/textures/planet-tech.png',
        emissiveColor: '#fef08a',
        status: 'complete',
        description: 'I wanted to create a digital presence with real personality — not a chatbot, but something that felt alive. The full vision is a multi-core architecture: a Cognitive Core for memory consolidation, an Affective Core that maps mood to voice and movement, and a Motor Core using procedural animation. That system is still in development. What you see on this portfolio is a focused first release — a generative AI receptionist designed to guide visitors through my work.',
        orbitRadius: 45,
        orbitSpeed: 0.14,
        link: 'https://project-aibo.vercel.app/',
        sidebarScreenshot: '/textures/aibo-preview.jpg',
        hideEmbed: true,
    },
    {
        id: 'adamtool',
        name: 'Adamtool',
        type: 'hobby',
        category: 'digital',
        size: 6,
        texture: 'planet-lava',
        texturePath: '/textures/planet-desert.png',
        emissiveColor: '#ef4444',
        status: 'complete',
        description: 'I found myself constantly frustrated by bloated, ad-heavy web utilities that demanded complicated setups just to perform simple tasks. The problem wasn\'t a lack of tools, but a lack of intent. I decided to build Adamtool as a personal sanctuary of precision utilities—a curated collection of smart, focused applications crafted for real workflows. By keeping everything self-contained and fast, the project proved that software doesn\'t need to be noisy to be effective; it just needs to do exactly what it says.',
        orbitRadius: 48,
        orbitSpeed: 0.12,
        link: 'https://adamtool.pages.dev/',
    },
    {
        id: 'demon-hunter',
        name: 'Demon Hunter',
        type: 'hobby',
        category: 'digital',
        size: 5,
        texture: 'planet-ice',
        texturePath: '/textures/planet-arctic.png',
        emissiveColor: '#22d3ee',
        status: 'complete',
        description: 'Demon Hunter was my first real plunge into functional programming. The motivation wasn\'t to make a game — it was to understand how complex real-time interactions like combat logic, state management, and asset rendering could live within a single-file HTML environment. Many refinements required stepping past AI tools entirely, editing the code by hand to achieve the precise feel and behaviour I had envisioned.',
        orbitRadius: 51,
        orbitSpeed: 0.1,
        link: '/games/demon-hunter.html',
        image: '/textures/demon-hunter.png',
    },
    {
        id: 'momotaro-book',
        name: 'Momotaro Kids Book',
        type: 'hobby',
        category: 'digital',
        size: 6,
        texture: 'planet-desert',
        texturePath: '/textures/planet-desert.png',
        emissiveColor: '#fca5a5',
        status: 'complete',
        description: 'Standard word processors couldn\'t support the dual-language layout I had in mind. Driven by the need for a specific UX, I made the decision to build the entire book in HTML — giving me structural precision over bilingual formatting that design tools simply couldn\'t provide. I also used this project as a research ground for generative AI asset consistency, keeping character designs uniform across the whole narrative. It ended as a live lesson in global product distribution through Amazon self-publishing.',
        orbitRadius: 55,
        orbitSpeed: 0.08,
        image: '/textures/momotaro.jpg',
        link: 'https://www.amazon.com/dp/B0GCV34Z4S',
    },
    {
        id: 'redbubble-shop',
        name: 'Merchandising',
        type: 'merch',
        category: 'products',
        size: 6,
        texture: 'planet-tech',
        texturePath: '/textures/planet-tech.png',
        emissiveColor: '#fde047',
        status: 'complete',
        description: 'My first deliberate step from the physical construction industry into internet-based services. I wanted to understand what it meant to make something available to a global audience without a physical footprint. Redbubble was that experiment — a zero-overhead platform to learn the mechanics of digital storefronts, global distribution, and how the internet economy works from the inside.',
        orbitRadius: 58,
        orbitSpeed: 0.06,
        image: '/textures/merch-stellar.png',
        link: 'https://www.redbubble.com/people/lakardesign/shop',
    },
    {
        id: 'nature-vibe-channel',
        name: 'Nature Vibe YouTube',
        type: 'hobby',
        category: 'products',
        size: 5,
        texture: 'planet-gas',
        texturePath: '/textures/planet-arctic.png',
        emissiveColor: '#c084fc',
        status: 'complete',
        description: 'A deliberate departure from my technical world. The channel began as a personal project to curate and produce ambient nature content — slow, intentional footage that creates space for focus and calm. It has become an ongoing experiment in consistency, audience curation, and the quieter side of content creation.',
        orbitRadius: 60,
        orbitSpeed: 0.05,
        image: '/textures/nature-vibe.jpg',
        link: 'https://www.youtube.com/@naturevibechannel',
    },
    {
        id: 'islamic-advisor',
        name: 'Online Sheikh AI',
        type: 'work',
        category: 'digital',
        size: 5,
        texture: 'planet-forest',
        texturePath: '/textures/planet-forest.png',
        emissiveColor: '#10b981',
        status: 'complete',
        description: 'I built this to solve a fundamental problem with AI information integrity — standard LLMs generate confident answers with no accountability for truth. To move past the black box, I implemented a Retrieval-Augmented Generation workflow that forces the model to query verified scholarly APIs before constructing any response. Every answer goes through a decision loop: intent analysis, source retrieval, then a cross-reference check to prevent hallucination. The AI cites before it speaks.',
        orbitRadius: 64,
        orbitSpeed: 0.04,
        link: 'https://islamic-advisor.pages.dev',
    },
];
