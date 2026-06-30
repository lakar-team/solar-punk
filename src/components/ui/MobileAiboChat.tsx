'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function MobileAiboChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [streamingText, setStreamingText] = useState('');
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasGreeted = useRef(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingText]);

    const speakText = useCallback((text: string) => {
        if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.95;
        utt.pitch = 1.05;
        window.speechSynthesis.speak(utt);
    }, [isMuted]);

    const sendMessage = useCallback(async (text: string, isSystem = false) => {
        if (!text.trim()) return;
        if (!isSystem) setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInput('');
        setIsThinking(true);
        setStreamingText('');

        try {
            const res = await fetch('/api/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });

            if (!res.ok || !res.body) {
                throw new Error('Network error');
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            let finalReply = '';
            let tokenBuf = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += decoder.decode(value, { stream: true });
                const lines = buf.split('\n');
                buf = lines.pop() ?? '';
                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const msg = JSON.parse(line) as { t?: string; done?: boolean; reply?: string; error?: string };
                        if (msg.t) {
                            tokenBuf += msg.t;
                            setStreamingText(tokenBuf);
                        } else if (msg.done && msg.reply) {
                            finalReply = msg.reply;
                        } else if (msg.error) {
                            finalReply = "I seem to have lost my crystal ball. Try again?";
                        }
                    } catch { /* skip malformed lines */ }
                }
            }

            const reply = finalReply || tokenBuf || "I seem to have lost my crystal ball. Try again?";
            setStreamingText('');
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            speakText(reply);
        } catch {
            setStreamingText('');
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection lost. Try again shortly." }]);
        } finally {
            setIsThinking(false);
        }
    }, [speakText]);

    useEffect(() => {
        if (!hasGreeted.current) {
            hasGreeted.current = true;
            sendMessage('Greet the visitor warmly and briefly. Offer to guide them.', true);
        }
    }, [sendMessage]);

    const toggleMute = () => {
        if (!isMuted && typeof window !== 'undefined') {
            window.speechSynthesis?.cancel();
        }
        setIsMuted(v => !v);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Web Witch</span>
                </div>
                <button
                    onClick={toggleMute}
                    title={isMuted ? 'Unmute voice' : 'Mute voice'}
                    className="text-slate-500 hover:text-amber-400 transition-colors p-1 text-base"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? '🔇' : '🔊'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {messages.length === 0 && !isThinking && !streamingText && (
                    <p className="text-zinc-500 text-xs text-center pt-6 uppercase tracking-widest">Ask about the portfolio…</p>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] text-xs leading-relaxed px-3 py-2 rounded-lg ${
                            msg.role === 'user'
                                ? 'bg-amber-500/20 text-amber-100 rounded-br-none'
                                : 'bg-white/5 text-zinc-300 rounded-bl-none'
                        }`}>{msg.content}</div>
                    </div>
                ))}
                {(isThinking || streamingText) && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 rounded-lg rounded-bl-none px-3 py-2 max-w-[85%]">
                            {streamingText
                                ? <span className="text-zinc-300 text-xs leading-relaxed">{streamingText}</span>
                                : <span className="text-amber-400/60 text-xs animate-pulse">✦ ✦ ✦</span>
                            }
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 border-t border-amber-500/20 p-3 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !isThinking && input.trim()) sendMessage(input); }}
                    placeholder={isThinking ? 'Thinking…' : 'Ask about the portfolio…'}
                    disabled={isThinking}
                    className="flex-1 bg-white/5 rounded-full px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none border border-white/10 focus:border-amber-500/50 transition-colors disabled:opacity-40"
                />
                <button
                    onClick={() => { if (!isThinking && input.trim()) sendMessage(input); }}
                    disabled={isThinking || !input.trim()}
                    className="px-4 py-2.5 rounded-full text-sm text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 active:bg-amber-500/20 transition-colors disabled:opacity-30"
                >➤</button>
            </div>
        </div>
    );
}
