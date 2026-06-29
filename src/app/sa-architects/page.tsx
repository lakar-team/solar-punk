import Link from 'next/link';
import { projects } from '@/data/projects';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'S&A Architects | Adam M. Raman',
    description: 'PAM Award 2017 — Multiple Residential (Low Rise), Silver. Thistle Grove, Denai Alam Phase J15.',
};

export default function SAArchitectsPage() {
    const project = projects.find(p => p.id === 'sa-architects')!;

    const awardContext = [
        {
            q: 'What is the PAM Award?',
            a: 'The Pertubuhan Arkitek Malaysia (PAM) Award is described by Malaysian media as the "Oscars" of the local architecture industry. It promotes design excellence and the advancement of a quality built environment with beneficial social, physical, and cultural impacts.',
        },
        {
            q: 'How competitive was 2017?',
            a: '77 submissions across 10 categories. The jury noted that the quality benchmark was deliberately high — the previous year (121 submissions) produced no Gold medal winners due to concerns about design ambition. In 2017, the first Building of the Year in two years was awarded.',
        },
        {
            q: 'The jury\'s mandate.',
            a: 'Jury comprised: outgoing PAM President Mohd Zulhemlee An, architect Almaz Salma Abdul Rahim, academician Dr Mariam Jamaludin, and designer Zachary Haris Ong. They looked for "truly Malaysian architecture" — designs aligned with local culture, lifestyles, and genuine social impact.',
        },
    ];

    const careerContext = [
        { year: '2009', event: 'Joined S&A Architects', detail: '1 year after Bachelor graduation. Early career exposure to professional practice, project documentation, and client-facing design work.' },
        { year: '2012', event: 'Master\'s graduate', detail: 'Returned to S&A Architects with advanced design methods from Manchester, UK. The Denai Alam Phase J15 master plan was developed during this period.' },
        { year: '2012', event: 'Design period', detail: 'Thistle Grove master plan for Sime Darby Property — the project that would be recognised five years later at PAM Awards 2017.' },
        { year: '2017', event: 'PAM Award', detail: 'Multiple Residential (Low Rise), Silver. Jury citation confirms the project\'s success in delivering liveable outdoor-generous community design.' },
    ];

    return (
        <div className="min-h-screen bg-[#060810] text-white overflow-x-hidden">
            {/* Blueprint grid */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(96,165,250,0.05) 1px, transparent 1px), linear-gradient(to right, rgba(96,165,250,0.05) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />
            {/* Blue ambient */}
            <div className="fixed top-[-100px] left-[-100px] w-[700px] h-[500px] rounded-full bg-blue-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] right-[-50px] w-[600px] h-[400px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

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
                    <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-blue-400/70">Work · Architecture · Kuala Lumpur, Malaysia</span>
                </div>
                <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-black leading-[0.88] text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-100/90 to-blue-400/40 mb-8">
                    S&amp;A<br />Architects
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    {project.description}
                </p>
            </section>

            {/* Award badge */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/25 rounded-3xl p-8 md:p-12">
                    {/* Decorative rings */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-blue-500/10" />
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-blue-500/15" />

                    <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
                        {/* Medal */}
                        <div className="shrink-0 flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 border-blue-400/40 bg-blue-500/10 shadow-[0_0_40px_rgba(96,165,250,0.2)]">
                            <span className="text-[10px] uppercase tracking-widest text-blue-400/60">PAM</span>
                            <span className="text-2xl font-black text-blue-300">SILVER</span>
                            <span className="text-[10px] text-blue-400/50">2017</span>
                        </div>
                        {/* Details */}
                        <div className="flex-1">
                            <div className="text-[10px] uppercase tracking-[0.35em] text-blue-400/60 mb-2">PAM Awards 2017 · Malaysia</div>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-1">Multiple Residential (Low Rise)</h2>
                            <p className="text-blue-300/70 text-lg mb-5">Silver Medal</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-white/30 text-[10px] uppercase tracking-widest block mb-1">Project</span>
                                    <span className="text-gray-300">Thistle Grove, Denai Alam Phase J15</span>
                                </div>
                                <div>
                                    <span className="text-white/30 text-[10px] uppercase tracking-widest block mb-1">Developer</span>
                                    <span className="text-gray-300">Sime Darby Property</span>
                                </div>
                                <div>
                                    <span className="text-white/30 text-[10px] uppercase tracking-widest block mb-1">Location</span>
                                    <span className="text-gray-300">Shah Alam, Selangor, Malaysia</span>
                                </div>
                                <div>
                                    <span className="text-white/30 text-[10px] uppercase tracking-widest block mb-1">Design Period</span>
                                    <span className="text-gray-300">2012</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Jury citations */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Jury Citations</span>
                </div>
                <div className="space-y-5">
                    <blockquote className="relative pl-6 border-l-2 border-blue-500/50">
                        <p className="text-xl md:text-2xl text-white/80 leading-relaxed italic font-light">
                            &ldquo;This is a pleasant, easy-garden-access residential estate that affords generous outdoor living while also offering indoor comfort.&rdquo;
                        </p>
                        <footer className="mt-4 text-[11px] text-white/30 uppercase tracking-widest">PAM Awards 2017 · Jury Citation (official)</footer>
                    </blockquote>
                    <blockquote className="relative pl-6 border-l-2 border-blue-400/30">
                        <p className="text-base text-gray-400 leading-relaxed italic">
                            &ldquo;Pleasant residential estate with garden-like ambience affording generous outdoor living and the allure of indoor comfort.&rdquo;
                        </p>
                        <footer className="mt-3 text-[11px] text-white/25 uppercase tracking-widest">Design Brief Citation · 2012</footer>
                    </blockquote>
                </div>
            </section>

            {/* Design concept */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Design Concept</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            label: 'Green Ribbons',
                            detail: 'Housing nodes anchored around connected green corridors that thread through the estate, creating continuous pedestrian-friendly ecological flow.',
                        },
                        {
                            label: 'Social Hub',
                            detail: 'All green ribbons converge at a central community hub — the spatial and social focal point of the masterplan, accessible from every node on foot.',
                        },
                        {
                            label: 'Human + Commercial',
                            detail: 'Design proved that human-centric urban thinking — prioritising interaction, shade, and pedestrian movement — is as commercially viable as it is sustainable.',
                        },
                    ].map((c, i) => (
                        <div key={i} className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-6 hover:bg-blue-500/8 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center mb-4 border border-blue-500/20">
                                <span className="text-blue-400 text-xs font-mono">0{i + 1}</span>
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">{c.label}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{c.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Award context */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Award Context</span>
                </div>
                <div className="space-y-4">
                    {awardContext.map((c, i) => (
                        <div key={i} className="bg-white/[0.025] border border-white/8 rounded-xl p-6 hover:border-blue-500/20 transition-colors">
                            <h3 className="text-sm font-bold text-blue-300/80 mb-3">{c.q}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{c.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Career timeline at S&A */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Career at S&amp;A</span>
                </div>
                <div className="space-y-6">
                    {careerContext.map((c, i) => (
                        <div key={i} className="flex gap-6 md:gap-10">
                            <div className="shrink-0 w-12 text-right">
                                <span className="text-sm font-black text-blue-400/60">{c.year}</span>
                            </div>
                            <div className="flex-1 pb-6 border-b border-white/6 last:border-0">
                                <div className="text-sm font-bold text-white mb-1">{c.event}</div>
                                <div className="text-sm text-gray-500 leading-relaxed">{c.detail}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Key facts */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Key Facts</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.keyFacts?.map((fact, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/12 rounded-xl">
                            <span className="text-blue-400 shrink-0 mt-0.5">▸</span>
                            <span className="text-gray-300 text-sm leading-relaxed">{fact}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* PDF embed */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">PAM Award Publication</span>
                    <a href="/docs/sa-architects-award.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 underline uppercase tracking-widest">Open Full Screen</a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe src="/docs/sa-architects-award.pdf#navpanes=0&toolbar=0&view=FitH" className="w-full h-[700px]" title="PAM Award 2017 Publication" />
                </div>
            </section>
        </div>
    );
}
