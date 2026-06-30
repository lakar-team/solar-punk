'use client';

import { useStore } from '@/store/useStore';
import { projects, categories } from '@/data/projects';
import { profile } from '@/data/profile';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Three.js
const PlanetPreview = dynamic(() => import('./PlanetPreview'), { ssr: false });
const SunPreview = dynamic(() => import('./SunPreview'), { ssr: false });
const AiboPanel = dynamic(() => import('./AiboPanel'), { ssr: false });

export default function HUD() {
    const { activePlanetId, setActivePlanet, setFocusedPlanet, viewMode, setViewMode, focusedCategoryId, setFocusedCategory, returnToSolar } = useStore();
    const [showNav, setShowNav] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [showEmailPopover, setShowEmailPopover] = useState(false);
    const [emailCopied, setEmailCopied] = useState(false);

    const copyEmail = () => {
        navigator.clipboard.writeText('adam.m.raman@gmail.com').then(() => {
            setEmailCopied(true);
            setTimeout(() => setEmailCopied(false), 2000);
        });
    };

    const activeProject = projects.find(p => p.id === activePlanetId);
    const isCVView = activePlanetId === 'cv-core';

    const focusedCategory = categories.find(c => c.id === focusedCategoryId) ?? null;
    const focusedCategoryProjects = focusedCategory
        ? projects.filter(p => p.category === focusedCategoryId)
        : [];
    const showCategoryCard = viewMode === 'lunar' && focusedCategory && !activePlanetId;

    // Unified Navigation List (Sun + Projects)
    const navItems = [{ id: 'cv-core', type: 'core' }, ...projects];

    // Panel navigation — category-aware in lunar view, global in solar view
    const handleNext = () => {
        if (!activePlanetId) return;
        if (viewMode === 'lunar' && focusedCategoryId) {
            const catProjects = projects.filter(p => p.category === focusedCategoryId);
            const idx = catProjects.findIndex(p => p.id === activePlanetId);
            if (idx !== -1) setActivePlanet(catProjects[(idx + 1) % catProjects.length].id);
            return;
        }
        const currentIndex = navItems.findIndex(item => item.id === activePlanetId);
        if (currentIndex !== -1) setActivePlanet(navItems[(currentIndex + 1) % navItems.length].id);
    };

    const handlePrev = () => {
        if (!activePlanetId) return;
        if (viewMode === 'lunar' && focusedCategoryId) {
            const catProjects = projects.filter(p => p.category === focusedCategoryId);
            const idx = catProjects.findIndex(p => p.id === activePlanetId);
            if (idx !== -1) setActivePlanet(catProjects[(idx - 1 + catProjects.length) % catProjects.length].id);
            return;
        }
        const currentIndex = navItems.findIndex(item => item.id === activePlanetId);
        if (currentIndex !== -1) setActivePlanet(navItems[(currentIndex - 1 + navItems.length) % navItems.length].id);
    };

    const handleCatNext = () => {
        const idx = categories.findIndex(c => c.id === focusedCategoryId);
        if (idx === -1) return;
        if (idx === categories.length - 1) {
            setViewMode('solar');
            setFocusedCategory(null);
            setActivePlanet('cv-core');
        } else {
            setFocusedCategory(categories[idx + 1].id);
        }
    };

    const handleCatPrev = () => {
        const idx = categories.findIndex(c => c.id === focusedCategoryId);
        if (idx === -1) return;
        if (idx === 0) {
            setViewMode('solar');
            setFocusedCategory(null);
            setActivePlanet('cv-core');
        } else {
            setFocusedCategory(categories[idx - 1].id);
        }
    };

    const handleSunNext = () => {
        setActivePlanet(null);
        setViewMode('lunar');
        setFocusedCategory('architecture');
    };

    const handleSunPrev = () => {
        setActivePlanet(null);
        setViewMode('lunar');
        setFocusedCategory('products');
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
                {/* Contact Links + Helper Hint */}
                <div className="flex items-center gap-4">
                    {!activePlanetId && (
                        <div className="text-sm text-white/50 animate-pulse hidden md:block">
                            Click the sun or a planet to explore
                        </div>
                    )}
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <div className="relative">
                            <button
                                onClick={() => setShowEmailPopover(v => !v)}
                                title="Contact Adam"
                                className="text-white/40 hover:text-amber-400 transition-colors p-1"
                                aria-label="Show email address"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </button>
                            <AnimatePresence>
                                {showEmailPopover && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-9 z-50 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-3 flex items-center gap-3 shadow-2xl min-w-max"
                                    >
                                        <span className="text-xs text-amber-400 font-mono">adam.m.raman@gmail.com</span>
                                        <button
                                            onClick={copyEmail}
                                            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 transition-colors"
                                        >
                                            {emailCopied ? '✓ Copied' : 'Copy'}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <a
                            href="https://www.linkedin.com/in/adam-raman/"
                            target="_blank"
                            rel="noopener noreferrer"
                            title="LinkedIn"
                            className="text-white/40 hover:text-amber-400 transition-colors p-1"
                            aria-label="LinkedIn profile"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect x="2" y="9" width="4" height="12" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </a>
                    </div>
                </div>
            </header>

            {/* Lunar view breadcrumb — floats below header */}
            <AnimatePresence>
                {viewMode === 'lunar' && (
                    <motion.div
                        key="lunar-breadcrumb"
                        initial={{ y: -16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -16, opacity: 0 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                        className="pointer-events-auto absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3"
                    >
                        <button
                            onClick={returnToSolar}
                            className="flex items-center gap-2 px-4 py-1.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-full text-xs uppercase tracking-widest text-white/60 hover:text-white hover:border-amber-500/40 transition-all"
                        >
                            ← Solar System
                        </button>
                        {focusedCategoryId && (
                            <span className="text-xs text-white/30 uppercase tracking-widest">
                                / {categories.find(c => c.id === focusedCategoryId)?.name}
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

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
                                onClick={() => { setActivePlanet(null); if (viewMode === 'solar') setFocusedPlanet(null); }}
                                className="rounded-full border border-amber-500/30 px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-amber-500/10 transition-colors text-amber-400"
                            >
                                ← Return to Orbit
                            </button>

                            {/* Panel Navigation for Sun View — Sun ‹ Products | Architecture › */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSunPrev}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-amber-500/20 hover:bg-amber-500/10 text-amber-500/80 hover:text-amber-400 transition-colors"
                                    aria-label="Products (previous)"
                                    title="Products"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={handleSunNext}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border border-amber-500/20 hover:bg-amber-500/10 text-amber-500/80 hover:text-amber-400 transition-colors"
                                    aria-label="Architecture (next)"
                                    title="Architecture"
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

                            {/* Two-track career summary */}
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-lg">
                                    <div className="text-[10px] uppercase tracking-widest text-amber-500/60 mb-1">Built Environment</div>
                                    <p className="text-sm text-white/70 leading-relaxed">
                                        Architect & founder — 10+ years spanning award-winning master plans, a design-build firm scaled to ¥42M, and a PhD in climate-conscious building science at Tohoku University.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-500/8 border border-amber-500/20 rounded-lg">
                                    <div className="text-[10px] uppercase tracking-widest text-amber-500/60 mb-1">Digital & AI</div>
                                    <p className="text-sm text-white/70 leading-relaxed">
                                        5 years building precision tools — hydraulic engineering suites, RAG-based AI, VTuber mocap rigs, and IoT-integrated smart environments.
                                    </p>
                                </div>
                            </div>

                            <a
                                href="/about"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-4 bg-amber-600 hover:bg-amber-500 text-black text-center font-bold uppercase tracking-wider transition-colors rounded"
                            >
                                Explore My Background →
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Intro Card — shown when a category planet is entered but no moon selected */}
            <AnimatePresence>
                {showCategoryCard && focusedCategory && (
                    <motion.div
                        key={`cat-${focusedCategory.id}`}
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="pointer-events-auto absolute right-0 top-0 bottom-0 w-full md:w-[480px] bg-black/60 backdrop-blur-md shadow-2xl flex flex-col overflow-y-auto"
                        style={{ borderLeft: `1px solid ${focusedCategory.color}28` }}
                    >
                        <div className="flex justify-between items-center p-8 pb-0">
                            <button
                                onClick={returnToSolar}
                                className="rounded-full px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-white/10 transition-colors border"
                                style={{ borderColor: `${focusedCategory.color}40`, color: focusedCategory.color }}
                            >
                                ← Solar System
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCatPrev}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-white/10 transition-colors"
                                    style={{ borderColor: `${focusedCategory.color}30`, color: `${focusedCategory.color}cc` }}
                                    aria-label="Previous Category"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={handleCatNext}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-white/10 transition-colors"
                                    style={{ borderColor: `${focusedCategory.color}30`, color: `${focusedCategory.color}cc` }}
                                    aria-label="Next Category"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col p-8 pt-6 space-y-6">
                            {/* Badge + title */}
                            <div>
                                <span
                                    className="inline-block px-2 py-1 rounded text-[10px] uppercase tracking-wider mb-3 border"
                                    style={{
                                        background: `${focusedCategory.color}18`,
                                        borderColor: `${focusedCategory.color}40`,
                                        color: focusedCategory.color,
                                    }}
                                >
                                    {focusedCategory.name} · {focusedCategoryProjects.length} Projects
                                </span>
                                <h2
                                    className="text-4xl md:text-5xl font-bold mb-2"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, #ffffff, ${focusedCategory.color}bb)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {focusedCategory.name}
                                </h2>
                            </div>

                            <div className="h-px" style={{ background: `linear-gradient(to right, ${focusedCategory.color}50, transparent)` }} />

                            <p className="text-base text-gray-300 leading-relaxed">
                                {focusedCategory.description}
                            </p>

                            {/* Project name chips */}
                            <div>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Projects in this cluster</p>
                                <div className="flex flex-wrap gap-2">
                                    {focusedCategoryProjects.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setActivePlanet(p.id)}
                                            className="px-2.5 py-1 rounded-full text-xs border cursor-pointer transition-all hover:text-white"
                                            style={{ borderColor: `${focusedCategory.color}28`, color: 'rgba(255,255,255,0.55)' }}
                                        >
                                            {p.name}
                                            {p.status === 'in-progress' && (
                                                <span className="ml-1 text-[9px] text-amber-400">WIP</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Hint */}
                            <div
                                className="flex items-center gap-3 text-sm pb-4"
                                style={{ color: `${focusedCategory.color}90` }}
                            >
                                <span
                                    className="w-2 h-2 rounded-full animate-pulse shrink-0"
                                    style={{ background: focusedCategory.color }}
                                />
                                Select a moon to explore a project
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
                                onClick={() => setActivePlanet(null)}
                                className="rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                ← Close
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

                            {/* Inline image gallery */}
                            {activeProject.images && activeProject.images.length > 0 && (
                                <div className={`mt-4 grid gap-2 ${activeProject.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                    {activeProject.images.map((src, i) => (
                                        <div key={i} className="rounded-lg overflow-hidden border border-white/10 bg-black/30">
                                            <img
                                                src={src}
                                                alt={`${activeProject.name} — ${i + 1}`}
                                                className="w-full h-40 object-cover"
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Single thumbnail (only when no images array) */}
                            {activeProject.image && !activeProject.images && (
                                <div className="mt-4 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex justify-center items-center">
                                    <img
                                        src={activeProject.image}
                                        alt={activeProject.name}
                                        className="max-w-full max-h-[500px] object-contain"
                                        loading="lazy"
                                    />
                                </div>
                            )}

                            {/* Key Facts */}
                            {activeProject.keyFacts && activeProject.keyFacts.length > 0 && (
                                <div className="space-y-2">
                                    {activeProject.keyFacts.map((fact, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                            <span className="mt-0.5 text-amber-500 shrink-0">▸</span>
                                            <span>{fact}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Secondary Links (non-PDF) */}
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

                            {/* Explore button for projects with dedicated detail pages */}
                            {activeProject.detailPage && (
                                <a
                                    href={activeProject.detailPage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-amber-500/40 text-white hover:text-amber-300 text-center font-bold uppercase tracking-wider transition-colors rounded"
                                >
                                    Explore →
                                </a>
                            )}

                            {/* Sidebar Screenshot Preview (Overrides Live Preview) */}
                            {activeProject.sidebarScreenshot && (
                                <div className="mt-4 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                                    <div className="p-2 border-b border-white/10 flex justify-between items-center bg-white/5">
                                        <span className="text-[10px] text-white/50 uppercase tracking-widest">Interface Preview</span>
                                        {activeProject.link && (
                                            <a href={activeProject.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-500 hover:text-amber-400 underline uppercase tracking-widest">Open Site</a>
                                        )}
                                    </div>
                                    <div className="bg-white group/ss relative">
                                        <img
                                            src={activeProject.sidebarScreenshot}
                                            alt={`${activeProject.name} Interface`}
                                            className="w-full h-auto object-contain max-h-[600px]"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Project Link - Auto-embed PDF or Site Preview */}
                            {activeProject.link && !activeProject.hideEmbed && (
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
                                            activeProject.link.includes('github.com') ||
                                            activeProject.link.includes('drive.google.com');

                                        if (isUnembeddable) {
                                            return (
                                                <a
                                                    href={activeProject.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-8 block w-full py-4 bg-amber-600 hover:bg-amber-500 text-black text-center font-bold uppercase tracking-wider transition-colors rounded"
                                                >
                                                    {activeProject.id.includes('book') ? 'View on Amazon →' :
                                                        activeProject.type === 'merch' ? 'Visit Store →' :
                                                            activeProject.link.includes('youtube') ? 'Watch on YouTube →' :
                                                                activeProject.link.includes('github.com') ? 'View on GitHub →' : 'Launch Experience →'}
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
                            onClick={() => { setActivePlanet('cv-core'); setShowNav(false); }}
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

            {/* AI Guide Panel — always mounted so conversation + TTS survive minimize */}
            <div className={`pointer-events-auto absolute bottom-8 left-8 z-40 transition-all duration-500 ease-in-out ${showGuide ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}>
                <div className="w-[calc(100vw-4rem)] md:w-[400px] h-[650px] bg-black/80 backdrop-blur-xl border border-amber-500/30 rounded-lg overflow-hidden shadow-2xl flex flex-col">
                    <div className="flex items-center justify-between p-3 border-b border-amber-500/20 bg-amber-500/5">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            Web Witch
                        </span>
                        <button
                            onClick={() => setShowGuide(false)}
                            title="Minimize"
                            className="w-6 h-6 flex items-center justify-center text-amber-400/50 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 min-h-0">
                        <AiboPanel isOpen={showGuide} />
                    </div>
                </div>
            </div>

            {/* Ask Aibo floating button — visible only when panel is minimized */}
            <div className={`pointer-events-auto absolute bottom-8 left-8 z-50 transition-all duration-300 ${showGuide ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button
                    onClick={() => setShowGuide(true)}
                    className="group flex items-center gap-3 px-5 py-3 rounded-full border backdrop-blur-md transition-all shadow-lg bg-black/60 border-white/20 text-white hover:border-amber-500/50 hover:text-amber-400"
                >
                    <span className="text-xs font-bold uppercase tracking-widest">Ask Aibo</span>
                    <div className="w-3 h-3 rounded-full border bg-transparent border-current group-hover:bg-amber-400 group-hover:border-amber-400" />
                </button>
            </div>
        </div>
    );
}
