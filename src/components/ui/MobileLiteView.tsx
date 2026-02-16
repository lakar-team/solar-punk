'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { projects } from '@/data/projects';
import { profile } from '@/data/profile';

// Dynamic import for PlanetPreview
const PlanetPreview = dynamic(() => import('./PlanetPreview'), { ssr: false });

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

            <main className="relative z-10 p-6 pt-8 max-w-lg mx-auto pb-24">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center mb-4">
                        <div className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest text-amber-500 uppercase bg-amber-500/10 rounded-full border border-amber-500/20">
                            Mobile Link System
                        </div>
                        <Link
                            href="/?force=desktop"
                            onClick={handleTryFull3D}
                            className="text-[10px] text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-widest font-bold"
                        >
                            Full 3D
                        </Link>
                    </div>
                </motion.header>

                {/* Planet Navigator Showcase */}
                <section className="mb-12">
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
                                        <div className="h-48 md:h-56 w-full py-4">
                                            {activeItem.id === 'cv-core' ? (
                                                <div className="w-full h-full flex items-center justify-center relative">
                                                    <div className="w-24 h-24 rounded-full bg-amber-400 blur-sm animate-pulse" />
                                                    <div className="absolute w-20 h-20 rounded-full bg-orange-500 blur-xl opacity-50" />
                                                    <div className="absolute w-28 h-28 rounded-full border border-amber-500/20 animate-spin-slow" />
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
                                                        {activeItem.id === 'cv-core' ? 'View Profile' : 'Launch Project'}
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

                        {/* Prev Button Floating */}
                        <button
                            onClick={prevPlanet}
                            className="absolute -left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl md:hidden"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex justify-center gap-1.5">
                        {navItems.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`h-1 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-amber-500' : 'w-1.5 bg-slate-700'}`}
                            />
                        ))}
                    </div>
                </section>

                {/* Quick List Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-bold tracking-widest uppercase text-slate-500">System Index</h3>
                        <span className="text-[10px] font-mono text-slate-600">{navItems.length} Nodes detected</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {navItems.map((item, index) => (
                            <motion.button
                                key={item.id}
                                onClick={() => setActiveIndex(index)}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                viewport={{ once: true }}
                                className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${index === activeIndex
                                        ? 'bg-amber-500/10 border-amber-500/30'
                                        : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05]'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border"
                                        style={{
                                            borderColor: index === activeIndex ? `${item.emissiveColor}44` : 'white/10',
                                            color: item.emissiveColor || '#fff',
                                            backgroundColor: `${item.emissiveColor}11`
                                        }}
                                    >
                                        {item.id === 'cv-core' ? '☀️' : index}
                                    </div>
                                    <div className="text-left">
                                        <h4 className={`text-sm font-bold transition-colors ${index === activeIndex ? 'text-amber-400' : 'text-slate-300'}`}>
                                            {item.name}
                                        </h4>
                                        <span className="text-[9px] uppercase tracking-wider text-slate-500">
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                                {index === activeIndex && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </section>


                {/* Profile Peek */}
                <section className="mt-20 p-6 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
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
        </div>
    );
};


export default MobileLiteView;
