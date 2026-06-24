'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { projects } from '@/data/projects';

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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasGreeted = useRef(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
            const data = await res.json() as { reply?: string };
            const reply = data.reply || "I seem to have lost my crystal ball. Try again?";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection lost. Try again shortly." }]);
        } finally {
            setIsThinking(false);
        }
    }, [activePlanetId]);

    // Greet once on mount
    useEffect(() => {
        if (!hasGreeted.current) {
            hasGreeted.current = true;
            sendMessage('Greet the visitor warmly and briefly. Offer to guide them through the portfolio.', true);
        }
    }, [sendMessage]);

    const handleSubmit = () => {
        if (!isThinking && input.trim()) sendMessage(input);
    };

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header with witch icon */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-amber-500/20">
                <span className="text-2xl">🔮</span>
                <div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Web Witch</p>
                    {activePlanet && (
                        <p className="text-[10px] text-amber-400/50">Viewing: {activePlanet.name}</p>
                    )}
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {messages.length === 0 && !isThinking && (
                    <p className="text-zinc-600 text-xs text-center pt-6 uppercase tracking-widest">
                        Ask about the portfolio…
                    </p>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] text-xs leading-relaxed px-3 py-2 rounded-lg ${
                            msg.role === 'user'
                                ? 'bg-amber-500/20 text-amber-200 rounded-br-none'
                                : 'bg-white/5 text-zinc-300 rounded-bl-none'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 rounded-lg rounded-bl-none px-3 py-2">
                            <span className="text-amber-400/60 text-xs animate-pulse">✦ ✦ ✦</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-amber-500/20 p-3 flex gap-2">
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
                    className="px-3 py-2 rounded-full text-sm text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-colors disabled:opacity-30"
                >
                    ➤
                </button>
            </div>
        </div>
    );
}
