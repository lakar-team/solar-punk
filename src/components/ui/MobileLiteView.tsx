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

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`p-2 rounded-lg border transition-all ${isMenuOpen ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-white/5 border-white/10 text-white'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                        {isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute left-6 right-6 top-20 z-50 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                            >
                                <div className="max-h-[60vh] overflow-y-auto scrollbar-hide py-2">
                                    {navItems.map((item, index) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveIndex(index);
                                                setIsMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${activeIndex === index ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:bg-white/5'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-mono opacity-50">{index.toString().padStart(2, '0')}</span>
                                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                                            </div>
                                            {activeIndex === index && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
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

                        {/* Prev Button Floating */}
                        <button
                            onClick={prevPlanet}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl md:hidden z-20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
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
                        className="inline-block py-2 px-4 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                    >
                        View Full CV
                    </Link>
                </section>

                <footer className="mt-16 text-center">
                    <p className="text-[10px] text-slate-600 font-medium">
                        &copy; {new Date().getFullYear()} ADAM M. RAMAN &bull; SOLAR PUNK INFRASTRUCTURE
                    </p>
                </footer>
            </main>

            {/* Aibo Guide Integration */}
            <div className={`fixed bottom-0 left-0 right-0 z-[60] transition-transform duration-500 ease-in-out ${showAibo ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'}`}>
                <div className="max-w-lg mx-auto px-6">
                    <div className="bg-black/90 backdrop-blur-2xl border-t border-x border-amber-500/30 rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col h-[70vh]">
                        {/* Toggle Bar */}
                        <button
                            onClick={() => setShowAibo(!showAibo)}
                            className="w-full py-6 flex flex-col items-center justify-center gap-2 border-b border-white/5 active:bg-white/5 transition-colors group"
                        >
                            <div className="w-12 h-1 bg-white/10 rounded-full mb-1 group-hover:bg-amber-500/30 transition-colors" />
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                                    {showAibo ? 'Collapse Guide' : 'Ask Aibo Assistant'}
                                </span>
                            </div>
                        </button>

                        {/* Chat Container */}
                        <div className="flex-1 relative bg-black/50">
                            {/* Always loaded in background */}
                            <iframe
                                src="https://project-aibo.vercel.app/?embed=true&mobile=true&chatOnly=true"
                                className="absolute inset-0 w-full h-full border-0"
                                title="Aibo Assistant"
                                allow="camera" // No audio needed per user request
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Initial Ask Aibo Floating Button (Only visible when collapsed and not shown initially) */}
            <AnimatePresence>
                {!showAibo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed bottom-8 right-6 z-[70] md:hidden"
                    >
                        <button
                            onClick={() => setShowAibo(true)}
                            className="flex items-center gap-3 px-5 py-3 rounded-full bg-amber-500 border border-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all"
                        >
                            <span className="text-xs font-bold uppercase tracking-widest">Ask Aibo</span>
                            <div className="w-2 h-2 rounded-full bg-black animate-pulse" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default MobileLiteView;
