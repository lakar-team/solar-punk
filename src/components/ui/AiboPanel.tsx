'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/useStore';
import { projects } from '@/data/projects';
import type { VrmViewerHandle } from './VrmViewer';

// Load VRM viewer client-side only (Three.js requires browser)
const VrmViewer = dynamic(() => import('./VrmViewer'), { ssr: false });

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AiboPanel() {
    const activePlanetId = useStore(s => s.activePlanetId);
    const activePlanet = activePlanetId ? projects.find(p => p.id === activePlanetId) : null;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [vrmReady, setVrmReady] = useState(false);

    const vrmRef = useRef<VrmViewerHandle>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Greet when panel first opens (only once)
    const hasGreeted = useRef(false);
    useEffect(() => {
        if (vrmReady && !hasGreeted.current) {
            hasGreeted.current = true;
            sendMessage('Greet the visitor warmly. Introduce yourself briefly and offer to guide them through the portfolio.', true);
        }
    }, [vrmReady]);

    const sendMessage = useCallback(async (text: string, isSystem = false) => {
        if (!text.trim()) return;

        if (!isSystem) {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
        }
        setInput('');
        setIsThinking(true);

        try {
            const res = await fetch('/api/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, activePlanetId }),
            });
            const data = await res.json() as { reply?: string; error?: string };
            const reply = data.reply || "I seem to have lost my crystal ball for a moment. Try again?";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            vrmRef.current?.speakWithLipSync(reply);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection to the spirit realm failed. Try again shortly." }]);
        } finally {
            setIsThinking(false);
        }
    }, [activePlanetId]);

    const handleSubmit = () => {
        if (!isThinking && input.trim()) sendMessage(input);
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* VRM Avatar */}
            <div className="relative h-48 flex-shrink-0 bg-black/40">
                <VrmViewer
                    ref={vrmRef}
                    isEmbedded
                    onLoaded={() => setVrmReady(true)}
                />
                {!vrmReady && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-amber-400/60 text-xs uppercase tracking-widest animate-pulse">
                            Summoning Web Witch…
                        </span>
                    </div>
                )}
                {/* Planet context badge */}
                {activePlanet && (
                    <div className="absolute bottom-2 left-2 right-2 text-center">
                        <span className="text-[10px] text-amber-400/70 uppercase tracking-widest">
                            Viewing: {activePlanet.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {messages.length === 0 && !isThinking && (
                    <p className="text-zinc-600 text-xs text-center pt-4 uppercase tracking-widest">
                        Ask Web Witch anything…
                    </p>
                )}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`text-xs leading-relaxed ${
                            msg.role === 'user'
                                ? 'text-right text-amber-300/80'
                                : 'text-left text-zinc-300'
                        }`}
                    >
                        {msg.role === 'assistant' && (
                            <span className="text-amber-500/60 mr-1">✦</span>
                        )}
                        {msg.content}
                    </div>
                ))}
                {isThinking && (
                    <div className="text-xs text-amber-400/50 animate-pulse">
                        <span className="text-amber-500/60 mr-1">✦</span>
                        Consulting the oracle…
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-amber-500/20 p-2 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                    placeholder={isThinking ? 'Thinking…' : 'Ask about the portfolio…'}
                    disabled={isThinking}
                    className="flex-1 bg-white/5 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-600 outline-none border border-white/10 focus:border-amber-500/50 transition-colors disabled:opacity-40"
                />
                <button
                    onClick={handleSubmit}
                    disabled={isThinking || !input.trim()}
                    className="px-3 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-colors disabled:opacity-30"
                >
                    ➤
                </button>
            </div>
        </div>
    );
}
