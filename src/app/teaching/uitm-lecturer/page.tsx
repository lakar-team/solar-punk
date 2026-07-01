import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'UiTM Lecturer | Adam M. Raman',
    description: 'Assistant Lecturer in Design Thinking and Human Sensibility at UiTM Malaysia (2016–2019). 200+ first-year architecture students mentored while running Lakar Design Studio.',
};

export default function UiTMLecturerPage() {
    const modules = [
        {
            title: 'Design Thinking',
            points: [
                'Systematic problem-solving through design',
                'User-centred research and empathy mapping',
                'Iterative prototyping and testing',
                'Design critique and peer review',
            ],
        },
        {
            title: 'Human Sensibility — Designing for the Senses',
            points: [
                'How spaces feel, not just how they look',
                'Tactile, acoustic, and light qualities in architecture',
                'Spatial rhythm and movement through buildings',
                'Connecting design decisions to lived human experience',
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#08070f] text-white overflow-x-hidden">
            {/* Fine dot pattern */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.6,
                }}
            />
            {/* Violet ambient glows */}
            <div className="fixed top-[-100px] right-[-50px] w-[700px] h-[500px] rounded-full bg-violet-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-purple-500/4 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-violet-400 transition-colors text-xs uppercase tracking-widest">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-violet-300/70">Teaching · UiTM Malaysia</span>
                </div>
                <h1 className="text-[clamp(3rem,9vw,7rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-violet-100/90 to-violet-400/50 mb-6">
                    UiTM<br />Lecturer
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    Design Thinking &amp; Human Sensibility · 2016–2019
                </p>
            </section>

            {/* Highlight card */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="relative bg-violet-500/5 border border-violet-500/20 rounded-3xl p-8 md:p-10 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-violet-500/10" />
                    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full border border-violet-500/15" />

                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-violet-400/60 mb-3">At a Glance</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">Part-time Assistant Lecturer</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Returning to his alma mater as a lecturer, Adam taught the same human-centred instincts
                                that were driving every project at Lakar Design — while simultaneously running the firm.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Institution', value: 'UiTM — Malaysia\'s largest public university' },
                                { label: 'Period', value: 'July 2016 – November 2019' },
                                { label: 'Scale', value: '200+ students mentored' },
                                { label: 'Context', value: 'Concurrent with running Lakar Design Studio' },
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

            {/* Story */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">The Story</span>
                </div>
                <div className="max-w-3xl space-y-6 text-gray-400 leading-relaxed">
                    <p>
                        Adam graduated from UiTM with a Dean&apos;s Award. He came back as a lecturer. The modules he taught —
                        Design Thinking and Human Sensibility — were not abstract academic subjects. They were the operating
                        principles behind every Lakar project. Teaching forced him to articulate what he&apos;d been doing
                        intuitively in practice. The classroom and the firm fed each other.
                    </p>
                    <p>
                        200+ students over three years isn&apos;t a guest lecture series — it&apos;s a sustained commitment to passing
                        something on. Running a profitable design-build firm and teaching first-year architecture students
                        simultaneously is not trivial. The overlap was intentional: what worked in the studio could be
                        tested in the classroom, and what resonated with students sharpened the thinking that went back
                        into practice.
                    </p>
                </div>
            </section>

            {/* Modules */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Modules Taught</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {modules.map((mod, i) => (
                        <div key={i} className="bg-violet-500/5 border border-violet-500/15 rounded-2xl p-6">
                            <h3 className="text-base font-bold text-violet-300 mb-4">{mod.title}</h3>
                            <ul className="space-y-2">
                                {mod.points.map((point, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm text-gray-400">
                                        <span className="text-violet-400 shrink-0 mt-0.5">▸</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* Image */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Studio</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10">
                    <img
                        src="/teaching/uitm-students.jpeg"
                        alt="UiTM Design Studio — students at the end of a session"
                        className="w-full rounded-xl"
                    />
                </div>
                <p className="mt-4 text-xs text-white/30 text-center">UiTM Design Studio — students at the end of a session</p>
            </section>

            {/* Timeline entry */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="bg-white/[0.025] border border-white/8 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-2 h-2 rounded-full bg-violet-400 mt-2 shadow-[0_0_6px_rgba(167,139,250,0.8)]" />
                        <div>
                            <p className="text-sm font-bold text-white mb-1">Part-time Assistant Lecturer · UiTM Malaysia</p>
                            <p className="text-[11px] text-white/30 uppercase tracking-widest">July 2016 – November 2019 · First-year architecture students</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Back link */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                    ← Back to Portfolio
                </Link>
            </section>
        </div>
    );
}
