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
    name: 'Adam M. Raman',
    title: 'Product Strategy Lead | Built Environment & PropTech Innovation',
    tagline: 'Ex-Founder & R&D Specialist driving Digital Transformation',
    skills: [
        'Product Lifecycle Management', 'Agile Methodologies',
        'Stakeholder Management', 'Go-to-Market Strategy',
        'P&L Ownership', 'IoT & Smart Home Integration',
        'Energy Data Analysis', 'AI-Assisted Workflow Design'
    ],
    bio: 'I solve problems by looking where others don’t—merging lessons from nature with deep technical engineering. After a decade of leadership and a successfully bootstrapped 100% YoY growth firm, I am currently on a Research Sabbatical focused on Climate Tech and AI-driven workflows. My expertise lies in making complex systems (Energy, Software, Physical Space) feel intuitive. I lead by understanding the "how" of the maker and the "why" of the user, pushing teams to generate creative solutions that are both sustainable and cutting-edge.',
    socials: {
        github: 'https://github.com/lakar-team',
        // Add other links here
    },
};
