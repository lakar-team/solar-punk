import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Malaysia-Japan Bridge | Adam M. Raman',
    description: 'Reviving the dormant Malaysia-Sendai business community (4 years inactive after COVID) through a cooking event in partnership with Sendai Gas. 2025.',
};

export default function MalaysiaJapanBridgePage() {
    return (
        <div className="min-h-screen bg-[#0a0700] text-white overflow-x-hidden">
            {/* Fine dot pattern */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(251,146,60,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                }}
            />
            {/* Warm orange ambient */}
            <div className="fixed top-[-100px] right-[-50px] w-[700px] h-[500px] rounded-full bg-orange-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-amber-600/4 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-orange-400 transition-colors text-xs uppercase tracking-widest">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-300 shadow-[0_0_8px_rgba(251,146,60,0.9)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-orange-300/70">Cultural Diplomacy · Sendai · 2025</span>
                </div>
                <h1 className="text-[clamp(3rem,9vw,7rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-100/90 to-orange-400/50 mb-6">
                    Malaysia-Japan<br />Bridge
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    Reviving the Sendai-Malaysia Connection · 2025
                </p>
            </section>

            {/* Story */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="relative bg-orange-500/5 border border-orange-500/20 rounded-3xl p-8 md:p-10 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-orange-500/10" />
                    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full border border-orange-500/15" />
                    <div className="relative max-w-2xl space-y-5 text-gray-300 leading-relaxed">
                        <p>
                            The Malaysian community in Sendai had gone quiet for four years during COVID. Not dissolved — just dormant.
                            Adam&apos;s visibility through the JIA and Tapio lectures put him in front of people who noticed the gap.
                        </p>
                        <p>
                            Sendai Gas — a company with Malaysia business ties — reached out. They wanted to restart the connection.
                            The question was how.
                        </p>
                        <p>
                            Adam&apos;s answer: food. Malaysia is always about food. So they made a cooking event. Malaysian students
                            came and cooked. The Japanese business community came and ate. What had been frozen for four years
                            thawed over a shared table.
                        </p>
                    </div>
                </div>
            </section>

            {/* Event details card */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Event Details</span>
                </div>
                <div className="bg-white/[0.025] border border-white/8 rounded-2xl p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Partner', value: 'Sendai Gas (Japan-Malaysia trade relations)' },
                            { label: 'Format', value: 'Malaysian cooking event' },
                            { label: 'Participants', value: 'Malaysian students + working Malaysians in Sendai + Sendai business community' },
                            { label: 'Year', value: '2025' },
                            { label: 'Status', value: 'Planned as annual recurring event' },
                        ].map((d, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <span className="text-[10px] uppercase tracking-widest text-white/25 pt-0.5 min-w-24 shrink-0">{d.label}</span>
                                <span className="text-gray-300">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* What this is */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">What This Is</span>
                </div>
                <div className="relative bg-gradient-to-br from-orange-500/8 to-transparent border border-orange-500/15 rounded-2xl p-8 md:p-10 max-w-3xl">
                    <p className="text-lg md:text-xl text-white/80 font-light leading-relaxed">
                        Not a lecture. Not a workshop. Cultural diplomacy through the simplest possible act — eating together.
                        The outcome isn&apos;t a certificate or a citation. It&apos;s a relationship that didn&apos;t exist and now does.
                    </p>
                </div>
            </section>

            {/* Key facts */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Key Facts</span>
                </div>
                <div className="space-y-3">
                    {[
                        'Revived dormant Malaysia-Sendai business community after 4 COVID years',
                        'Partner: Sendai Gas (Japan-Malaysia trade ties)',
                        'Format: Malaysian cooking event — students cook, business community attends',
                        'Planned as a yearly recurring event from 2025',
                    ].map((fact, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-orange-500/5 border border-orange-500/12 rounded-xl">
                            <span className="text-orange-400 shrink-0 mt-0.5">▸</span>
                            <span className="text-gray-300 leading-relaxed">{fact}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Back link */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300 transition-colors">
                    ← Back to Portfolio
                </Link>
            </section>
        </div>
    );
}
