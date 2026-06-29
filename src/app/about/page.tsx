import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Adam M. Raman | Portfolio',
    description: 'Architect, technologist, and former founder. A decade in the built environment, 4 years of PhD research in climate science, and 5 years building precision AI and software tools.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#07080a] text-white overflow-x-hidden">
            {/* Subtle amber grid */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(245,158,11,0.03) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }}
            />
            <div className="fixed top-[-200px] right-[-100px] w-[800px] h-[600px] rounded-full bg-amber-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-orange-500/4 blur-3xl pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/8">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="text-white/40 hover:text-amber-400 transition-colors text-xs uppercase tracking-widest flex items-center gap-2">
                        ← Portfolio
                    </Link>
                    <span className="hidden md:block text-[10px] text-white/20 uppercase tracking-[0.3em] font-mono">ADAM M. RAMAN · SOLAR PUNK PORTFOLIO</span>
                </div>
            </header>

            {/* Hero */}
            <section className="relative max-w-5xl mx-auto px-6 pt-36 pb-20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-amber-400/70">Background · Career · Research</span>
                </div>
                <h1 className="text-[clamp(3.5rem,10vw,7rem)] font-black leading-[0.88] text-transparent bg-clip-text bg-gradient-to-br from-white via-amber-100/80 to-amber-500/50 mb-8">
                    Adam M.<br />Raman
                </h1>
                <div className="max-w-2xl space-y-4">
                    <p className="text-xl text-amber-200/70 font-medium">Architect · Technologist · Innovation Specialist</p>
                    <p className="text-base text-gray-400 leading-relaxed">
                        I solve problems by looking where others don&apos;t — merging lessons from nature with deep technical engineering.
                        After a decade of leadership and a successfully bootstrapped firm, I dedicated 4 years to PhD research in
                        climate-conscious building science at Tohoku University, with ongoing research and development continuing with
                        the university. Now at the intersection of architecture, AI, and software: making complex systems — energy,
                        space, data — feel intuitive from the inside out.
                    </p>
                </div>
            </section>

            {/* Quick stats */}
            <div className="border-y border-white/8 bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {[
                        { value: '10+', label: 'Years Built Environment', sub: 'Architecture & Construction' },
                        { value: '¥42M', label: 'Peak Annual Revenue', sub: 'Lakar Design, 2021' },
                        { value: '50%', label: 'Cooling Load Reduction', sub: 'PhD validated result' },
                        { value: '5+', label: 'Years Applied AI & IoT', sub: 'Tools built and shipped' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-4xl md:text-5xl font-black text-amber-400 leading-none">{s.value}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2">{s.label}</div>
                            <div className="text-[11px] text-white/25 mt-1">{s.sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Qualifications */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-b border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Academic Background</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        {
                            degree: 'Master of Architecture',
                            institution: 'University of Manchester',
                            country: 'United Kingdom',
                            detail: 'Postgraduate architectural design with focus on sustainable urban systems and human-centric planning. Thesis work centred on social housing and green corridor master planning.',
                        },
                        {
                            degree: '4 Years PhD Research · Building Energy Science',
                            institution: 'Tohoku University',
                            country: 'Japan · 2022–Present',
                            detail: 'Research focus: solar-regenerated passive desiccant cooling for hot-humid climates. Engineered a charcoal desiccant system achieving a validated 50% reduction in cooling energy load. Presented at the Kyoto International Conference on Urban Climate. Ongoing research and development continuing with the university.',
                        },
                    ].map((q, i) => (
                        <div key={i} className="p-6 bg-amber-500/5 border border-amber-500/15 rounded-2xl">
                            <div className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-1">{q.country}</div>
                            <h3 className="text-lg font-bold text-white mb-1">{q.degree}</h3>
                            <div className="text-sm text-amber-300/60 mb-3">{q.institution}</div>
                            <p className="text-sm text-gray-400 leading-relaxed">{q.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Career narrative */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-b border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Career Story</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="md:col-span-2 space-y-6 text-gray-400 leading-relaxed">
                        <p>
                            I trained as an architect and within my first year as a graduate at S&A Architects in Malaysia,
                            I designed a sustainable low-rise master plan that secured the PAM Silver Award 2017. The design
                            anchored housing nodes around connected green ribbons leading to a central social hub — a concept
                            good enough to be adopted as a prototypical standard by one of Malaysia&apos;s largest property developers.
                        </p>
                        <p>
                            In 2012 I spotted a gap in the market: people wanted designer interiors but couldn&apos;t justify
                            boutique prices. I founded Lakar Design to close that gap — building a scalable, repeatable
                            high-quality renovation system I could grow without sacrificing craft. The firm achieved
                            100% year-on-year revenue growth for eight consecutive years, scaling from ¥1.8M to ¥42M
                            in annual revenue and eventually incorporating as three separate entities.
                        </p>
                        <p>
                            Alongside the firm, I became an early adopter of smart home technology — field-testing
                            multi-protocol systems (Zigbee, IR, RF, WiFi, Bluetooth) across client projects before
                            building a fully integrated version in my own home. I also taught Design Thinking and
                            Human Sensibility as an Assistant Lecturer at UiTM Malaysia from 2016 to 2019.
                        </p>
                        <p>
                            In 2022 I made a deliberate decision to step back and research the question that kept
                            coming back from the smart home years: why did buildings still feel uncomfortable despite
                            all the technology available? The gap wasn&apos;t in the hardware — it was in the building
                            envelope itself. That question brought me to Tohoku University and a PhD focused on
                            solar-regenerated passive dehumidification for hot-humid climates. The result: a
                            charcoal desiccant system with a validated 50% reduction in cooling energy load.
                        </p>
                        <p>
                            I presented this research at the Kyoto International Conference and at the Japan
                            Institute of Architects international symposium, representing the Malaysian perspective
                            on cross-cultural design thinking. 4 years of PhD research at Tohoku University, with
                            ongoing research and development continuing with the university. Alongside this, I work
                            as a Building Energy Consultant at Refil Japan — designing energy systems for new builds
                            and building internal automation tools that cut deliverable cycle times by 40%.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="text-[10px] uppercase tracking-widest text-white/25 mb-4">Milestones</div>
                        {[
                            { year: '2009', note: 'Graduate Architect, S&A Architects' },
                            { year: '2011', note: 'PAM Award 2017 master plan designed' },
                            { year: '2012', note: 'Founded Lakar Design Studio' },
                            { year: '2015', note: 'Expanded to Design + Build firm' },
                            { year: '2016', note: 'Assistant Lecturer, UiTM Malaysia' },
                            { year: '2020', note: 'Smart home systems deployed at scale' },
                            { year: '2021', note: 'Incorporated Lakar (Malaysia) Sdn Bhd' },
                            { year: '2022', note: 'PhD begins at Tohoku University' },
                            { year: '2023', note: 'Kyoto Conference presentation' },
                            { year: '2025', note: 'Building Energy Consultant, Refil Japan (research ongoing)' },
                        ].map((m, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                                <span className="text-[10px] text-amber-400/40 font-mono shrink-0 w-10 mt-0.5">{m.year}</span>
                                <span className="text-white/50">{m.note}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Career timeline */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-b border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Career Timeline</span>
                </div>
                <div className="space-y-0">
                    {[
                        {
                            period: '2025 – present',
                            role: 'Building Energy Consultant & Process Automation',
                            org: 'Refil Japan',
                            detail: 'Designing HVAC and AC load calculations for residential and commercial new builds across Tohoku. Built internal tools ensuring JIS standards compliance — cutting deliverable cycle times by 40%. Tools: Rebro (MEP/BIM), Stabro (building energy).',
                        },
                        {
                            period: '2022 – Present',
                            role: 'PhD Researcher',
                            org: 'Tohoku University, Japan',
                            detail: '4 years of PhD research in solar-regenerated passive desiccant cooling for hot-humid climates. Engineered a charcoal desiccant system achieving a validated 50% reduction in cooling energy load. Presented at Kyoto International Conference and Japan Institute of Architects symposium. Ongoing research and development continuing with the university.',
                        },
                        {
                            period: '2012 – 2022',
                            role: 'Founder & Design Lead',
                            org: 'Lakar Design, Malaysia',
                            detail: '10 years running a design-build firm scaled from a one-man studio to ¥42M in annual revenue. 40+ projects across residential, commercial, F&B, smart homes, and infrastructure. 100% YoY growth for 8 consecutive years.',
                        },
                        {
                            period: '2016 – 2019',
                            role: 'Assistant Lecturer',
                            org: 'UiTM Malaysia',
                            detail: 'Taught Design Thinking and Human Sensibility to architecture students alongside running Lakar Design.',
                        },
                        {
                            period: '2009 – 2011',
                            role: 'Graduate Architect',
                            org: 'S&A Architects, Malaysia',
                            detail: 'Designed the Denai Alam Phase J15 sustainable master plan in the first year — winning the PAM Silver Award 2017 and adopted as a developer standard.',
                        },
                    ].map((t, i, arr) => (
                        <div key={i} className="relative flex gap-6 md:gap-10 pb-12 last:pb-0">
                            {i < arr.length - 1 && (
                                <div className="absolute left-[7.25rem] md:left-[8.75rem] top-12 bottom-0 w-px bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent" />
                            )}
                            <div className="shrink-0 w-24 md:w-32 pt-1 text-right">
                                <span className="text-xs font-mono text-amber-400/50">{t.period}</span>
                            </div>
                            <div className="shrink-0 mt-2.5">
                                <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.7)] ring-4 ring-amber-500/15" />
                            </div>
                            <div className="flex-1 bg-white/[0.025] border border-amber-500/12 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-amber-500/25 transition-all">
                                <h3 className="text-base font-bold text-white mb-0.5">{t.role}</h3>
                                <div className="text-[11px] text-amber-400/60 uppercase tracking-widest mb-3">{t.org}</div>
                                <p className="text-sm text-gray-400 leading-relaxed">{t.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Skills */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-b border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Skills & Expertise</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            area: 'Architecture & Design',
                            color: '#f59e0b',
                            items: ['Architectural Design', 'Human-Centric Design', 'BIM / CAD', 'Sustainable Master Planning', 'Interior Design & Build'],
                        },
                        {
                            area: 'Building Science',
                            color: '#fb923c',
                            items: ['Building Energy Science', 'HVAC System Design', 'AC Load Calculations', 'Climate Tech & Passive Cooling', 'JIS Standards (MEP)'],
                        },
                        {
                            area: 'Technology & AI',
                            color: '#60a5fa',
                            items: ['AI Workflows & RAG Systems', 'Smart Home / IoT (Zigbee, IR, RF)', 'TypeScript / React / Next.js', 'Process Automation', 'Product Strategy & P&L'],
                        },
                    ].map((group, i) => (
                        <div key={i} className="p-6 bg-white/[0.025] border border-white/8 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: group.color }} />
                                <span className="text-[10px] uppercase tracking-widest" style={{ color: group.color }}>{group.area}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {group.items.map((skill, j) => (
                                    <span key={j} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white/60">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Languages */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-b border-white/8">
                <div className="mb-10">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Languages</span>
                </div>
                <div className="flex flex-wrap gap-4">
                    {[
                        { lang: 'English', level: 'C2', note: 'IELTS 8.0' },
                        { lang: 'Malay', level: 'C2', note: 'Native' },
                        { lang: 'Japanese', level: 'N3–N2', note: 'Living & working in Japan' },
                    ].map((l, i) => (
                        <div key={i} className="flex items-center gap-3 px-5 py-3 bg-white/[0.03] border border-white/8 rounded-xl">
                            <span className="text-white font-semibold">{l.lang}</span>
                            <span className="text-amber-400/70 text-sm font-mono">{l.level}</span>
                            <span className="text-white/30 text-xs">{l.note}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* CV download */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-b border-white/8">
                <div className="mb-8 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Tech CV</span>
                    <a href="/Adam_Tech_CV.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-400 hover:text-amber-300 underline uppercase tracking-widest">Open Full Screen</a>
                </div>
                <div className="mb-6">
                    <a
                        href="/Adam_Tech_CV.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-black font-bold uppercase tracking-wider transition-colors rounded-lg"
                    >
                        Download Tech CV (PDF)
                    </a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe
                        src="/Adam_Tech_CV.pdf#navpanes=0&toolbar=0&view=FitH"
                        className="w-full h-[700px]"
                        title="Adam M. Raman Tech CV"
                    />
                </div>
            </section>

            {/* Career Background document */}
            <section className="max-w-5xl mx-auto px-6 py-16">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Career Background 2012–2022</span>
                        <p className="text-xs text-white/30 mt-1">Full narrative from the Lakar Design years — projects, growth, and the path to Japan.</p>
                    </div>
                    <a href="/docs/career-background.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-400 hover:text-amber-300 underline uppercase tracking-widest">Open Full Screen</a>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <iframe
                        src="/docs/career-background.pdf#navpanes=0&toolbar=0&view=FitH"
                        className="w-full h-[700px]"
                        title="Adam M. Raman — Career Background 2012–2022"
                    />
                </div>
            </section>
        </div>
    );
}
