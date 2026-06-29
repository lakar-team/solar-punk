import Link from 'next/link';
import { projects } from '@/data/projects';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Smart Home Lab | Adam M. Raman',
    description: 'Field-tested smart home systems across 3 real-world client projects before a full personal install.',
};

export default function SmartHomePage() {
    const project = projects.find(p => p.id === 'smart-home')!;

    const timeline = [
        {
            year: '2014',
            title: 'Tesla Spark',
            detail: 'Tesla\'s first practical self-driving car proves that autonomous systems can exist in the real world. The parallel for housing becomes immediately clear: if cars can become autonomous, why not buildings? This is the starting point.',
        },
        {
            year: '2015',
            title: 'Wired Experiments',
            detail: 'Investigations begin with wired home components — lights, speakers, and charging embedded into furniture. Components are expensive; the product wouldn\'t be market-viable yet. But the concept is validated.',
        },
        {
            year: '2018',
            title: 'Smart Switches Arrive',
            detail: 'Smart switches and lights begin appearing in the market. Early versions require neutral wire, making installation in renovation projects costly and disruptive. First generation limitations noted.',
        },
        {
            year: '2019',
            title: 'China Changes the Market',
            detail: 'Chinese-manufactured components rival European quality at a fraction of the cost. Wireless capability eliminates wiring constraints. Early players bring bulk imports to Malaysia with warranties.',
        },
        {
            year: '2020',
            title: 'Client Field Tests',
            detail: 'Free smart home upgrades offered to architecture clients — a real-world testing ground where cost and liability are managed. A small percentage of each project budget goes to live experimentation. Results feed into system design knowledge.',
        },
    ];

    const testInstalls = [
        {
            label: '01',
            title: '1st Installation',
            location: 'Condominium · Bukit Jalil',
            focus: 'Voice → IR control',
            detail: 'Trial of Google Home controlling an IR sensor in a single space. Achieved voice control of TV, fan, and air conditioning remote. Proof of concept: one speaker, one room, full control.',
        },
        {
            label: '02',
            title: '2nd Installation',
            location: 'Bungalow · Sungai Penchala',
            focus: 'Multi-room + motion',
            detail: 'Linked voice control to wired lighting and fan switches. Motion sensors deployed. Larger space: two fans, two AC units. Partnered with Explosoft for parts warranty and installation support. Learned: manufacturer lock-in limits 3rd-party adaptability.',
        },
        {
            label: '03',
            title: '3rd Installation',
            location: 'Condominium · Menjalara (Personal)',
            focus: 'Zigbee + open protocol',
            detail: 'Personal project — maximum flexibility. Open product sourcing for long-term adaptability. Zigbee network deployed alongside WiFi to avoid network congestion. Multiple instances of each component across multiple spaces. Key learning: vampire load raises electricity bill vs non-connected home.',
        },
    ];

    const systemComponents = [
        { name: 'WiFi Router', role: 'Network Core', detail: 'Distributes incoming fibre into a wireless network — the backbone that connects all WiFi-enabled smart components.' },
        { name: 'Google Smart Speaker', role: 'Voice + Cloud AI', detail: 'Microphone and speaker connected to Google\'s cloud AI. Voice control, web connectivity, and phone compatibility across all systems.' },
        { name: 'Zigbee Hub', role: 'Secondary Network', detail: 'Alternative wireless network with higher device capacity. Keeps smart devices off the main WiFi. Local-only — uninterrupted if WiFi drops.' },
        { name: 'Smart Switch', role: 'Load Control', detail: 'On/off state reported to the network; instructions received wirelessly. Eliminates the need for neutral wire in later generations.' },
        { name: 'IR / RF Remote', role: 'Legacy Bridge', detail: 'Copies infrared/RF signals from standard household remotes. Digitises the remote, making it controllable through the smart home network.' },
        { name: 'Motion Sensors', role: 'Context Awareness', detail: 'Ultrasonic wave detection. Disruption triggers automation rules. Enables presence-based logic without manual input.' },
        { name: 'Smart Curtain', role: 'Actuator', detail: 'Plugged-in electric motor chosen over battery (motor demands high energy). Receives wireless position instructions. Controls natural light without manual intervention.' },
    ];

    const limitations = [
        {
            title: 'Network Congestion',
            detail: 'As components multiply, the network gets crowded — signal delays and mixed signals become real problems. Range and wall-penetration limits compound the issue in built environments.',
        },
        {
            title: 'IFTTT Intelligence Cap',
            detail: '"If This Then That" — precise instructions for precise triggers. This system lacks genuine AI: it can\'t learn usage patterns, predict behaviour, or adapt to complex household situations autonomously.',
        },
        {
            title: 'Vampire Load',
            detail: 'Always-on wireless components draw standby power continuously. In testing, the connected home drew noticeably more electricity than an equivalent unconnected unit — a cost that users rarely see in advance.',
        },
    ];

    return (
        <div className="min-h-screen bg-[#090907] text-white overflow-x-hidden">
            {/* Terminal scan-line effect */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.018]"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, rgba(251,191,36,1) 0px, rgba(251,191,36,1) 1px, transparent 1px, transparent 4px)',
                }}
            />
            {/* Amber glow */}
            <div className="fixed top-[-100px] right-[-50px] w-[700px] h-[500px] rounded-full bg-yellow-500/6 blur-3xl pointer-events-none" />
            <div className="fixed bottom-[-200px] left-[-100px] w-[600px] h-[400px] rounded-full bg-amber-500/4 blur-3xl pointer-events-none" />

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
                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
                    <span className="text-[11px] uppercase tracking-[0.35em] text-amber-400/70">Hobby · IoT Research · Malaysia + Japan</span>
                </div>
                <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-black leading-[0.9] text-transparent bg-clip-text bg-gradient-to-br from-white via-yellow-100/90 to-amber-400/40 mb-8">
                    Smart<br />Home Lab
                </h1>
                <p className="max-w-2xl text-lg text-gray-400 leading-relaxed">
                    {project.description}
                </p>
            </section>

            {/* Stats */}
            <div className="border-y border-white/8 bg-white/[0.015]">
                <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { value: '6', label: 'Years R&D', sub: '2014 → 2020' },
                        { value: '3', label: 'Test Sites', sub: 'real client environments' },
                        { value: '4+', label: 'Protocols', sub: 'Zigbee · WiFi · IR · RF' },
                        { value: '7', label: 'Device Types', sub: 'switches · sensors · actuators' },
                    ].map((s, i) => (
                        <div key={i}>
                            <div className="text-4xl md:text-5xl font-black text-amber-400 leading-none">{s.value}</div>
                            <div className="text-[10px] uppercase tracking-widest text-white/40 mt-2">{s.label}</div>
                            <div className="text-[11px] text-white/25 mt-1">{s.sub}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Development timeline */}
            <section className="max-w-5xl mx-auto px-6 py-16">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Development Timeline</span>
                </div>
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/40 via-amber-500/20 to-transparent" />
                    <div className="space-y-10 pl-8">
                        {timeline.map((t, i) => (
                            <div key={i} className="relative">
                                {/* Dot */}
                                <div className="absolute -left-10 top-1.5 w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.7)] ring-4 ring-amber-500/15" />
                                <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-6">
                                    <span className="shrink-0 text-xl font-black text-amber-400/50 min-w-12">{t.year}</span>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-2">{t.title}</h3>
                                        <p className="text-sm text-gray-400 leading-relaxed">{t.detail}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Test installations */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Field Test Installations · 2020</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {testInstalls.map((inst, i) => (
                        <div key={i} className="bg-white/[0.025] border border-amber-500/12 rounded-2xl p-6 hover:border-amber-500/25 hover:bg-white/[0.04] transition-all">
                            <div className="text-[10px] font-mono text-amber-500/40 mb-3">{inst.label}</div>
                            <h3 className="text-lg font-black text-white mb-1">{inst.title}</h3>
                            <div className="text-[11px] uppercase tracking-widest text-amber-400/60 mb-1">{inst.location}</div>
                            <div className="text-[11px] uppercase tracking-widest text-white/30 mb-4">{inst.focus}</div>
                            <div className="h-px bg-white/8 mb-4" />
                            <p className="text-sm text-gray-400 leading-relaxed">{inst.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* System components */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">System Components</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {systemComponents.map((c, i) => (
                        <div key={i} className="bg-amber-500/5 border border-amber-500/12 rounded-xl p-5 hover:bg-amber-500/8 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span className="text-[10px] uppercase tracking-widest text-amber-400/60">{c.role}</span>
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">{c.name}</h3>
                            <p className="text-xs text-gray-500 leading-relaxed">{c.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Limitations */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8">
                <div className="mb-12">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Honest Limitations</span>
                </div>
                <div className="space-y-4">
                    {limitations.map((l, i) => (
                        <div key={i} className="flex items-start gap-5 p-6 bg-white/[0.02] border border-white/6 rounded-xl hover:border-amber-500/15 transition-colors">
                            <span className="shrink-0 w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-[10px] font-mono text-white/30 mt-0.5">{i + 1}</span>
                            <div>
                                <h3 className="text-sm font-bold text-white/80 mb-2">{l.title}</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">{l.detail}</p>
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
                        <div key={i} className="flex items-start gap-4 p-5 bg-amber-500/5 border border-amber-500/12 rounded-xl">
                            <span className="text-amber-500 shrink-0 mt-0.5">▸</span>
                            <span className="text-gray-300 text-sm leading-relaxed">{fact}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Video + PDF */}
            <section className="max-w-5xl mx-auto px-6 py-16 border-t border-white/8 space-y-8">
                <div className="mb-2">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/25">Resources</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                        href="https://drive.google.com/file/d/13btXTHvz0uGBelzHlF5YX623mW48Un44/view?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-6 bg-amber-500/8 border border-amber-500/20 rounded-2xl hover:bg-amber-500/12 hover:border-amber-500/35 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 text-xl shrink-0">
                            ▶
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-amber-400/60 mb-1">Video</div>
                            <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">Watch Video Tour</div>
                            <div className="text-xs text-gray-500">Full walkthrough of the smart home system</div>
                        </div>
                    </a>
                    <a
                        href="/docs/smart-home.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] hover:border-white/20 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white/60 text-xl shrink-0">
                            ☰
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Document</div>
                            <div className="text-sm font-bold text-white group-hover:text-white/80 transition-colors">Smart Home Experiments Report</div>
                            <div className="text-xs text-gray-500">Full experimental documentation</div>
                        </div>
                    </a>
                </div>

                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                    <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/[0.03]">
                        <span className="text-sm text-white/50">Smart Home Experiments Report</span>
                        <a href="/docs/smart-home.pdf" target="_blank" rel="noopener noreferrer" className="text-[10px] text-amber-400 hover:text-amber-300 underline uppercase tracking-widest">Open Full Screen</a>
                    </div>
                    <iframe src="/docs/smart-home.pdf#navpanes=0&toolbar=0&view=FitH" className="w-full h-[700px]" title="Smart Home Experiments Report" />
                </div>
            </section>
        </div>
    );
}
