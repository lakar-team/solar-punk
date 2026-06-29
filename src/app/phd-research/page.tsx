import Link from 'next/link';
import { projects } from '@/data/projects';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Climate Tech R&D | Adam M. Raman',
    description: 'PhD research at Tohoku University — solar-regenerated desiccant cooling achieving 50% reduction in cooling loads.',
};

export default function PhDResearchPage() {
    const project = projects.find(p => p.id === 'phd-research')!;

    const systemComponents = [
        { id: '01', name: 'Skylight Collector', detail: '3mm polycarbonate twinwall panels, 30° south-facing, 25mm air gap. Captures solar irradiance peaking at 1,200 W/m².' },
        { id: '02', name: 'Solar Heat Absorber', detail: 'Black perforated plywood beneath skylight. Air heated to 70°C above ambient during peak irradiance.' },
        { id: '03', name: 'Desiccant Bed', detail: '9 kg recycled-wood charcoal in air-permeable pouches on metal mesh. Absorbs ~0.15 kg water per dehumidification cycle.' },
        { id: '04', name: 'Ventilation Fans', detail: 'Timer-controlled with one-way dampers. 42–48 m³/hr for regeneration; 21 m³/hr for dehumidification.' },
        { id: '05', name: 'Insulated Enclosure', detail: '1m × 1m × 1.5m plywood frame, 50mm extruded polystyrene lining. Minimises heat loss from the system.' },
        { id: '06', name: 'Sensor Array', detail: '7 T&H sensors, solar radiation meter (EKO ML-01), Testo 400 flow probe, AND GP-30K weight scale. Data at 2-min intervals.' },
    ];

    const researchQuestions = [
        { letter: 'a', q: 'What level of passive dehumidification can be achieved by leveraging diurnal humidity variations?' },
        { letter: 'b', q: 'How effectively can desiccant absorb nocturnal humidity and regenerate using solar energy as the heat source?' },
        { letter: 'c', q: 'To what extent can a desiccant store dehumidification potential for later use when ambient humidity rises?' },
        { letter: 'd', q: 'What climatic factors must be considered to automate a passive humidity control system based on natural humidity cycles?' },
    ];

    const futureGoals = [
        { goal: 'Living Buildings', detail: 'Structures that sense their environment, interpret data, and adapt in real time.' },
        { goal: 'Passive Buildings', detail: 'Comfort achieved through design intelligence, not brute-force mechanical systems.' },
        { goal: 'Comfortable Buildings', detail: 'Thermal comfort that accounts for local climate, not universal averages.' },
    ];

    return (
        <div className="min-h-screen bg-[#060a0f] text-white overflow-x-hidden">
            {/* Dot-grid starfield */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(165,243,252,0.12) 1px, transparent 1px)',
                    backgroundSize: '56px 56px',
                }}
            />
            {/* Cyan ambient glow */}
            <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-cyan-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-100px] right-[-100px] w-[500px] h-[400px] rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-cyan-400 transition-colors text-xs uppercase tracking-widest">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(165,243,252,0.9)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-cyan-400/70">Research · Tohoku University · 2022–2025</span>
                </div>
                <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-cyan-100/90 to-cyan-400/50 mb-8">
                    Climate<br />Tech R&D
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    {project.description}
                </p>
            </section>

            {/* Key metrics */}
            <div className="border-y border-white/8 bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { value: '50%', label: 'Cooling Load Reduction', sub: 'validated result', color: 'text-cyan-400' },
                        { value: '40%', label: 'Humidity Reduction', sub: 'over 12-hour night cycle', color: 'text-cyan-300' },
                        { value: '9 kg', label: 'Charcoal Desiccant', sub: 'recycled wood charcoal', color: 'text-sky-400' },
                        { value: '5.6B', label: 'ACs by 2050', sub: 'IEA forecast — the problem', color: 'text-amber-400' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className={`text-4xl md:text-5xl font-black leading-none ${s.color}`}>{s.value}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2">{s.label}</div>
                            <div className="text-[11px] text-white/25 mt-1">{s.sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Paper citation */}
            <section className="max-w-5xl mx-auto px-6 py-16">
                <div className="relative bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-8 md:p-10">
                    <div className="absolute top-5 right-5">
                        <span className="text-[10px] uppercase tracking-widest text-cyan-500/30 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">Conference Paper</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/60 mb-4">Kyoto International Symposium · 2024</p>
                    <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-3">
                        Solar Regenerated Daily Cycle Passive Dehumidifying Air-Conditioner
                    </h2>
                    <p className="text-lg text-cyan-200/60 italic font-light leading-snug mb-6">
                        Storing Drying Potential in Solid Desiccant Through Daily Weather Cycles
                    </p>
                    <div className="h-px bg-white/10 mb-6" />
                    <p className="text-sm text-gray-500">
                        Adam Bin M Raman &amp; Prof. Hikaru Kobayashi<br />
                        <span className="text-gray-600">Department of Architecture and Building Science · Graduate School of Engineering · Tohoku University</span>
                    </p>
                </div>
            </section>

            {/* Daily cycle diagram */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">System Operation — The Daily Cycle</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Regeneration */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-7">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="text-2xl">☀</div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-amber-400/60">Phase 1 · 08:00–16:00</div>
                                <div className="text-2xl font-black text-amber-400">Regeneration</div>
                            </div>
                        </div>
                        <ol className="space-y-4">
                            {[
                                'Solar irradiance heats collection chamber to 70°C above ambient',
                                'Fan draws air at 42–48 m³/hr through the heating zone',
                                'Charcoal desiccant releases stored moisture — regeneration complete',
                                'Desiccant drying potential is stored, ready for nighttime use',
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                    {/* Dehumidification */}
                    <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-7">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="text-2xl">☾</div>
                            <div>
                                <div className="text-[10px] uppercase tracking-widest text-cyan-400/60">Phase 2 · 18:00–06:00</div>
                                <div className="text-2xl font-black text-cyan-300">Dehumidification</div>
                            </div>
                        </div>
                        <ol className="space-y-4">
                            {[
                                'Outdoor air enters at ~80% relative humidity',
                                'Air passes through dry desiccant bed at 21 m³/hr for maximum contact time',
                                'Desiccant absorbs moisture — exhaust air exits at ~40% RH',
                                '40% humidity reduction sustained across the full 12-hour cycle',
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                    <span className="shrink-0 w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold mt-0.5">
                                        {i + 1}
                                    </span>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
                <div className="flex justify-center mt-6">
                    <div className="flex items-center gap-3 text-[11px] text-white/20 uppercase tracking-widest">
                        <span className="text-amber-400/50">☀ Solar charges desiccant</span>
                        <span>────</span>
                        <span className="text-white/30">↻ repeats daily</span>
                        <span>────</span>
                        <span className="text-cyan-400/50">Night delivers cooling</span>
                    </div>
                </div>
            </section>

            {/* Experiment components */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Experimental Apparatus · Sendai, Japan · 2023–2024</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemComponents.map((c) => (
                        <div key={c.id} className="bg-white/[0.025] border border-white/8 rounded-xl p-5 hover:border-cyan-500/25 hover:bg-white/[0.035] transition-all">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-mono text-cyan-500/50">{c.id}</span>
                                <div className="flex-1 h-px bg-white/8" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-2">{c.name}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{c.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Research questions */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Research Questions</span>
                </div>
                <div className="space-y-4">
                    {researchQuestions.map((rq) => (
                        <div key={rq.letter} className="flex items-start gap-6 p-6 bg-white/[0.02] border border-white/6 rounded-xl hover:border-cyan-500/15 transition-colors">
                            <span className="text-3xl font-black text-cyan-500/15 leading-none shrink-0 mt-1">{rq.letter}.</span>
                            <p className="text-gray-300 leading-relaxed">{rq.q}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Key findings */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Key Findings</span>
                </div>
                <div className="space-y-3">
                    {project.keyFacts?.map((fact, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-cyan-500/5 border border-cyan-500/15 rounded-xl">
                            <span className="text-cyan-500 shrink-0 mt-0.5">▸</span>
                            <span className="text-gray-300 leading-relaxed">{fact}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vision */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Future Vision</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {futureGoals.map((g, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/8 rounded-xl p-6 hover:bg-white/[0.05] transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                                <span className="text-cyan-400 text-xs">0{i + 1}</span>
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">{g.goal}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{g.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* PDF documents */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8 space-y-8">
                <div className="mb-2">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Research Documents</span>
                </div>
                {[
                    { label: '2024 Kyoto International Conference Paper', url: '/docs/kyoto-conference.pdf' },
                    { label: 'PhD Research Paper (Tohoku University)', url: '/docs/phd-research.pdf' },
                ].map((doc, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/[0.03]">
                            <span className="text-sm text-white/50">{doc.label}</span>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:text-cyan-300 underline uppercase tracking-widest">
                                Open Full Screen
                            </a>
                        </div>
                        <iframe src={`${doc.url}#navpanes=0&toolbar=0&view=FitH`} className="w-full h-[700px]" title={doc.label} />
                    </div>
                ))}
            </section>
        </div>
    );
}
