import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tohoku Teaching | Adam M. Raman',
    description: 'Teaching Assistant for English as a Second Language at Tohoku University (2023–2025). Formal credited programme, paid by the university.',
};

export default function TohokuTeachingPage() {
    return (
        <div className="min-h-screen bg-[#07080f] text-white overflow-x-hidden">
            {/* Fine dot pattern */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(147,197,253,0.08) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.5,
                }}
            />
            {/* Ice-blue ambient */}
            <div className="fixed top-[-100px] right-[-50px] w-[700px] h-[500px] rounded-full bg-blue-400/5 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-sky-500/4 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-blue-400 transition-colors text-xs uppercase tracking-widest">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-300 shadow-[0_0_8px_rgba(147,197,253,0.9)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-blue-300/70">Teaching · Tohoku University · Sendai</span>
                </div>
                <h1 className="text-[clamp(3rem,9vw,7rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100/90 to-blue-400/50 mb-6">
                    Tohoku<br />Teaching
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    English as a Second Language · Tohoku University · 2023–2025
                </p>
            </section>

            {/* The dynamic */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="relative bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 md:p-10 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-blue-500/10" />
                    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full border border-blue-500/15" />
                    <div className="relative">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-blue-400/60 mb-4">The Dynamic</p>
                        <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light">
                            A Malaysian teaching English — in Japanese — to Japanese university students who need it to graduate.
                            Unlike a native English speaker brought in for conversation practice, Adam knows what it costs to
                            become genuinely fluent in a second language. He earned his English. He understands the student&apos;s position.
                        </p>
                    </div>
                </div>
            </section>

            {/* Role details card */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Role Details</span>
                </div>
                <div className="bg-white/[0.025] border border-white/8 rounded-2xl p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Role', value: 'Teaching Assistant (ESL)' },
                            { label: 'Institution', value: 'Tohoku University, Sendai, Japan' },
                            { label: 'Period', value: '2023–2025' },
                            { label: 'Programme', value: 'Formal credited (graduation requirement)' },
                            { label: 'Compensation', value: 'Paid by the university' },
                            { label: 'Responsibilities', value: 'Taught classes, prepared quizzes and exams, marked and graded student work' },
                        ].map((d, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm">
                                <span className="text-[10px] uppercase tracking-widest text-white/25 pt-0.5 min-w-28 shrink-0">{d.label}</span>
                                <span className="text-gray-300">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Image */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Class in Session</span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10">
                    <img
                        src="/teaching/tohoku-class.jpg"
                        alt="Tohoku University lecture hall — English class in session"
                        className="w-full rounded-xl"
                    />
                </div>
                <p className="mt-4 text-xs text-white/30 text-center">Tohoku University lecture hall — English class in session</p>
            </section>

            {/* Context note */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="space-y-5">
                    <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-6">
                        <p className="text-xs text-blue-400/60 uppercase tracking-widest mb-3">Context</p>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            This role overlapped with Adam&apos;s PhD research at the same university — by day, investigating passive
                            cooling systems for buildings; twice a week, in front of a Japanese lecture hall teaching English.
                        </p>
                    </div>

                    <div className="relative bg-gradient-to-br from-blue-500/8 to-transparent border border-blue-500/15 rounded-2xl p-8">
                        <div className="text-5xl text-blue-500/20 font-black leading-none mb-4">"</div>
                        <blockquote className="text-lg md:text-xl text-white/80 italic font-light leading-relaxed">
                            The most useful thing I brought wasn&apos;t native fluency — it was knowing what it felt like to sit in
                            that chair and not understand.
                        </blockquote>
                    </div>
                </div>
            </section>

            {/* Back link */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                    ← Back to Portfolio
                </Link>
            </section>
        </div>
    );
}
