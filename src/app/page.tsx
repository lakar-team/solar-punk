'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { useIsMobile } from '@/hooks/useIsMobile';
import dynamic from 'next/dynamic';
import Scene from '@/components/canvas/Scene';
import HUD from '@/components/ui/HUD';

// Client-only: imports VrmViewer, Three.js, Kokoro TTS
const IntroScroll = dynamic(() => import('@/components/intro/IntroScroll'), { ssr: false });

// Atmosphere dissolve overlay — fades out as the solar system enters the viewport
function AtmosphereReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <motion.div
      ref={ref}
      className="absolute inset-0 z-10 pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, #020408 0%, rgba(2,4,8,0.6) 50%, transparent 100%)',
      }}
      initial={{ opacity: 1 }}
      animate={inView ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
    />
  );
}

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
    <div className="bg-[#02050a] text-white font-sans selection:bg-amber-500/30">
      {/* Intro — three scroll panels above the solar system */}
      <IntroScroll />

      {/* Solar system — full-viewport terminal section, skip-button anchor */}
      <section
        id="solar-system"
        className="relative h-screen w-full overflow-hidden"
      >
        {/* "Breaking through atmosphere" dissolve as section enters viewport */}
        <AtmosphereReveal />
        <Scene />
        <HUD />
      </section>

      <div className="sr-only">
        <h1>Adam M. Raman - Solar Punk Portfolio</h1>
        <p>A 3D interactive journey through my work.</p>
      </div>
    </div>
  );
}
