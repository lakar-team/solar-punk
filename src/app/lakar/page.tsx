import Link from 'next/link';
import { projects } from '@/data/projects';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lakar Design | Adam M. Raman',
    description: '100% YoY revenue growth for 8 consecutive years — from one-man design studio to full design+build firm.',
};

export default function LakarPage() {
    const project = projects.find(p => p.id === 'lakar-design')!;

    const timeline = [
        {
            year: '2012',
            entity: 'Lakar Design Studio',
            tag: 'Design Services',
            color: 'green',
            detail: 'Pure design consultancy. Clients bring the construction team — I provide drawings, space planning, and concept direction. Launched on return from Manchester with a deliberately lean model to maximise creative output per project.',
        },
        {
            year: '2015',
            entity: 'Lakar Design & Construction',
            tag: 'Design + Build',
            color: 'emerald',
            detail: 'One-stop solution: design and physical build under one roof. Handles all project stages from inception to finishing. Added after realising large design-only contracts moved too slowly through approval chains — controlling construction closed the loop.',
        },
        {
            year: '2021',
            entity: 'Lakar (Malaysia) Sdn Bhd',
            tag: 'Limited Liability',
            color: 'teal',
            detail: 'Both services consolidated into a limited liability company. Enabled partner structures, cleaner delegation, and scalability to higher project values and larger construction teams — the infrastructure to grow beyond founder-led capacity.',
        },
    ];

    const projectCategories = [
        {
            label: 'Food & Beverage',
            accent: '#22c55e',
            items: [
                'Tropical theme restaurant — Sembulan, Kota Kinabalu (adaptive reuse)',
                'Self-service restaurant — Plaza TTDI, Kuala Lumpur',
                'English tea cafe brand — Selangor & Kuala Lumpur',
                'Food kiosk brand using central kitchen across major malls',
                'Restaurant colour scheme update with mural experiments, KL',
            ],
        },
        {
            label: 'Residential',
            accent: '#10b981',
            items: [
                'Studio apartments — Empire Damansara Soho (early small-space design)',
                'Bungalow on slope site (500 sqm, hollow blocks) — Selangor',
                'Old apartment refurbishments with material experiments',
                'Condominium furnishing at very affordable price points',
                'Link house renovation with partial smart home integration',
            ],
        },
        {
            label: 'Commercial',
            accent: '#14b8a6',
            items: [
                'MRT Station KL — 3D modelling service (pre-BIM adoption in Malaysia)',
                'Experiential baby product retail shop, Kuala Lumpur',
                'Capital investment company office setup, Selangor',
                'Outdoor family activity area — Setia Alam, Selangor',
            ],
        },
        {
            label: 'Tech-Integrated',
            accent: '#6ee7b7',
            items: [
                'Condominium with full smart home — Menjalara',
                'Bungalow smart home experiment — Sungai Penchala',
                'Water-resistant & fire-resistant kitchen experiments',
                'Bungalow loft conversion — side extension, Kuala Lumpur',
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-[#080a08] text-white overflow-x-hidden">
            {/* Subtle grid background */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(to right, rgba(34,197,94,0.04) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }}
            />
            {/* Green ambient glow */}
            <div className="fixed top-[-200px] right-[-100px] w-[800px] h-[600px] rounded-full bg-green-500/8 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-green-400 transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-green-400/70">Work · Interior Design & Construction · Malaysia</span>
                </div>
                <h1 className="text-[clamp(4rem,12vw,9rem)] font-black leading-[0.88] text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-green-400/50 mb-8">
                    Lakar<br />Design
                </h1>
                <div className="max-w-2xl">
                    <p className="text-lg text-gray-400 leading-relaxed">
                        {project.description}
                    </p>
                </div>
            </section>

            {/* Stats bar */}
            <div className="border-y border-white/8 bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {[
                        { value: '100%', label: 'YoY Revenue Growth', sub: '8 consecutive years' },
                        { value: '¥42M', label: 'Peak Annual Revenue', sub: 'from ¥1.8M in 2016' },
                        { value: '3', label: 'Business Entities', sub: 'studio · build firm · Sdn Bhd' },
                        { value: '9+', label: 'Years Operating', sub: '2012 → 2021' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-4xl md:text-5xl font-black text-green-400 leading-none">{s.value}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2">{s.label}</div>
                            <div className="text-[11px] text-white/25 mt-1">{s.sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Photo gallery */}
            <section className="max-w-5xl mx-auto px-6 py-16">
                <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[440px]">
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img src="/images/lakar/img_0003_p002_485x323.jpeg" alt="Lakar Design project" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img src="/images/lakar/img_0047_p005_269x294.jpeg" alt="Lakar Design project" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img src="/images/lakar/img_0084_p007_373x280.jpeg" alt="Lakar Design project" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img src="/images/lakar/img-0012.jpeg" alt="Lakar Design project" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </section>

            {/* Company evolution timeline */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Company Evolution</span>
                </div>
                <div className="space-y-0">
                    {timeline.map((t, i) => (
                        <div key={i} className="relative flex gap-6 md:gap-10 pb-12 last:pb-0">
                            {i < timeline.length - 1 && (
                                <div className="absolute left-[4.75rem] md:left-[5.75rem] top-12 bottom-0 w-px bg-gradient-to-b from-green-500/40 via-green-500/10 to-transparent" />
                            )}
                            {/* Year */}
                            <div className="shrink-0 w-16 md:w-20 pt-1 text-right">
                                <span className="text-2xl md:text-3xl font-black text-green-400/70">{t.year}</span>
                            </div>
                            {/* Node */}
                            <div className="shrink-0 mt-2.5 flex flex-col items-center">
                                <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-[0_0_16px_rgba(34,197,94,0.7)] ring-4 ring-green-500/15" />
                            </div>
                            {/* Card */}
                            <div className="flex-1 bg-white/[0.03] border border-green-500/15 rounded-2xl p-6 hover:bg-white/[0.05] hover:border-green-500/25 transition-all">
                                <span className="text-[10px] uppercase tracking-widest text-green-400/60">{t.tag}</span>
                                <h3 className="text-xl font-bold text-white mt-1 mb-3">{t.entity}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{t.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Project types grid */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Project Categories</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projectCategories.map((cat, i) => (
                        <div
                            key={i}
                            className="bg-white/[0.025] border border-white/8 rounded-2xl p-6 hover:bg-white/[0.04] transition-colors group"
                        >
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.accent }} />
                                <span className="text-[10px] uppercase tracking-widest" style={{ color: cat.accent }}>{cat.label}</span>
                            </div>
                            <ul className="space-y-2.5">
                                {cat.items.map((item, j) => (
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

            {/* Key facts */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Key Facts</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {project.keyFacts?.map((fact, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-green-500/5 border border-green-500/15 rounded-xl">
                            <span className="text-green-500 shrink-0 mt-0.5">▸</span>
                            <span className="text-gray-300 text-sm leading-relaxed">{fact}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Design Philosophy */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Philosophy</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            title: "Renovation Over New Build",
                            body: "Malaysia's mass housing stock has a hidden opportunity - occupants constantly modify their units to express identity. Lakar's model was built on this insight: designer renovation at 20-30% less than boutique rates, by treating the design system as a repeatable product rather than a bespoke service.",
                        },
                        {
                            title: "Design + Technology",
                            body: "Smart home integration started as a free add-on for architecture clients - a live testing ground. Field-testing across real client projects before personal deployment meant every system that made it into the offering had been proven in use. Multi-protocol (Zigbee, IR, RF, WiFi, Bluetooth) unified into a single-app experience.",
                        },
                        {
                            title: "Controlled Growth",
                            body: "Three entities in nine years: design studio to design+build firm to Sdn Bhd. Each evolution was driven by a specific barrier - design-only contracts moving too slowly through approval chains, then the need for clean partner structures and delegation. Growth was deliberate, not reactive.",
                        },
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-green-500/5 border border-green-500/12 rounded-2xl">
                            <h3 className="text-base font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* What Made Lakar Different */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">What Made Lakar Different</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {
                            title: 'Smart Home as a Living Lab',
                            body: "Smart home integration wasn't a product add-on — it was field research. Every protocol (Zigbee, IR, RF, WiFi, Bluetooth) was stress-tested across real client projects before being deployed in my own home. The clients got a free upgrade; I got live data on what actually worked. By the time it became a standard Lakar service, every system decision had already been proven in use.",
                        },
                        {
                            title: 'Japan-Inspired Small-Space Design',
                            body: "Studio apartments at Empire Damansara Soho were an early experiment in designing for density and liveability — before compact living was mainstream in Malaysia. Japan's approach to spatial efficiency (every surface doing double duty, light shaping how a space feels) became a permanent influence on how I approached even large-format residential projects.",
                        },
                        {
                            title: 'Material Experimentation',
                            body: 'Sustainable design ran through the project portfolio as hands-on material research: water-resistant and fire-resistant kitchen surfaces, passive airflow strategies in tropical builds, innovative surface treatments evaluated against real SME budgets and lifespan constraints. Each experiment was deployed in a paying project, not a mock-up.',
                        },
                        {
                            title: 'Early BIM & Infrastructure Adoption',
                            body: 'Before BIM was standard practice in Malaysia, Lakar provided 3D modelling services for MRT Station KL — digitally modelling infrastructure before digital construction workflows were the norm. This included BRT proposals and civic infrastructure visualisation. Being ahead of industry tools meant building the expertise before the industry demanded it.',
                        },
                        {
                            title: 'Affordable Design for SME Clients',
                            body: 'The founding premise was that designer quality and boutique prices were falsely linked. By treating the design system as a repeatable product — not a bespoke service — Lakar could deliver high-quality interiors at 20–30% below boutique rates. This made professional design accessible to a client base (SMEs, small F&B operators, young homeowners) that boutique firms systematically ignored.',
                        },
                        {
                            title: 'Sustainable Cooling Design',
                            body: 'Tropical Malaysian climate made passive cooling a recurring design consideration from day one. Early experiments with cross-ventilation strategies, thermal mass in affordable builds, and material choices that reduced solar heat gain were direct precursors to the deeper research that followed. The gap between what buildings could do passively and what they actually did was always visible.',
                        },
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-green-500/5 border border-green-500/12 rounded-2xl hover:bg-green-500/8 transition-colors">
                            <h3 className="text-base font-bold text-white mb-3">{item.title}</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* PDF embed */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Constructed Project Portfolio</span>
                    <a href="/docs/lakar-projects.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-400 hover:text-green-300 underline uppercase tracking-widest">Open Full Screen</a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe src="/docs/lakar-projects.pdf#navpanes=0&toolbar=0&view=FitH" className="w-full h-[700px]" title="Lakar Design — Constructed Project Portfolio" />
                </div>
            </section>
        </div>
    );
}
