'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { projects, categories } from '@/data/projects';
import { profile } from '@/data/profile';
import MobileAiboChat from './MobileAiboChat';

const PlanetPreview = dynamic(() => import('./PlanetPreview'), { ssr: false });
const SunPreview = dynamic(() => import('./SunPreview'), { ssr: false });

// Level 1 items: sun + 3 category planets
const solarItems = [
    {
        id: 'cv-core',
        name: profile.name,
        type: 'core' as const,
        description: profile.bio,
        emissiveColor: '#fbbf24',
        link: '/about',
    },
    ...categories.map(c => ({
        id: c.id,
        name: c.name,
        type: 'category' as const,
        description: c.description,
        emissiveColor: c.emissiveColor,
        link: null as string | null,
        texturePath: c.texturePath,
    })),
];

const MobileLiteView = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAibo, setShowAibo] = useState(false);

    // Current level items
    const currentItems = selectedCategoryId
        ? projects
            .filter(p => p.category === selectedCategoryId)
            .map(p => ({ ...p, link: p.link ?? p.detailPage ?? null }))
        : solarItems;

    const safeIndex = Math.min(activeIndex, currentItems.length - 1);
    const activeItem = currentItems[safeIndex];
    const selectedCategory = selectedCategoryId
        ? categories.find(c => c.id === selectedCategoryId) ?? null
        : null;

    const next = () => setActiveIndex(prev => (prev + 1) % currentItems.length);
    const prev = () => setActiveIndex(prev => (prev - 1 + currentItems.length) % currentItems.length);

    const enterCategory = (catId: string) => {
        setSelectedCategoryId(catId);
        setActiveIndex(0);
        setIsMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const exitCategory = () => {
        const catIndex = solarItems.findIndex(i => i.id === selectedCategoryId);
        setSelectedCategoryId(null);
        setActiveIndex(catIndex >= 0 ? catIndex : 0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTryFull3D = () => {
        localStorage.setItem('forceDesktop', 'true');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 p-6 pt-8 max-w-lg mx-auto pb-32">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center">
                        <AnimatePresence mode="wait">
                            {selectedCategory ? (
                                <motion.button
                                    key="back"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    onClick={exitCategory}
                                    className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-amber-500 uppercase"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Back
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="solar-badge"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest text-amber-500 uppercase bg-amber-500/10 rounded-full border border-amber-500/20"
                                >
                                    Solar System
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Link
                            href="/?force=desktop"
                            onClick={handleTryFull3D}
                            className="text-[10px] text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-widest font-bold"
                        >
                            Full 3D
                        </Link>
                    </div>

                    {/* Breadcrumb in lunar view */}
                    {selectedCategory && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest"
                        >
                            <span>Solar System</span>
                            <span>›</span>
                            <span style={{ color: selectedCategory.emissiveColor }}>{selectedCategory.name}</span>
                        </motion.div>
                    )}
                </motion.header>

                {/* Card carousel */}
                <section className="mb-8">
                    <div className="relative mb-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${selectedCategoryId ?? 'solar'}-${activeItem?.id}`}
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            >
                                <div className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl">
                                    <div className="overflow-hidden rounded-[22px] bg-black/40 backdrop-blur-xl">
                                        <div className="h-48 md:h-56 w-full py-2">
                                            {activeItem?.id === 'cv-core' ? (
                                                <SunPreview />
                                            ) : (
                                                <PlanetPreview project={activeItem as any} />
                                            )}
                                        </div>

                                        <div className="p-6 pt-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor: activeItem?.emissiveColor || '#fff',
                                                        boxShadow: `0 0 10px ${activeItem?.emissiveColor}`,
                                                    }}
                                                />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
                                                    {activeItem?.type === 'core' ? 'Profile'
                                                        : activeItem?.type === 'category' ? 'Category'
                                                        : activeItem?.type}
                                                </span>
                                            </div>

                                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                                {activeItem?.name}
                                            </h2>

                                            <p className="text-sm text-slate-400 leading-relaxed min-h-[4.5rem]">
                                                {activeItem?.description}
                                            </p>

                                            <div className="mt-6 flex gap-3">
                                                <button
                                                    onClick={prev}
                                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                                                    aria-label="Previous"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>

                                                {/* Primary action — depends on item type */}
                                                {activeItem?.type === 'category' ? (
                                                    <button
                                                        onClick={() => enterCategory(activeItem.id)}
                                                        className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black text-center text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                                    >
                                                        Enter →
                                                    </button>
                                                ) : activeItem?.link ? (
                                                    <a
                                                        href={activeItem.link}
                                                        target={activeItem.link.startsWith('http') ? '_blank' : '_self'}
                                                        rel="noopener noreferrer"
                                                        className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black text-center text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                                    >
                                                        {activeItem.id === 'cv-core' ? 'View Profile' : 'View Project'}
                                                    </a>
                                                ) : (
                                                    <div className="flex-1" />
                                                )}

                                                <button
                                                    onClick={next}
                                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                                                    aria-label="Next"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Pagination dots */}
                        <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-1.5 overflow-hidden py-4">
                            {currentItems.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === safeIndex ? 'w-6 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'w-1.5 bg-slate-700'}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Profile strip */}
                <section className="mt-16 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                    <h3 className="text-xl font-bold text-white mb-2">{profile.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">{profile.title}</p>
                    <Link
                        href="/Adam_Tech_CV.pdf"
                        target="_blank"
                        className="inline-block py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                    >
                        View Full CV
                    </Link>
                </section>

                {/* System Index — two-tier: categories → moons */}
                <section className="mt-12">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`w-full p-5 rounded-2xl border transition-all flex items-center justify-between shadow-xl ${isMenuOpen ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-white/5 border-white/10 text-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <span className="text-xs font-bold uppercase tracking-widest">System Index</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono opacity-50">{projects.length} Projects</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>

                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-4 space-y-6"
                            >
                                {/* Sun */}
                                <button
                                    onClick={() => { setSelectedCategoryId(null); setActiveIndex(0); setIsMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="w-full text-left p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all flex items-center gap-3"
                                >
                                    <span className="text-xl">☀️</span>
                                    <div>
                                        <p className="text-sm font-bold text-white">{profile.name}</p>
                                        <p className="text-[9px] uppercase tracking-wider text-amber-500/60">Profile · CV</p>
                                    </div>
                                </button>

                                {/* Categories with nested moons */}
                                {categories.map(cat => {
                                    const catProjects = projects
                                        .filter(p => p.category === cat.id)
                                        .map(p => ({ ...p, link: p.link ?? p.detailPage ?? null }));

                                    return (
                                        <div key={cat.id}>
                                            {/* Category row — tap to enter */}
                                            <button
                                                onClick={() => enterCategory(cat.id)}
                                                className="w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between"
                                                style={{ borderColor: `${cat.emissiveColor}30`, backgroundColor: `${cat.emissiveColor}08` }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: cat.emissiveColor, boxShadow: `0 0 8px ${cat.emissiveColor}` }}
                                                    />
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{cat.name}</p>
                                                        <p className="text-[9px] uppercase tracking-wider opacity-40">{catProjects.length} projects</p>
                                                    </div>
                                                </div>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>

                                            {/* Moon rows indented */}
                                            <div className="mt-2 ml-5 space-y-1.5 border-l border-white/[0.06] pl-4">
                                                {catProjects.map(project => (
                                                    <div
                                                        key={project.id}
                                                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.04] transition-all"
                                                    >
                                                        <div
                                                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: project.emissiveColor }}
                                                        />
                                                        <p className="flex-1 text-xs text-slate-400 truncate">{project.name}</p>
                                                        {project.link && (
                                                            <a
                                                                href={project.link}
                                                                target={project.link.startsWith('http') ? '_blank' : '_self'}
                                                                rel="noopener noreferrer"
                                                                className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
                                                                style={{ color: cat.emissiveColor }}
                                                            >
                                                                Open →
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <footer className="mt-16 text-center">
                    <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} ADAM M. RAMAN &bull; SOLAR PUNK INFRASTRUCTURE
                    </p>
                </footer>
            </main>

            {/* AIBO panel */}
            <AnimatePresence>
                {showAibo && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[60]"
                    >
                        <div className="max-w-lg mx-auto px-6">
                            <div className="bg-[#020617]/95 backdrop-blur-2xl border-t border-x border-amber-500/30 rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col h-[75vh]">
                                <button
                                    onClick={() => setShowAibo(false)}
                                    className="w-full py-6 flex flex-col items-center justify-center gap-2 border-b border-white/5 active:bg-white/5 transition-colors group"
                                >
                                    <div className="w-12 h-1 bg-white/10 rounded-full mb-1 group-hover:bg-amber-500/30 transition-colors" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                                            Assistant Active — Collapse
                                        </span>
                                    </div>
                                </button>
                                <div className="flex-1 min-h-0 overflow-hidden">
                                    <MobileAiboChat />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Ask Aibo button */}
            <AnimatePresence>
                {!showAibo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-8 right-6 z-[70]"
                    >
                        <button
                            onClick={() => setShowAibo(true)}
                            className="flex items-center gap-3 px-6 py-4 rounded-full bg-amber-500 border border-amber-400 text-black shadow-[0_10px_30px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest">Ask Aibo</span>
                            <div className="w-2.5 h-2.5 rounded-full bg-black animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileLiteView;
