export interface Profile {
    name: string;
    title: string;
    tagline: string;
    skills: string[];
    bio: string;
    socials: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        email?: string;
    };
}

export const profile: Profile = {
    name: "Adam M. Raman",
    title: "Architect | Technologist | Innovation Specialist",
    tagline: "Ex-Founder | Built Environment & AI-Integrated Design",
    skills: [
        "Architectural Design", "Human-Centric Design", "BIM / CAD",
        "Building Energy Science", "Climate Tech",
        "AI Workflows", "Smart Home / IoT",
        "Product Strategy", "P&L Ownership", "Process Automation",
    ],
    bio: "Innovation strategist and former founder with 10+ years in the built environment. Built and scaled a design-build firm to 8 consecutive years of 100% YoY growth before pivoting to R&D — completing a PhD in climate-conscious building science at Tohoku University. Alongside the research: Assistant Lecturer at UiTM Malaysia (200+ students, 2016–2019), ESL Teaching Assistant at Tohoku University (2023–2025), and a sustained cultural diplomacy practice in Sendai — architecture talks at the JIA and Tapio Hall, school workshops through MIA, and restarting the Malaysia-Sendai business community after COVID. Now at the intersection of architecture, AI, and software: making complex systems — energy, space, data — feel intuitive from the inside out.",
    socials: {
        github: "https://github.com/lakar-team",
    },
};