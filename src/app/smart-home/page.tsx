import { projects } from '@/data/projects';
import ProjectDetailLayout from '@/components/ProjectDetailLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Smart Home Lab | Adam M. Raman',
    description: 'Field-tested smart home systems across client projects and a personal living lab.',
};

export default function SmartHomePage() {
    const project = projects.find(p => p.id === 'smart-home')!;
    return (
        <ProjectDetailLayout
            project={project}
            pdfDocs={[
                { label: 'Smart Home Report', url: '/docs/smart-home.pdf' },
            ]}
        />
    );
}
