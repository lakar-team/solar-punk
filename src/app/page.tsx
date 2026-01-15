import Scene from '@/components/canvas/Scene';
import HUD from '@/components/ui/HUD';

export default function Home() {
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
