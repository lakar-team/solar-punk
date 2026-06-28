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
    bio: "Innovation strategist and former founder with 10+ years in the built environment. Built and scaled a design-build firm to 8 consecutive years of 100% YoY growth before pivoting to R&D - completing a PhD in climate-conscious building science at Tohoku University. Now at the intersection of architecture, AI, and software: making complex systems - energy, space, data - feel intuitive from the inside out. The self-taught coding journey that started during the PhD is documented in the Coding Journey PDF below.",
    socials: {
        github: "https://github.com/lakar-team",
    },
};