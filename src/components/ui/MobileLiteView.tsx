'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { projects } from '@/data/projects';
import { profile } from '@/data/profile';

const MobileLiteView = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-amber-500/30 overflow-x-hidden">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full" />
            </div>

            <main className="relative z-10 p-6 pt-12 max-w-lg mx-auto">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12"
                >
                    <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-widest text-amber-500 uppercase bg-amber-500/10 rounded-full border border-amber-500/20">
                        Solar Punk Portfolio (Lite)
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                        {profile.name}
                    </h1>
                    <p className="text-lg text-slate-400 font-medium leading-tight mb-4">
                        {profile.title}
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                        {profile.bio}
                    </p>
                </motion.header>

                {/* Projects Section */}
                <section className="space-y-6">
                    <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400 mb-6">Explore the System</h2>

                    {projects.map((project, index) => {
                        const isExternal = project.link?.startsWith('http');
                        const cardContent = (
                            <>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                            style={{ backgroundColor: project.emissiveColor || '#fff', boxShadow: `0 0 15px ${project.emissiveColor}44` }}
                                        />
                                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                                            {project.name}
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-500/10 px-2 py-0.5 rounded-md border border-slate-500/20">
                                        {project.type}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">
                                    {project.description}
                                </p>

                                <div className="flex items-center text-xs font-semibold text-amber-500/80 group-hover:text-amber-400 transition-colors">
                                    View Project
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </>
                        );

                        const className = "block p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300";

                        return (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                viewport={{ once: true }}
                                className="group relative"
                            >
                                {isExternal ? (
                                    <a href={project.link} target="_blank" rel="noopener noreferrer" className={className}>
                                        {cardContent}
                                    </a>
                                ) : (
                                    <Link href={project.link || '#'} className={className}>
                                        {cardContent}
                                    </Link>
                                )}
                            </motion.div>
                        );
                    })}
                </section>

                {/* Footer */}
                <footer className="mt-20 mb-10 text-center">
                    <p className="text-xs text-slate-600">
                        &copy; {new Date().getFullYear()} Adam M. Raman. All rights reserved.
                    </p>
                    <div className="mt-4 flex justify-center gap-4 text-xs font-medium text-slate-500">
                        <Link href="/" className="hover:text-amber-500 transition-colors">Try Full 3D Experience</Link>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default MobileLiteView;
