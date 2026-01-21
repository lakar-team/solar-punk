'use client';

import { useStore } from '@/store/useStore';
import { projects } from '@/data/projects';
import { motion, AnimatePresence } from 'framer-motion';

export default function HUD() {
    const { activePlanetId, setActivePlanet } = useStore();

    const activeProject = projects.find(p => p.id === activePlanetId);

    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-12">
            {/* Header / Logo Area */}
            <header className="flex justify-between items-start pointer-events-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter text-white/90 uppercase">ADAM M. RAMAN</h1>
                    <p className="text-xs tracking-widest text-amber-500 uppercase">System Status: Nominal</p>
                    <a
                        href="/Adam_Tech_CV.pdf"
                        download
                        className="mt-2 inline-flex items-center text-[10px] text-white/40 hover:text-amber-400 border border-white/10 hover:border-amber-500/30 px-2 py-1 rounded transition-all uppercase tracking-widest bg-white/5"
                    >
                        <span className="mr-1.5">⬇</span> Download Tech CV
                    </a>
                </div>
                {/* Helper Hint */}
                {!activePlanetId && (
                    <div className="text-sm text-white/50 animate-pulse">
                        Click a planet to initiate travel
                    </div>
                )}
            </header>

            {/* Main Detail Overlay (Sliding in from Right or Bottom) */}
            <AnimatePresence>
                {activeProject && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="pointer-events-auto absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-black/60 backdrop-blur-md border-l border-white/10 p-8 shadow-2xl flex flex-col overflow-y-auto"
                    >
                        <button
                            onClick={() => setActivePlanet(null)}
                            className="mb-8 self-start rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                            ← Return to Orbit
                        </button>

                        <div className="flex-1 space-y-6">
                            <div>
                                <span className={`inline-block px-2 py-1 bg-white/10 rounded text-[10px] uppercase tracking-wider mb-2 ${activeProject.status === 'in-progress' ? 'text-amber-400 border border-amber-500/30' : 'text-blue-300'}`}>
                                    {activeProject.type} • {activeProject.status}
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
                                    {activeProject.name}
                                </h2>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent" />

                            <p className="text-lg text-gray-300 leading-relaxed">
                                {activeProject.description}
                            </p>

                            {activeProject.image && (
                                <div className="mt-4 rounded-lg overflow-hidden border border-white/10 aspect-video bg-white/5">
                                    <img
                                        src={activeProject.image}
                                        alt={activeProject.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}

                            {/* Placeholder for future extended content (images, links) */}
                            <div className="p-4 rounded bg-white/5 border border-white/5 mt-8">
                                <p className="text-sm text-gray-400 italic">
                                    Additional extracted data and visualization modules loading...
                                    <br />(Linktree/Images/Live Demo hooks would go here)
                                </p>
                            </div>

                            {activeProject.link && (
                                <a
                                    href={activeProject.link}
                                    target={activeProject.link.startsWith('http') ? '_blank' : '_self'}
                                    rel={activeProject.link.startsWith('http') ? 'noopener noreferrer' : ''}
                                    className="mt-8 block w-full py-4 bg-amber-600 hover:bg-amber-500 text-black text-center font-bold uppercase tracking-wider transition-colors rounded"
                                >
                                    {activeProject.type === 'merch' ? 'Visit Store' : activeProject.id.includes('book') ? 'View on Amazon' : 'Launch Experience'}
                                </a>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
