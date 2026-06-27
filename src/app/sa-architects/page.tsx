import { projects } from '@/data/projects';
import ProjectDetailLayout from '@/components/ProjectDetailLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'S&A Architects | Adam M. Raman',
    description: 'PAM Award 2017 winning master plan — Denai Alam Phase J15, Shah Alam.',
};

export default function SAArchitectsPage() {
    const project = projects.find(p => p.id === 'sa-architects')!;
    return (
        <ProjectDetailLayout
            project={project}
            pdfDocs={[
                { label: 'PAM Award Publication', url: '/docs/sa-architects-award.pdf' },
            ]}
        />
    );
}
