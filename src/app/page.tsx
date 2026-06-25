'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/useIsMobile';
import Scene from '@/components/canvas/Scene';
import HUD from '@/components/ui/HUD';

// SSR-safe: IntroScroll uses window events and GSAP
const IntroScroll = dynamic(
  () => import('@/components/intro/IntroScroll'),
  { ssr: false },
);

export default function Home() {
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (isMobile === true) {
      router.push('/mobile');
    }
  }, [isMobile, router]);

  if (isMobile === true) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-amber-500 animate-pulse font-mono">Loading Lite Experience...</div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white font-sans selection:bg-amber-500/30">
      {/* Solar system always rendered beneath intro (z-0) so Three.js loads while intro plays */}
      <Scene />
      <HUD />

      {/* Intro overlay: fixed z-50, captures all wheel/touch events until complete */}
      <IntroScroll />

      <div className="sr-only">
        <h1>Adam M. Raman - Solar Punk Portfolio</h1>
        <p>A 3D interactive journey through my work.</p>
      </div>
    </main>
  );
}
