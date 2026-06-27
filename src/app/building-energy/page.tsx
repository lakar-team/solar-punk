import { projects } from '@/data/projects';
import ProjectDetailLayout from '@/components/ProjectDetailLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Building Energy | Adam M. Raman',
    description: 'HVAC engineering and building energy design for residential and commercial builds in Tohoku.',
};

export default function BuildingEnergyPage() {
    const project = projects.find(p => p.id === 'building-energy')!;
    return (
        <ProjectDetailLayout project={project} />
    );
}
