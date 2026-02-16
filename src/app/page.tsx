'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import Scene from '@/components/canvas/Scene';
import HUD from '@/components/ui/HUD';

export default function Home() {
  const isMobile = useIsMobile();
  const router = useRouter();

  useEffect(() => {
    if (isMobile === true) {
      router.push('/mobile');
    }
  }, [isMobile, router]);

  // Prevent rendering heavy components if we know it's mobile
  if (isMobile === true) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-amber-500 animate-pulse font-mono">Loading Lite Experience...</div>
      </div>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white font-sans selection:bg-amber-500/30">
      <Scene />
      <HUD />

      <div className="sr-only">
        <h1>Adam M. Raman - Solar Punk Portfolio</h1>
        <p>A 3D interactive journey through my work.</p>
      </div>
    </main>
  );
}

