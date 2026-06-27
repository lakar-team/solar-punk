import { projects } from '@/data/projects';
import ProjectDetailLayout from '@/components/ProjectDetailLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Climate Tech R&D | Adam M. Raman',
    description: 'PhD research: solar-regenerated desiccant cooling system achieving 50% load reduction.',
};

export default function PhDResearchPage() {
    const project = projects.find(p => p.id === 'phd-research')!;
    return (
        <ProjectDetailLayout
            project={project}
            pdfDocs={[
                { label: 'PhD Research Paper', url: '/docs/phd-research.pdf' },
                { label: '2024 Kyoto Conference Paper', url: '/docs/kyoto-conference.pdf' },
            ]}
        />
    );
}
