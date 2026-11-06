'use client';

import { useState } from 'react';

const CVS = [
    { id: 'tech', label: 'Tech CV', subtitle: 'Product Strategy · AI Innovation · Built Environment Technology', path: '/cv/tech' },
    { id: 'aec', label: 'AEC CV', subtitle: 'Architecture · Building Energy & MEP · Design-Build Delivery', path: '/cv/aec' },
] as const;

export default function CvViewer() {
    const [activeId, setActiveId] = useState<(typeof CVS)[number]['id']>('tech');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const active = CVS.find(cv => cv.id === activeId)!;

    const copyLink = (cv: (typeof CVS)[number]) => {
        navigator.clipboard.writeText(`${window.location.origin}${cv.path}`).then(() => {
            setCopiedId(cv.id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return (
        <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
                {CVS.map(cv => (
                    <div
                        key={cv.id}
                        className={`rounded-xl border p-4 transition-colors ${cv.id === activeId ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/10 bg-white/[0.02]'}`}
                    >
                        <button onClick={() => setActiveId(cv.id)} className="w-full text-left">
                            <div className="text-sm font-bold uppercase tracking-wider text-white">{cv.label}</div>
                            <div className="mt-1 text-xs text-white/40">{cv.subtitle}</div>
                        </button>
                        <div className="mt-3 flex items-center gap-4">
                            <a
                                href={cv.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-amber-400 hover:text-amber-300 underline uppercase tracking-widest"
                            >
                                Open Full Page
                            </a>
                            <button
                                onClick={() => copyLink(cv)}
                                className="text-[10px] text-white/40 hover:text-amber-400 uppercase tracking-widest transition-colors"
                            >
                                {copiedId === cv.id ? '✓ Link Copied' : 'Copy Link'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                <iframe
                    key={active.id}
                    src={active.path}
                    className="w-full h-[800px] bg-white"
                    title={`Adam M. Raman ${active.label}`}
                />
            </div>
        </>
    );
}
