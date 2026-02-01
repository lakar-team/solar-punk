'use client';

import { useStore } from '@/store/useStore';
import { projects } from '@/data/projects';
import { profile } from '@/data/profile';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function HUD() {
    const { activePlanetId, setActivePlanet, setFocusedPlanet, focusedPlanetId } = useStore();
    const [showNav, setShowNav] = useState(false);

    const activeProject = projects.find(p => p.id === activePlanetId);
    const isCVView = activePlanetId === 'cv-core';

    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-12">
            {/* Header / Logo Area */}
            <header className="flex justify-between items-start pointer-events-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter text-white/90 uppercase">ADAM M. RAMAN</h1>
                    <p className="text-xs tracking-widest text-amber-500 uppercase">System Status: Nominal</p>
                </div>
                {/* Helper Hint */}
                {!activePlanetId && (
                    <div className="text-sm text-white/50 animate-pulse">
                        Click the sun or a planet to explore
                    </div>
                )}
            </header>

            {/* CV Core View (Sun clicked) */}
            <AnimatePresence>
                {isCVView && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="pointer-events-auto absolute right-0 top-0 bottom-0 w-full md:w-[600px] bg-black/80 backdrop-blur-md border-l border-amber-500/20 p-8 shadow-2xl flex flex-col overflow-y-auto"
                    >
                        <button
                            onClick={() => { setActivePlanet(null); setFocusedPlanet(null); }}
                            className="mb-6 self-start rounded-full border border-amber-500/30 px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-colors text-amber-400"
                        >
                            ← Return to Orbit
                        </button>

                        <div className="flex-1 space-y-6">
                            <div>
                                <span className="inline-block px-2 py-1 bg-amber-500/20 rounded text-[10px] uppercase tracking-wider mb-2 text-amber-400 border border-amber-500/30">
                                    Core Profile
                                </span>
                                <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                                    {profile.name}
                                </h2>
                                <p className="text-lg text-amber-200/80">{profile.title}</p>
                                <p className="text-sm text-amber-400/60 mt-1">{profile.tagline}</p>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-amber-500/30 to-transparent" />

                            <p className="text-base text-gray-300 leading-relaxed">
                                {profile.bio}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {profile.skills.map((skill, i) => (
                                    <span key={i} className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-300">
                                        {skill}
                                    </span>
                                ))}
                            </div>

                            {/* Embedded PDF Viewer */}
                            <div className="mt-6 rounded-lg overflow-hidden border border-amber-500/20 bg-black/50">
                                <div className="p-3 border-b border-amber-500/20 flex justify-between items-center">
                                    <span className="text-xs text-amber-400 uppercase tracking-wider">Tech CV Preview</span>
                                    <a
                                        href="/Adam_Tech_CV.pdf"
                                        target="_blank"
                                        className="text-xs text-amber-500 hover:text-amber-400 underline"
                                    >
                                        Open Full Screen
                                    </a>
                                </div>
                                <iframe
                                    src="/Adam_Tech_CV.pdf"
                                    className="w-full h-[400px]"
                                    title="Adam M. Raman Tech CV"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <a
                                    href="/Adam_Tech_CV.pdf"
                                    download
                                    className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-black text-center font-bold uppercase tracking-wider transition-colors rounded"
                                >
                                    Download PDF
                                </a>
                                <a
                                    href="/docs/profile-background.pdf"
                                    target="_blank"
                                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white text-center font-bold uppercase tracking-wider transition-colors rounded border border-white/10"
                                >
                                    View Background
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Project Detail Overlay */}
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
                            onClick={() => { setActivePlanet(null); setFocusedPlanet(null); }}
                            className="mb-8 self-start rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                            ← Return to Orbit
                        </button>

                        <div className="flex-1 space-y-6">
                            <div>
                                <span className={`inline-block px-2 py-1 bg-white/10 rounded text-[10px] uppercase tracking-wider mb-2 ${activeProject.status === 'in-progress' ? 'text-amber-400 border border-amber-500/30' : 'text-blue-300'}`}>
                                    {activeProject.type}{activeProject.status === 'in-progress' ? ' • WIP' : ''}
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
                                <div className="mt-4 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex justify-center items-center">
                                    <img
                                        src={activeProject.image}
                                        alt={activeProject.name}
                                        className="max-w-full max-h-[500px] object-contain"
                                    />
                                </div>
                            )}

                            {/* Secondary Links */}
                            {activeProject.secondaryLinks && activeProject.secondaryLinks.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {activeProject.secondaryLinks.map((secLink, i) => (
                                        <a
                                            key={i}
                                            href={secLink.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded text-sm text-white/80 hover:text-white transition-colors"
                                        >
                                            {secLink.label}
                                        </a>
                                    ))}
                                </div>
                            )}

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

            {/* Navigation Panel Toggle - At top for easy access */}
            <div className="pointer-events-auto fixed top-4 md:top-20 left-4 md:left-6 z-30">
                <button
                    onClick={() => setShowNav(!showNav)}
                    className="px-4 py-2 bg-black/80 backdrop-blur-md border border-white/30 rounded-full text-xs uppercase tracking-widest text-white hover:text-amber-400 hover:border-amber-500/30 transition-all shadow-lg"
                >
                    {showNav ? '✕ Close' : '☰ Navigate'}
                </button>
            </div>

            {/* Navigation Panel - Opens from top */}
            <AnimatePresence>
                {showNav && (
                    <motion.div
                        initial={{ y: '-20px', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-20px', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="pointer-events-auto fixed top-16 md:top-32 left-4 md:left-6 z-30 w-[calc(100vw-2rem)] md:w-72 max-h-[60vh] overflow-y-auto bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-2xl"
                    >
                        <div className="mb-3 text-xs uppercase tracking-widest text-white/50">Quick Navigation</div>

                        {/* Sun/CV */}
                        <button
                            onClick={() => { setActivePlanet('cv-core'); setFocusedPlanet(null); setShowNav(false); }}
                            className="w-full text-left px-3 py-3 rounded hover:bg-amber-500/20 active:bg-amber-500/30 text-amber-400 text-sm mb-2 border border-amber-500/20"
                        >
                            ☀️ Core Profile (CV)
                        </button>

                        {/* Planets - Direct open for mobile friendliness */}
                        <div className="space-y-1">
                            {projects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => {
                                        setFocusedPlanet(project.id);
                                        setActivePlanet(project.id);
                                        setShowNav(false);
                                    }}
                                    className={`w-full text-left px-3 py-3 rounded hover:bg-white/10 active:bg-white/20 text-sm transition-colors ${project.status === 'in-progress' ? 'text-amber-300' : 'text-white/80'}`}
                                >
                                    {project.name}
                                    {project.status === 'in-progress' && <span className="ml-2 text-[10px] text-amber-400">(WIP)</span>}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
