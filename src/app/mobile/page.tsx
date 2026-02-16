import MobileLiteView from '@/components/ui/MobileLiteView';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Portfolio Lite | Adam M. Raman",
    description: "Lightweight mobile version of the Solar Punk Portfolio.",
};

export default function MobilePage() {
    return <MobileLiteView />;
}
