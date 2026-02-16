'use client';

import { useStore } from '@/store/useStore';
import { projects } from '@/data/projects';
import { profile } from '@/data/profile';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const PlanetPreview = dynamic(() => import('./PlanetPreview'), { ssr: false });
const SunPreview = dynamic(() => import('./SunPreview'), { ssr: false });

export default function HUD() {
    const { activePlanetId, setActivePlanet, setFocusedPlanet, focusedPlanetId } = useStore();
    const [showNav, setShowNav] = useState(false);
    const [showGuide, setShowGuide] = useState(false);

    const activeProject = projects.find(p => p.id === activePlanetId);
    const isCVView = activePlanetId === 'cv-core';

    // Unified Navigation List (Sun + Projects)
    const navItems = [{ id: 'cv-core', type: 'core' }, ...projects];

    // Navigation handlers
    const handleNext = () => {
        if (!activePlanetId) return;
        const currentIndex = navItems.findIndex(item => item.id === activePlanetId);
        if (currentIndex === -1) return;

        const nextIndex = (currentIndex + 1) % navItems.length;
        const nextItem = navItems[nextIndex];

        setActivePlanet(nextItem.id);
        setFocusedPlanet(nextItem.id === 'cv-core' ? null : nextItem.id);
    };

    const handlePrev = () => {
        if (!activePlanetId) return;
        const currentIndex = navItems.findIndex(item => item.id === activePlanetId);
        if (currentIndex === -1) return;

        const prevIndex = (currentIndex - 1 + navItems.length) % navItems.length;
        const prevItem = navItems[prevIndex];

        setActivePlanet(prevItem.id);
        setFocusedPlanet(prevItem.id === 'cv-core' ? null : prevItem.id);
    };

    return (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-12">
            {/* Header / Logo Area */}
            <header className="flex justify-between items-start pointer-events-auto">
                <div className="flex items-start gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold tracking-tighter text-white/90 uppercase">ADAM M. RAMAN</h1>
                        <p className="text-xs tracking-widest text-amber-500 uppercase">System Status: Nominal</p>
                    </div>
                    {/* Navigate Button - in header to avoid collision */}
                    <button
                        onClick={() => setShowNav(!showNav)}
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-black/80 backdrop-blur-md border border-white/30 rounded-full text-xs uppercase tracking-widest text-white hover:text-amber-400 hover:border-amber-500/30 transition-all shadow-lg"
                    >
                        {showNav ? '✕ Close' : '☰ Navigate'}
                    </button>
                </div>
                {/* Helper Hint */}
                {!activePlanetId && (
                    <div className="text-sm text-white/50 animate-pulse hidden md:block">
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
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => { setActivePlanet(null); setFocusedPlanet(null); }}
                                className="rounded-full border border-amber-500/30 px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-colors text-amber-400"
                            >
                                ← Return to Orbit
                            </button>

                            {/* Panel Navigation for Sun View */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-amber-500/20 hover:bg-amber-500/10 text-amber-500/80 hover:text-amber-400 transition-colors"
                                    aria-label="Previous Planet"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-amber-500/20 hover:bg-amber-500/10 text-amber-500/80 hover:text-amber-400 transition-colors"
                                    aria-label="Next Planet"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            <SunPreview />
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
                                    src="/Adam_Tech_CV.pdf#navpanes=0&toolbar=0&view=FitH"
                                    className="w-full h-[600px]"
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
                                    CV Detail & Background
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
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => { setActivePlanet(null); setFocusedPlanet(null); }}
                                className="rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                ← Return to Orbit
                            </button>

                            {/* Panel Navigation */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                                    aria-label="Previous Planet"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                                    aria-label="Next Planet"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        {/* 3D Planet Preview */}
                        <PlanetPreview project={activeProject} />

                        <div className="flex-1 space-y-6">
                            <div>
                                <span className={`inline-block px-2 py-1 bg-white/10 rounded text-[10px] uppercase tracking-wider mb-2 ${activeProject.status === 'in-progress' ? 'text-amber-400 border border-amber-500/30' : 'text-blue-300'}`}>
                                    {activeProject.type}{activeProject.status === 'in-progress' ? ' • WIP' : ''}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 mb-2">
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

                            {/* Project Link - Auto-embed PDF or Site Preview */}
                            {activeProject.link && (
                                <div className="space-y-4">
                                    {activeProject.link.toLowerCase().endsWith('.pdf') ? (
                                        <div className="mt-4 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                                            <div className="p-2 border-b border-white/10 flex justify-between items-center bg-white/5">
                                                <span className="text-[10px] text-white/50 uppercase tracking-widest">Document Preview</span>
                                                <a href={activeProject.link} target="_blank" className="text-[10px] text-amber-500 hover:text-amber-400 underline uppercase tracking-widest">Full Screen</a>
                                            </div>
                                            <iframe
                                                src={`${activeProject.link}#navpanes=0&toolbar=0&view=FitH`}
                                                className="w-full h-[500px]"
                                                title={activeProject.name}
                                            />
                                        </div>
                                    ) : (() => {
                                        const isUnembeddable =
                                            activeProject.link.includes('amazon.com') ||
                                            activeProject.link.includes('redbubble.com') ||
                                            activeProject.link.includes('youtube.com') ||
                                            activeProject.link.includes('pages.dev') ||
                                            activeProject.link.includes('drive.google.com');

                                        if (isUnembeddable) {
                                            return (
                                                <a
                                                    href={activeProject.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-8 block w-full py-4 bg-amber-600 hover:bg-amber-500 text-black text-center font-bold uppercase tracking-wider transition-colors rounded"
                                                >
                                                    {activeProject.id.includes('book') ? 'View on Amazon' :
                                                        activeProject.type === 'merch' ? 'Visit Store' :
                                                            activeProject.link.includes('youtube') ? 'Watch on YouTube' : 'Launch Experience'}
                                                </a>
                                            );
                                        }

                                        return (
                                            <div className="mt-4 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                                                <div className="p-2 border-b border-white/10 flex justify-between items-center bg-white/5">
                                                    <span className="text-[10px] text-white/50 uppercase tracking-widest">Live Preview</span>
                                                    <a href={activeProject.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-500 hover:text-amber-400 underline uppercase tracking-widest">Open Site</a>
                                                </div>
                                                <iframe
                                                    src={activeProject.link}
                                                    className="w-full h-[500px] border-0 bg-white shadow-inner"
                                                    title={activeProject.name}
                                                />
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Panel - Opens below header */}
            <AnimatePresence>
                {showNav && (
                    <motion.div
                        initial={{ y: '-20px', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '-20px', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="pointer-events-auto fixed top-20 md:top-24 left-4 md:left-12 z-30 w-[calc(100vw-2rem)] md:w-72 max-h-[60vh] overflow-y-auto bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-2xl"
                    >
                        <div className="mb-3 text-xs uppercase tracking-widest text-white/50">Quick Navigation</div>

                        {/* Sun/CV */}
                        <button
                            onClick={() => { setActivePlanet('cv-core'); setFocusedPlanet(null); setShowNav(false); }}
                            className={`w-full text-left px-3 py-3 rounded transition-all flex items-center justify-between group ${activePlanetId === 'cv-core' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50' : 'text-amber-500/80 hover:bg-amber-500/10 border border-amber-500/10'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">☀️</span>
                                <span className="text-sm font-bold tracking-tight">Core Profile (CV)</span>
                            </div>
                        </button>

                        {/* Planets - Direct open for mobile friendliness */}
                        <div className="space-y-1 mt-3">
                            {projects.map((project, index) => (
                                <button
                                    key={project.id}
                                    onClick={() => {
                                        setFocusedPlanet(project.id);
                                        setActivePlanet(project.id);
                                        setShowNav(false);
                                    }}
                                    className={`w-full text-left px-3 py-3 rounded transition-all flex items-center justify-between group ${activePlanetId === project.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono opacity-50 group-hover:opacity-100 transition-opacity">{(index + 1).toString().padStart(2, '0')}</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold tracking-tight">
                                                {project.name}
                                                {project.status === 'in-progress' && <span className="ml-2 text-[10px] text-amber-500 font-normal">(WIP)</span>}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-widest opacity-40 group-hover:opacity-60 transition-opacity">{project.type}</span>
                                        </div>
                                    </div>
                                    {activePlanetId === project.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Guide Early Loading Container */}
            <div className={`pointer-events-auto absolute bottom-8 left-8 z-40 flex flex-col items-start gap-4 transition-all duration-500 ease-in-out ${showGuide ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                <div className="w-[calc(100vw-4rem)] md:w-[400px] h-[650px] bg-black/80 backdrop-blur-xl border border-amber-500/30 rounded-lg overflow-hidden shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b border-amber-500/20 bg-amber-500/5">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Aibo Guide Interface
                        </span>
                        <a
                            href="https://project-aibo.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-white/50 hover:text-white hover:underline mr-4"
                        >
                            Open Externally
                        </a>
                    </div>
                    <div className="flex-1 relative bg-black/50">
                        <iframe
                            src="https://project-aibo.vercel.app/?embed=true&noAudio=true&voice=false&silent=true&muted=true&autoSpeak=false"
                            className="absolute inset-0 w-full h-full border-0"
                            title="Project Aibo Avatar"
                            allow="camera"
                        />
                    </div>
                </div>
            </div>

            {/* AI Guide Toggle */}
            <div className="pointer-events-auto absolute bottom-8 left-8 z-50">
                <button
                    onClick={() => setShowGuide(!showGuide)}
                    className={`group flex items-center gap-3 px-5 py-3 rounded-full border backdrop-blur-md transition-all shadow-lg ${showGuide
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                        : 'bg-black/60 border-white/20 text-white hover:border-amber-500/50 hover:text-amber-400'
                        }`}
                >
                    <span className="text-xs font-bold uppercase tracking-widest">
                        {showGuide ? 'Close Guide' : 'Ask Aibo'}
                    </span>
                    <div className={`w-3 h-3 rounded-full border ${showGuide ? 'bg-amber-500 border-amber-500' : 'bg-transparent border-current group-hover:bg-amber-400 group-hover:border-amber-400'}`} />
                </button>
            </div>
        </div>
    );
}
