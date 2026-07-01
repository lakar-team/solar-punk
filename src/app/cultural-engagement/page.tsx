import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cultural Engagement | Adam M. Raman',
    description: 'Invited speaker at Japan Institute of Architects international symposium — Malaysian architectural perspective on cross-cultural design.',
};

export default function CulturalEngagementPage() {
    redirect('/teaching/architecture-talks');
}
