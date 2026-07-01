import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Architecture Talks | Adam M. Raman',
    description: 'Malaysian Housing Evolution — Then and Now. Delivered at JIA 9th Architecture Salon (Aug 2024) and Tapio Hall Open University (Apr 2025) with live simultaneous interpretation.',
};

export default function ArchitectureTalksPage() {
    const presentationSections = [
        { title: 'Early History of Malay Civilisation', detail: 'Dongsan civilisation, Pacific seafarers, delta settlements — the amphibian habitat of early Malay society.' },
        { title: 'Malacca Straits Settlements', detail: 'Srivijaya → Malacca Empire, colonial Dutch and British influence via the East India Company, the shop-house typology.' },
        { title: 'Kuala Lumpur Origin', detail: 'Founded 1857 at river confluence, tin mining, Frank Swettenham\'s rebuilding — KL\'s urban DNA.' },
        { title: 'Malaysia Mass Housing', detail: 'From kampung to terrace house to high-rise flat. Car-dependency, severed pedestrian networks, social isolation as chronic outcomes.' },
        { title: 'Work Experience', detail: 'S&A Architects, Lakar Design, the PAM Award-winning Denai Alam Phase J15 master plan.' },
        { title: 'Research in Japan', detail: 'Tohoku PhD, desiccant cooling, the Malaysian-Japanese architectural dialogue — what each tradition can learn from the other.' },
    ];

    return (
        <div className="min-h-screen bg-[#070c08] text-white overflow-x-hidden">
            {/* Fine dot pattern */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(134,239,172,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                }}
            />
            {/* Green ambient */}
            <div className="fixed top-[-100px] right-[-50px] w-[700px] h-[500px] rounded-full bg-green-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-emerald-500/4 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-green-400 transition-colors text-xs uppercase tracking-widest">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-300 shadow-[0_0_8px_rgba(134,239,172,0.9)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-green-300/70">Research · Speaker · Architecture</span>
                </div>
                <h1 className="text-[clamp(3rem,9vw,7rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-green-100/90 to-green-400/50 mb-6">
                    Architecture<br />Talks
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    Malaysian Housing History — Two Audiences, Two Cities
                </p>
            </section>

            {/* Two event cards */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* JIA card */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-green-400/60 mb-3">Event 1</p>
                        <h2 className="text-xl font-black text-white mb-2">JIA 9th Architecture Salon</h2>
                        <p className="text-green-300/60 text-sm italic mb-5">Japan Institute of Architects — Miyagi Region</p>
                        <div className="space-y-2">
                            {[
                                { label: 'Date', value: 'August 5, 2024 · 18:30–20:00' },
                                { label: 'Venue', value: 'JIA Tohoku Branch, Sendai' },
                                { label: 'Audience', value: 'Professional architects' },
                                { label: 'Format', value: 'Invited speaker' },
                            ].map((d, i) => (
                                <div key={i} className="flex items-start gap-3 text-xs">
                                    <span className="text-white/25 uppercase tracking-widest min-w-16 shrink-0 pt-0.5">{d.label}</span>
                                    <span className="text-gray-300">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TAPIO card */}
                    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-6">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-green-400/60 mb-3">Event 2</p>
                        <h2 className="text-xl font-black text-white mb-2">Tapio Hall Open University</h2>
                        <p className="text-green-300/60 text-sm italic mb-5">Public lecture with live simultaneous interpretation</p>
                        <div className="space-y-2">
                            {[
                                { label: 'Date', value: 'April 16, 2025 · 19:00–20:00' },
                                { label: 'Venue', value: 'Izumi Park Town, Sendai' },
                                { label: 'Audience', value: 'General public' },
                                { label: 'Format', value: 'Live simultaneous interpretation' },
                            ].map((d, i) => (
                                <div key={i} className="flex items-start gap-3 text-xs">
                                    <span className="text-white/25 uppercase tracking-widest min-w-16 shrink-0 pt-0.5">{d.label}</span>
                                    <span className="text-gray-300">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">The Story</span>
                </div>
                <div className="max-w-3xl space-y-6 text-gray-400 leading-relaxed">
                    <p>
                        The same talk, two very different rooms. At the JIA salon: professional architects who speak
                        architecture as a first language. At Tapio: a shopping mall atrium, two simultaneous interpreters,
                        and a general public who came on a Wednesday evening without any prior technical background.
                    </p>
                    <p>
                        Both rooms asked questions. For Japan, that&apos;s the real measure of engagement — Japanese audiences
                        are famously reserved, and post-talk questions are rare. The interpreter noted it specifically.
                        The content had translated. The talk had done its job.
                    </p>
                </div>
            </section>

            {/* Interpreter quote */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="relative bg-gradient-to-br from-green-500/8 to-transparent border border-green-500/15 rounded-2xl p-8 md:p-10">
                    <div className="text-5xl text-green-500/20 font-black leading-none mb-4">"</div>
                    <blockquote className="text-xl md:text-2xl text-white/80 italic font-light leading-relaxed mb-6">
                        Japanese people are reserved and not so active in questioning after a speech, but they were active
                        and asked questions and the event was interactive, which demonstrated that your presentation was
                        interesting and they found relaxing atmosphere in your gentle personality.
                    </blockquote>
                    <footer className="text-[11px] text-white/25 uppercase tracking-widest">
                        Kana Sakai · Simultaneous Interpreter · April 24, 2025
                    </footer>
                </div>
            </section>

            {/* Presentation structure */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Presentation Structure</span>
                </div>
                <div className="space-y-4">
                    {presentationSections.map((s, i) => (
                        <div key={i} className="flex items-start gap-5 bg-white/[0.025] border border-white/8 rounded-xl p-5 hover:border-green-500/20 hover:bg-white/[0.035] transition-all">
                            <div className="shrink-0 w-14 h-14 rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center justify-center">
                                <span className="text-[9px] text-green-400/50 uppercase tracking-widest leading-none">Sec</span>
                                <span className="text-base font-black text-green-400">{i + 1}</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white mb-1.5">{s.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{s.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* JIA image gallery */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">JIA Architecture Salon — August 2024</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['jia-1.jpg', 'jia-2.jpg', 'jia-3.jpg', 'jia-4.jpg', 'jia-5.jpg', 'jia-6.jpg'].map((img, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-white/5">
                            <img
                                src={`/teaching/${img}`}
                                alt={`JIA Architecture Salon photo ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* PDF embeds */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">JIA Event Poster</span>
                    <a href="/docs/teaching/jia-poster.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-400 hover:text-green-300 underline uppercase tracking-widest">Open Full Screen</a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe src="/docs/teaching/jia-poster.pdf#navpanes=0&toolbar=0&view=FitH" className="w-full h-[500px]" title="JIA Architecture Salon Event Poster" />
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Tapio Open University — Event Poster</span>
                    <a href="/docs/teaching/tapio-poster.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-400 hover:text-green-300 underline uppercase tracking-widest">Open Full Screen</a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe src="/docs/teaching/tapio-poster.pdf#navpanes=0&toolbar=0&view=FitH" className="w-full h-[500px]" title="Tapio Hall Open University Event Poster" />
                </div>
            </section>

            {/* Reference + note */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="space-y-6">
                    <div className="bg-white/[0.025] border border-white/8 rounded-xl p-5">
                        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Reference</p>
                        <p className="text-sm text-gray-400">Roxana Waterson, <span className="italic">The Living House</span> (1990) — one of the foundational references in this presentation.</p>
                    </div>
                    <div className="bg-white/[0.025] border border-white/8 rounded-xl p-5">
                        <p className="text-xs text-white/30 uppercase tracking-widest mb-2">Note</p>
                        <p className="text-sm text-gray-400">
                            This moon replaces the former Cultural Engagement planet. The full presentation PDF is also available at{' '}
                            <a href="/docs/malaysia-presentation.pdf" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">
                                /docs/malaysia-presentation.pdf
                            </a>.
                        </p>
                    </div>
                </div>
            </section>

            {/* Back link */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors">
                    ← Back to Portfolio
                </Link>
            </section>
        </div>
    );
}
