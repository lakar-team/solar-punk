import { projects } from '@/data/projects';
import ProjectDetailLayout from '@/components/ProjectDetailLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lakar Design | Adam M. Raman',
    description: 'How I built a design firm with 100% YoY growth for 8 consecutive years.',
};

export default function LakarPage() {
    const project = projects.find(p => p.id === 'lakar-design')!;
    return (
        <ProjectDetailLayout
            project={project}
            pdfDocs={[
                { label: 'Project Portfolio', url: '/docs/lakar-projects.pdf' },
            ]}
        />
    );
}
