import Link from 'next/link';
import { projects } from '@/data/projects';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'VTube Mocap | Adam M. Raman',
    description: 'Browser-based VTuber motion capture — MediaPipe face, pose, and hand tracking driving a rigged GLB character model.',
};

export default function VTubeMocapPage() {
    const project = projects.find(p => p.id === 'vtube-mocap')!;

    return (
        <div className="min-h-screen bg-[#08080f] text-white overflow-x-hidden">
            {/* Subtle grid background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(232,121,249,0.04) 1px, transparent 1px), linear-gradient(to right, rgba(232,121,249,0.04) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }}
            />
            <div className="fixed top-[-200px] right-[-100px] w-[800px] h-[600px] rounded-full bg-fuchsia-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-purple-500/4 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-fuchsia-400 transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(232,121,249,0.8)] animate-pulse" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-fuchsia-400/70">Digital · VTuber Tooling · In Development</span>
                </div>
                <h1 className="text-[clamp(4rem,12vw,9rem)] font-black leading-[0.88] text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-fuchsia-400/50 mb-8">
                    VTube<br />Mocap
                </h1>
                <div className="max-w-2xl">
                    <p className="text-lg text-gray-400 leading-relaxed">
                        {project.description}
                    </p>
                </div>
            </section>

            {/* Key facts */}
            <div className="border-y border-white/8 bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {[
                        { value: 'MediaPipe', label: 'Tracking Engine', sub: 'face, pose, hands' },
                        { value: 'GLB', label: 'Avatar Format', sub: 'rigged character models' },
                        { value: 'WIP', label: 'Status', sub: 'active development' },
                        { value: 'AIBO', label: 'Motor Core For', sub: 'AI avatar system' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-4xl md:text-5xl font-black text-fuchsia-400 leading-none">{s.value}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2">{s.label}</div>
                            <div className="text-[11px] text-white/25 mt-1">{s.sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* System Architecture */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">System Architecture</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'Face Tracking Layer',
                            color: '#e879f9',
                            items: [
                                'MediaPipe face landmark detection',
                                'Lip sync — viseme generation from audio',
                                'Eyebrow, eye lid, and jaw control',
                                'Head rotation tracking (pitch, yaw, roll)',
                            ],
                        },
                        {
                            title: 'Body Tracking Layer',
                            color: '#a855f7',
                            items: [
                                'MediaPipe full-body pose landmarks',
                                'Shoulder, elbow, wrist → IK bone chains',
                                'Individual finger tracking via MediaPipe Hands',
                                'Idle animation blending when static',
                            ],
                        },
                        {
                            title: 'Avatar Runtime',
                            color: '#c084fc',
                            items: [
                                'GLB model loading and bone mapping',
                                'Runs entirely in-browser — no install',
                                'Procedural physics for hair / accessories',
                                'Integrates as Motor Core in AIBO system',
                            ],
                        },
                    ].map((arch, i) => (
                        <div key={i} className="p-6 bg-white/[0.025] border border-white/8 rounded-2xl hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: arch.color }} />
                                <span className="text-[10px] uppercase tracking-widest" style={{ color: arch.color }}>{arch.title}</span>
                            </div>
                            <ul className="space-y-2.5">
                                {arch.items.map((item, j) => (
                                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-400 leading-relaxed">
                                        <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full bg-white/20" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Key facts strip */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Project Highlights</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.keyFacts?.map((fact, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-fuchsia-500/5 border border-fuchsia-500/15 rounded-xl">
                            <span className="text-fuchsia-500 shrink-0 mt-0.5">▸</span>
                            <span className="text-gray-300 text-sm leading-relaxed">{fact}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Open App CTA */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-fuchsia-500/5 border border-fuchsia-500/15 rounded-2xl">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-fuchsia-400/60 mb-2">Try It Live</div>
                        <h3 className="text-xl font-bold text-white mb-2">Launch VTube Mocap in your browser</h3>
                        <p className="text-sm text-gray-400">No install required — grant camera access and start streaming.</p>
                    </div>
                    <a
                        href="https://vtubemaker.pages.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 px-8 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-center font-bold uppercase tracking-wider transition-colors rounded-xl"
                    >
                        Launch App →
                    </a>
                </div>
            </section>
        </div>
    );
}
