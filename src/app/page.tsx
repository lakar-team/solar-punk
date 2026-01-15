import Scene from '@/components/canvas/Scene';

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <Scene />

      {/* Fallback accessible content could go here, visually hidden or as anoscript */}
      <div className="sr-only">
        <h1>Adam M. Raman - Solar Punk Portfolio</h1>
        <p>A 3D interactive journey through my work.</p>
      </div>
    </main>
  );
}
