import { projects } from '@/data/projects';
import ProjectDetailLayout from '@/components/ProjectDetailLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cultural Engagement | Adam M. Raman',
    description: 'Invited speaker at the Japan Institute of Architects international symposium.',
};

export default function CulturalEngagementPage() {
    const project = projects.find(p => p.id === 'cultural-engagement')!;
    return (
        <ProjectDetailLayout
            project={project}
            pdfDocs={[
                { label: 'Presentation Slides', url: '/docs/malaysia-presentation.pdf' },
            ]}
        />
    );
}
