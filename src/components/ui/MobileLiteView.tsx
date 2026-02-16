'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { projects } from '@/data/projects';
import { profile } from '@/data/profile';
import { Canvas } from '@react-three/fiber';

// Dynamic import for PlanetPreview
const PlanetPreview = dynamic(() => import('./PlanetPreview'), { ssr: false });

const SunPreview = dynamic(() => import('./SunPreview'), { ssr: false });

const MobileLiteView = () => {
    // Add Core Profile as the first item
    const navItems = [
        {
            id: 'cv-core',
            name: profile.name,
            type: 'core',
            description: profile.bio,
            emissiveColor: '#fbbf24', // Sun color
            link: '/Adam_Tech_CV.pdf',
            status: 'complete'
        },
        ...projects
    ];

    const [activeIndex, setActiveIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAibo, setShowAibo] = useState(false);
    const activeItem = navItems[activeIndex];

    const nextPlanet = () => {
        setActiveIndex((prev) => (prev + 1) % navItems.length);
    };

    const prevPlanet = () => {
        setActiveIndex((prev) => (prev - 1 + navItems.length) % navItems.length);
    };


    const handleTryFull3D = () => {
        localStorage.setItem('forceDesktop', 'true');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 p-6 pt-8 max-w-lg mx-auto pb-32">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center">
                        <div className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest text-amber-500 uppercase bg-amber-500/10 rounded-full border border-amber-500/20">
                            Mobile Link System
                        </div>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/?force=desktop"
                                onClick={handleTryFull3D}
                                className="text-[10px] text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-widest font-bold"
                            >
                                Full 3D
                            </Link>
                        </div>
                    </div>
                </motion.header>

                {/* Planet Navigator Showcase */}
                <section className="mb-8">
                    <div className="relative mb-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeItem.id}
                                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            >
                                <div className="p-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl">
                                    <div className="overflow-hidden rounded-[22px] bg-black/40 backdrop-blur-xl">
                                        <div className="h-48 md:h-56 w-full py-2">
                                            {activeItem.id === 'cv-core' ? (
                                                <div className="w-full h-full">
                                                    <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                                                        <SunPreview />
                                                    </Canvas>
                                                </div>
                                            ) : (
                                                <PlanetPreview project={activeItem as any} />
                                            )}
                                        </div>

                                        <div className="p-6 pt-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: activeItem.emissiveColor || '#fff', boxShadow: `0 0 10px ${activeItem.emissiveColor}` }}
                                                />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
                                                    {activeItem.type}
                                                </span>
                                            </div>

                                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                                                {activeItem.name}
                                            </h2>

                                            <p className="text-sm text-slate-400 leading-relaxed min-h-[4.5rem]">
                                                {activeItem.description}
                                            </p>

                                            <div className="mt-6 flex gap-3">
                                                <button
                                                    onClick={prevPlanet}
                                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>

                                                {activeItem.link && (
                                                    <a
                                                        href={activeItem.link}
                                                        target={activeItem.link.startsWith('http') ? '_blank' : '_self'}
                                                        className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-black text-center text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                                    >
                                                        {activeItem.id === 'cv-core' ? 'View Profile' : 'View Project'}
                                                    </a>
                                                )}

                                                <button
                                                    onClick={nextPlanet}
                                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors"
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

                        {/* Pagination Overlay Dots */}
                        <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-1.5 focus:outline-none overflow-hidden py-4">
                            {navItems.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'w-1.5 bg-slate-700'}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>


                {/* Profile Peek */}
                <section className="mt-16 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                    <h3 className="text-xl font-bold text-white mb-2">{profile.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                        {profile.title}
                    </p>
                    <Link
                        href="/Adam_Tech_CV.pdf"
                        target="_blank"
                        className="inline-block py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                    >
                        View Full CV
                    </Link>
                </section>

                {/* Dropdown / System Index Section */}
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
                            <span className="text-[10px] font-mono opacity-50">{navItems.length} Nodes</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-4 w-4 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
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
                                className="overflow-hidden mt-4 space-y-3"
                            >
                                {navItems.map((item, index) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveIndex(index);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        className={`w-full text-left p-5 rounded-2xl border transition-all group ${activeIndex === index ? 'bg-amber-500/10 border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition-colors ${activeIndex === index ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-white/10 bg-white/5 text-slate-500'}`}>
                                                    {item.id === 'cv-core' ? '☀️' : (index).toString().padStart(2, '0')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className={`text-sm font-bold transition-colors ${activeIndex === index ? 'text-amber-400' : 'text-slate-300'}`}>
                                                        {item.name}
                                                    </h4>
                                                    <span className="text-[9px] uppercase tracking-wider opacity-50">{item.type}</span>
                                                </div>
                                            </div>
                                            {activeIndex === index && (
                                                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b]" />
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed pl-11">
                                            {item.description}
                                        </p>
                                    </button>
                                ))}
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

            {/* Aibo Guide Integration */}
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
                                {/* Toggle Bar */}
                                <button
                                    onClick={() => setShowAibo(false)}
                                    className="w-full py-6 flex flex-col items-center justify-center gap-2 border-b border-white/5 active:bg-white/5 transition-colors group"
                                >
                                    <div className="w-12 h-1 bg-white/10 rounded-full mb-1 group-hover:bg-amber-500/30 transition-colors" />
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                                            Assistant Active - Collapse
                                        </span>
                                    </div>
                                </button>

                                {/* Chat Container */}
                                <div className="flex-1 relative bg-black/50">
                                    <iframe
                                        src="https://project-aibo.vercel.app/?embed=true&mobile=true&chatOnly=true&noAudio=true&voice=false&silent=true&muted=true&autoSpeak=false"
                                        className="absolute inset-0 w-full h-full border-0"
                                        title="Aibo Assistant"
                                        allow=""
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Aibo Invisible Iframe for background loading */}
            {!showAibo && (
                <div className="hidden">
                    <iframe
                        src="https://project-aibo.vercel.app/?embed=true&mobile=true&chatOnly=true&noAudio=true&voice=false&silent=true&muted=true&autoSpeak=false"
                        title="Aibo Preloader"
                    />
                </div>
            )}

            {/* Floating Ask Aibo Button */}
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
