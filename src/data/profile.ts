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
    title: 'Creative Technologist & Engineer',
    tagline: 'Architecting the Future with Code and Design',
    skills: [
        'Next.js', 'React Three Fiber', 'Typescript',
        'AI Integration', 'Smart Home', 'Design Systems'
    ],
    bio: 'Welcome to my galaxy. I traverse the intersection of design, technology, and research. Explore the planets to see my journey.',
    socials: {
        github: 'https://github.com/lakar-team',
        // Add other links here
    },
};
