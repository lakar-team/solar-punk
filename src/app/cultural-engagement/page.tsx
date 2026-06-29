import Link from 'next/link';
import { projects } from '@/data/projects';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cultural Engagement | Adam M. Raman',
    description: 'Invited speaker at Japan Institute of Architects international symposium — Malaysian architectural perspective on cross-cultural design.',
};

export default function CulturalEngagementPage() {
    const project = projects.find(p => p.id === 'cultural-engagement')!;

    const presentationSections = [
        { label: 'Section 1', title: 'Early History of Malay Civilisation', detail: 'Origins traced to the Dongsan Civilisation and Pacific seafarers. Early Malay settlements at river deltas and coastlines — an amphibian (water) habitat. Common architectural roots across Southeast Asia.' },
        { label: 'Section 2', title: 'Malacca Straits Settlements', detail: 'Srivijaya through Malacca Empire (7th–15th century). Colonial-era Dutch and British influence via the East India Company. The shop-house typology and its lasting urban imprint.' },
        { label: 'Section 3', title: 'Kuala Lumpur Origin', detail: 'Founded 1857 at the confluence of Gombak and Klang rivers. Tin mining drove the city\'s early growth. Frank Swettenham\'s rebuilding program: wider streets, brick and tile — Kuala Lumpur\'s urban DNA.' },
        { label: 'Section 4', title: 'Malaysia Mass Housing', detail: 'From kampung to terrace house to high-rise flat. Car-dependency, absent pedestrian infrastructure, and social isolation as chronic outcomes of post-war housing policy. The condominium as a response to demand for amenity.' },
        { label: 'Section 5', title: 'Work Experience', detail: 'S&A Architects (post-Bachelor 2009, post-Masters 2012). Lakar Design Studio. The PAM Award-winning Denai Alam Phase J15 master plan — human-centric design as a market-viable strategy.' },
        { label: 'Section 6', title: 'Research in Japan', detail: 'Pursing energy-efficient construction at Tohoku University. The PhD into desiccant cooling and thermal comfort. A Malaysian architect asking Japanese questions — what can each tradition learn from the other?' },
    ];

    const crossCulturalThemes = [
        { theme: 'Vernacular Intelligence', detail: 'Traditional Malay architecture — raised on stilts, oriented away from sun, surrounded by fruit trees — solved tropical thermal comfort without mechanical systems. This is not history; it is a design playbook.' },
        { theme: 'Colonial Translation', detail: 'Chinese courtyard house → shop-house (with British tax incentives shaping frontage width). Design is never culturally neutral: it carries the economics and politics of its time.' },
        { theme: 'Urban Failure Modes', detail: 'Malaysian mass housing replicated the errors of European 1960s planning: car-dependency, severed pedestrian networks, playground inaccessibility. Studying failure cross-culturally accelerates the path to correction.' },
        { theme: 'The Japan Connection', detail: 'Japan\'s prefab tradition, thermal insulation standards, and workmanship culture all offer answers to problems Malaysia is still trying to name. The symposium was the beginning of a cross-cultural conversation, not a conclusion.' },
    ];

    return (
        <div className="min-h-screen bg-[#070c08] text-white overflow-x-hidden">
            {/* Fine dot pattern */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(134,239,172,0.1) 1px, transparent 1px)',
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
                    <span className="text-[11px] uppercase tracking-[0.35em] text-green-300/70">Research · Speaker · Japan Institute of Architects</span>
                </div>
                <h1 className="text-[clamp(3rem,9vw,7rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-green-100/90 to-green-400/50 mb-8">
                    Cultural<br />Engagement
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    {project.description}
                </p>
            </section>

            {/* Presentation card */}
            <section className="max-w-5xl mx-auto px-6 pb-16">
                <div className="relative bg-green-500/5 border border-green-500/20 rounded-3xl p-8 md:p-10 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-green-500/10" />
                    <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full border border-green-500/15" />

                    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.35em] text-green-400/60 mb-3">Invited Presentation</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Malaysian Housing Evolution</h2>
                            <p className="text-green-300/60 text-lg italic font-light mb-6">Then and Now</p>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                A six-part presentation distilling years of professional practice, academic research, and personal architectural history — delivered at an international forum from the perspective of a Malaysian architect embedded in Japan.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Event', value: 'Japan Institute of Architects International Symposium' },
                                { label: 'Role', value: 'Invited Speaker' },
                                { label: 'Perspective', value: 'Malaysian Architectural & Cultural Lens' },
                                { label: 'Context', value: 'Cross-Cultural Design Thinking' },
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

            {/* Cross-cultural themes */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Cross-Cultural Design Themes</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {crossCulturalThemes.map((t, i) => (
                        <div key={i} className="bg-green-500/5 border border-green-500/15 rounded-2xl p-6 hover:bg-green-500/8 transition-colors">
                            <h3 className="text-base font-bold text-green-300 mb-3">{t.theme}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Context quote */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="relative bg-gradient-to-br from-green-500/8 to-transparent border border-green-500/15 rounded-2xl p-8 md:p-10">
                    <div className="text-5xl text-green-500/20 font-black leading-none mb-4">"</div>
                    <blockquote className="text-xl md:text-2xl text-white/80 italic font-light leading-relaxed mb-6">
                        The range of architectural styles which have developed in the communities of Southeast Asia reveal some startling similarities,
                        which are strongly suggestive of perhaps distant but common origin.
                    </blockquote>
                    <footer className="text-[11px] text-white/25 uppercase tracking-widest">
                        Roxana Waterson · <span className="italic not-italic">The Living House</span> (1990) — one of the foundational references in this presentation
                    </footer>
                </div>
            </section>

            {/* Key facts */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Key Facts</span>
                </div>
                <div className="space-y-3">
                    {project.keyFacts?.map((fact, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-green-500/5 border border-green-500/12 rounded-xl">
                            <span className="text-green-400 shrink-0 mt-0.5">▸</span>
                            <span className="text-gray-300 leading-relaxed">{fact}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* PDF embed */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Presentation Slides</span>
                    <a href="/docs/malaysia-presentation.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-400 hover:text-green-300 underline uppercase tracking-widest">Open Full Screen</a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe src="/docs/malaysia-presentation.pdf#navpanes=0&toolbar=0&view=FitH" className="w-full h-[700px]" title="Malaysian Housing Evolution — Presentation Slides" />
                </div>
            </section>
        </div>
    );
}
