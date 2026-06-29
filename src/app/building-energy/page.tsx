import Link from 'next/link';
import { projects } from '@/data/projects';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Building Energy | Adam M. Raman',
    description: 'HVAC engineering and building energy design for residential and commercial projects across Tohoku, Japan.',
};

export default function BuildingEnergyPage() {
    const project = projects.find(p => p.id === 'building-energy')!;

    const services = [
        {
            label: 'HVAC Drawings',
            detail: 'Full MEP drafting for residential and commercial builds — duct layouts, equipment schedules, zone diagrams — produced in Rebro, Japan\'s leading MEP-BIM platform.',
        },
        {
            label: 'AC Load Calculations',
            detail: 'Thermal load analysis per room and building zone using Stabro. Outputs drive equipment selection and sizing decisions for new builds.',
        },
        {
            label: 'Compliance Navigation',
            detail: 'Working directly with local municipalities and architecture firms to meet Japanese building energy standards. Builds a paper trail that satisfies both client and authority requirements.',
        },
        {
            label: 'Cross-Domain Translation',
            detail: 'Connecting thermal comfort research (PhD, desiccant cooling) to practical engineering output — buildings that are thermally honest from day one, not just code-compliant.',
        },
    ];

    const tools = [
        { name: 'Rebro', type: 'MEP / BIM', detail: 'Japan\'s primary MEP engineering software. Used for HVAC duct routing, equipment scheduling, and building information modelling.' },
        { name: 'Stabro', type: 'Building Energy', detail: 'Specialist thermal load calculation platform. Computes AC load per zone and validates against energy efficiency standards.' },
        { name: 'AutoCAD', type: 'Drafting', detail: 'Base drawing preparation and coordination with architectural drawings supplied by client teams.' },
    ];

    const context = [
        { label: 'Region', value: 'Tohoku, Japan' },
        { label: 'Project Types', value: 'Residential · Commercial · Municipal' },
        { label: 'Status', value: 'Active — In Progress' },
        { label: 'Background', value: 'Architecture (10+ yrs) + PhD Thermal Comfort' },
    ];

    return (
        <div className="min-h-screen bg-[#0d0a06] text-white overflow-x-hidden">
            {/* Horizontal scan-lines */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.025]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(251,146,60,1) 3px, rgba(251,146,60,1) 4px)',
                }}
            />
            {/* Amber glow */}
            <div className="fixed top-[-100px] right-[-50px] w-[700px] h-[500px] rounded-full bg-orange-500/8 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

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
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(251,146,60,0.9)] animate-pulse" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-amber-500/70">Work · In Progress · Tohoku, Japan</span>
                </div>
                <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-100/80 to-amber-400/50 mb-8">
                    Building<br />Energy
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    {project.description}
                </p>
            </section>

            {/* Image Gallery */}
            <section className="max-w-5xl mx-auto px-6 pb-4">
                <div className="grid grid-cols-3 gap-3 h-[320px]">
                    <div className="col-span-2 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img
                            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80"
                            alt="Sustainable building exterior"
                            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                            <img
                                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"
                                alt="Modern tropical architecture"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                            />
                        </div>
                        <div className="flex-1 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                            <img
                                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80"
                                alt="Building energy systems"
                                className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Context strip */}
            <div className="border-y border-white/8 bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {context.map((c, i) => (
                        <div key={i}>
                            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">{c.label}</div>
                            <div className="text-sm font-medium text-amber-300/80">{c.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Services */}
            <section className="max-w-5xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Services</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((s, i) => (
                        <div key={i} className="bg-white/[0.025] border border-amber-500/12 rounded-2xl p-6 hover:bg-white/[0.04] hover:border-amber-500/25 transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span className="text-sm font-bold text-white">{s.label}</span>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">{s.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Tools */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Engineering Tools</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {tools.map((t, i) => (
                        <div key={i} className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-6 hover:bg-amber-500/8 transition-colors">
                            <span className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-2 block">{t.type}</span>
                            <h3 className="text-xl font-black text-white mb-3">{t.name}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{t.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cross-domain bridge */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">The Bridge</span>
                </div>
                <div className="relative bg-gradient-to-br from-amber-500/8 to-transparent border border-amber-500/20 rounded-2xl p-8 md:p-10">
                    <p className="text-lg text-gray-300 leading-relaxed mb-8">
                        The PhD research in desiccant cooling and thermal comfort feeds directly into this work.
                        Where most MEP engineers optimize for compliance, this practice optimizes for thermal honesty —
                        buildings sized correctly for their actual thermal loads rather than engineering margins that add cost and waste.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { from: 'PhD Research', to: 'Thermal load understanding in hot-humid climates' },
                            { from: 'Architecture', to: '10+ years reading how buildings actually behave' },
                            { from: 'Engineering', to: 'Rebro & Stabro — precision output, Japanese standards' },
                        ].map((b, i) => (
                            <div key={i} className="bg-black/30 border border-white/8 rounded-xl p-4">
                                <div className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-1">{b.from}</div>
                                <div className="text-sm text-gray-400 leading-relaxed">{b.to}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key facts */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Key Facts</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.keyFacts?.map((fact, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/12 rounded-xl">
                            <span className="text-amber-500 shrink-0 mt-0.5">▸</span>
                            <span className="text-gray-300 text-sm leading-relaxed">{fact}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
