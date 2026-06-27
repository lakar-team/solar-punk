import { Project } from '@/data/projects';
import Link from 'next/link';

interface PdfDoc {
    label: string;
    url: string;
}

interface Props {
    project: Project;
    pdfDocs?: PdfDoc[];
}

export default function ProjectDetailLayout({ project, pdfDocs }: Props) {
    return (
        <div className="min-h-screen bg-[#050508] text-white">
            {/* Starfield-like radial gradient backdrop */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#050508_60%)] pointer-events-none" />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-white/50 hover:text-amber-400 transition-colors text-xs uppercase tracking-widest flex items-center gap-2"
                    >
                        ← Portfolio
                    </Link>
                    <span className="text-xs text-white/20 uppercase tracking-widest font-mono">
                        ADAM M. RAMAN
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="relative max-w-4xl mx-auto px-6 pt-28 pb-24">
                {/* Type badge */}
                <div className="mb-5">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] uppercase tracking-wider border ${
                        project.status === 'in-progress'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-white/10 text-blue-300 border-white/10'
                    }`}>
                        {project.type}{project.status === 'in-progress' ? ' • In Progress' : ''}
                    </span>
                </div>

                {/* Project name */}
                <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/30 mb-6 leading-tight">
                    {project.name}
                </h1>

                <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent mb-10" />

                {/* Description */}
                <p className="text-lg text-gray-300 leading-relaxed mb-10">
                    {project.description}
                </p>

                {/* Key Facts */}
                {project.keyFacts && project.keyFacts.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-[10px] uppercase tracking-widest text-white/30 mb-5">Key Facts</h2>
                        <div className="space-y-4">
                            {project.keyFacts.map((fact, i) => (
                                <div key={i} className="flex items-start gap-3 text-gray-300">
                                    <span className="mt-1 text-amber-500 shrink-0 text-sm">▸</span>
                                    <span className="text-base">{fact}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Image gallery */}
                {project.images && project.images.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-[10px] uppercase tracking-widest text-white/30 mb-5">Gallery</h2>
                        <div className={`grid gap-4 ${project.images.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                            {project.images.map((src, i) => (
                                <div key={i} className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                                    <img
                                        src={src}
                                        alt={`${project.name} — ${i + 1}`}
                                        className="w-full h-72 object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Single thumbnail */}
                {project.image && !project.images && (
                    <section className="mb-12">
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5 flex justify-center items-center">
                            <img
                                src={project.image}
                                alt={project.name}
                                className="max-w-full max-h-[500px] object-contain"
                            />
                        </div>
                    </section>
                )}

                {/* PDF Documents */}
                {pdfDocs && pdfDocs.length > 0 && (
                    <section className="space-y-8">
                        <h2 className="text-[10px] uppercase tracking-widest text-white/30">Documents</h2>
                        {pdfDocs.map((doc, i) => (
                            <div key={i} className="rounded-xl overflow-hidden border border-white/10 bg-black/50">
                                <div className="p-3 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <span className="text-sm text-white/60">{doc.label}</span>
                                    <a
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-amber-500 hover:text-amber-400 underline uppercase tracking-widest"
                                    >
                                        Open Full Screen
                                    </a>
                                </div>
                                <iframe
                                    src={`${doc.url}#navpanes=0&toolbar=0&view=FitH`}
                                    className="w-full h-[700px]"
                                    title={doc.label}
                                />
                            </div>
                        ))}
                    </section>
                )}
            </main>
        </div>
    );
}
