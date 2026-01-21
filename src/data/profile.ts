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
    bio: 'Ex-Founder and PhD Researcher with 10+ years of project leadership. I bridge the gap between technical engineering and business goals through human-centric design and automated operational workflows.',
    socials: {
        github: 'https://github.com/lakar-team',
        // Add other links here
    },
};
