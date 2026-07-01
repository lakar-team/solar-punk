import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Sendai School Visits | Adam M. Raman',
    description: 'Cultural workshops for Japanese elementary school children through MIA (Miyagi International Association). 14-slide bilingual deck presented entirely in Japanese.',
};

export default function SendaiSchoolPage() {
    const topics = [
        'Flag & geography',
        'Climate zones',
        'Kampung houses',
        'Stilt villages',
        'Old towns',
        'Kuala Lumpur',
        'Ethnic costumes',
        'Traditional food',
        'Traditional games',
        'School life',
        'Terima Kasih',
    ];

    return (
        <div className="min-h-screen bg-[#0a0900] text-white overflow-x-hidden">
            {/* Fine dot pattern */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(251,191,36,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                }}
            />
            {/* Amber ambient */}
            <div className="fixed top-[-100px] right-[-50px] w-[700px] h-[500px] rounded-full bg-amber-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-yellow-500/4 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-amber-400 transition-colors text-xs uppercase tracking-widest">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-amber-300/70">Cultural Education · MIA · Sendai</span>
                </div>
                <h1 className="text-[clamp(3rem,9vw,7rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-100/90 to-amber-400/50 mb-6">
                    Sendai<br />School Visits
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    Malaysian Culture for Japanese Children · MIA · 2023–Present
                </p>
            </section>

            {/* Organisation card */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-amber-400/60 mb-3">Organising Partner</p>
                            <h2 className="text-xl font-black text-white mb-2">MIA</h2>
                            <p className="text-amber-300/60 text-sm mb-4">Miyagi International Association</p>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Facilitates cross-cultural exchange in Miyagi Prefecture, Japan.
                                MIA connects international residents with local schools and community organisations.
                            </p>
                            <a href="https://www.mia-miyagi.jp" target="_blank" rel="noopener noreferrer"
                                className="inline-block mt-4 text-xs text-amber-400 hover:text-amber-300 underline">
                                mia-miyagi.jp →
                            </a>
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'Programme', value: 'Elementary school cultural workshops' },
                                { label: 'Language', value: 'Japanese (presented entirely in Japanese)' },
                                { label: 'Format', value: '14-slide bilingual visual presentation' },
                                { label: 'Period', value: '2023–present' },
                            ].map((d, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm">
                                    <span className="text-[10px] uppercase tracking-widest text-white/25 pt-0.5 min-w-24 shrink-0">{d.label}</span>
                                    <span className="text-gray-300">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Topics grid */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Topics Covered</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {topics.map((topic, i) => (
                        <span
                            key={i}
                            className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm text-amber-200/80 hover:bg-amber-500/15 transition-colors"
                        >
                            {topic}
                        </span>
                    ))}
                </div>
                <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-2xl">
                    The final slide teaches children to say{' '}
                    <span className="text-amber-300 font-bold">Terima Kasih</span> — ありがとうございます.
                    The children leave knowing how to say thank you in Malay.
                </p>
            </section>

            {/* Image gallery */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">School Visits</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['mia-1.jpg', 'mia-2.jpg', 'mia-3.jpg'].map((img, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-white/5">
                            <img
                                src={`/teaching/${img}`}
                                alt={`MIA school visit photo ${i + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* PDF embed */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Presentation Deck</span>
                    <a href="/docs/teaching/mia-presentation.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-400 hover:text-amber-300 underline uppercase tracking-widest">Open Full Screen</a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe src="/docs/teaching/mia-presentation.pdf#navpanes=0&toolbar=0&view=FitH" className="w-full h-[600px]" title="MIA Malaysian Culture Presentation" />
                </div>
            </section>

            {/* Note */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="bg-white/[0.025] border border-white/8 rounded-xl p-5">
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Presented entirely in Japanese. Adam prepared and delivered this independently.
                    </p>
                </div>
            </section>

            {/* Back link */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                    ← Back to Portfolio
                </Link>
            </section>
        </div>
    );
}
