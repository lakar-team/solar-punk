'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useStore } from '@/store/useStore';
import { projects } from '@/data/projects';
import { useKokoroTTS } from '@/hooks/useKokoroTTS';

// ── Camera — frames head-to-thigh ──
function CameraRig() {
    const { camera } = useThree();
    useEffect(() => { camera.lookAt(0, 0.95, 0); }, [camera]);
    return null;
}

// ── VRM model with idle animation ──
function VrmModel({ isSpeaking }: { isSpeaking: boolean }) {
    const [vrm, setVrm] = useState<VRM | null>(null);

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.register((parser) => new VRMLoaderPlugin(parser as ConstructorParameters<typeof VRMLoaderPlugin>[0]));
        loader.load('/avatar.vrm', (gltf) => {
            const v: VRM = gltf.userData.vrm;
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.combineSkeletons(gltf.scene);
            v.scene.rotation.y = Math.PI;
            setVrm(v);
        });
    }, []);

    useFrame((_, delta) => {
        if (!vrm) return;
        const t = performance.now() / 1000;
        vrm.update(delta);
        if (vrm.humanoid) {
            const spine = vrm.humanoid.getNormalizedBoneNode('spine');
            if (spine) { spine.rotation.z = Math.sin(t * 0.6) * 0.025; spine.rotation.x = Math.sin(t * 0.4) * 0.01; }
            const head = vrm.humanoid.getNormalizedBoneNode('head');
            if (head) { head.rotation.y = Math.sin(t * 0.25) * 0.08; head.rotation.x = Math.sin(t * 0.3) * 0.02; }
            const lArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
            const rArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
            if (lArm) lArm.rotation.z = 1.2 + Math.sin(t * 0.5) * 0.02;
            if (rArm) rArm.rotation.z = -1.2 + Math.sin(t * 0.5 + 0.5) * 0.02;

            if (vrm.expressionManager) {
                const blinkCycle = t % 4;
                if (blinkCycle > 3.8) {
                    const prog = (blinkCycle - 3.8) / 0.2;
                    vrm.expressionManager.setValue('blink', prog < 0.5 ? prog * 2 : 2 - prog * 2);
                } else {
                    vrm.expressionManager.setValue('blink', 0);
                }
                if (isSpeaking) {
                    vrm.expressionManager.setValue('aa', (Math.sin(t * 12) + 1) * 0.25);
                    vrm.expressionManager.setValue('oh', (Math.cos(t * 9) + 1) * 0.15);
                } else {
                    vrm.expressionManager.setValue('aa', 0);
                    vrm.expressionManager.setValue('oh', 0);
                }
            }
        }
    });

    if (!vrm) return null;
    return <primitive object={vrm.scene} />;
}

// ── Loading bar component ──
function LoadingBar({ progress, label }: { progress: number; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1.5 px-4 py-2">
            <span className="text-[10px] text-amber-400/60 uppercase tracking-widest">{label}</span>
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-amber-400/70 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <span className="text-[10px] text-zinc-600">{progress}%</span>
        </div>
    );
}

// ── Main panel ──
interface Message { role: 'user' | 'assistant'; content: string; }

export default function AiboPanel() {
    const activePlanetId = useStore(s => s.activePlanetId);
    const activePlanet = activePlanetId ? projects.find(p => p.id === activePlanetId) : null;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const { speak, stop, loading: ttsLoading, progress: ttsProgress, isSpeaking, error: ttsError } = useKokoroTTS();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasGreeted = useRef(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = useCallback(async (text: string, isSystem = false) => {
        if (!text.trim()) return;
        if (!isSystem) setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInput('');
        setIsThinking(true);
        stop();
        try {
            const res = await fetch('/api/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, activePlanetId }),
            });
            const data = await res.json() as { reply?: string };
            const reply = data.reply ?? "I seem to have lost my crystal ball. Try again?";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            // Fire-and-forget — Kokoro loads model then plays audio
            speak(reply);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection lost. Try again shortly." }]);
        } finally {
            setIsThinking(false);
        }
    }, [activePlanetId, speak, stop]);

    useEffect(() => {
        if (!hasGreeted.current) {
            hasGreeted.current = true;
            sendMessage('Greet the visitor warmly and briefly. Offer to guide them.', true);
        }
    }, [sendMessage]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* VRM avatar */}
            <div className="flex-shrink-0 h-56 relative bg-black/20">
                <Canvas
                    camera={{ position: [0, 1.0, 1.6], fov: 42 }}
                    gl={{ alpha: true, antialias: true }}
                    style={{ background: 'transparent' }}
                >
                    <CameraRig />
                    <directionalLight position={[1, 2, 1]} intensity={1.2} />
                    <ambientLight intensity={0.6} />
                    <VrmModel isSpeaking={isSpeaking} />
                </Canvas>

                {/* Voice status */}
                <button
                    onClick={() => isSpeaking ? stop() : undefined}
                    className="absolute top-2 right-2 text-[10px] text-amber-400/50 hover:text-amber-400 uppercase tracking-widest transition-colors"
                    title={isSpeaking ? 'Click to stop voice' : 'Voice ready'}
                >
                    {isSpeaking ? '🔊 speaking' : '✦ voice'}
                </button>

                {activePlanet && (
                    <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none">
                        <span className="text-[10px] text-amber-400/50 uppercase tracking-widest">
                            Viewing: {activePlanet.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Kokoro model loading indicator */}
            {ttsLoading && (
                <div className="flex-shrink-0 border-b border-amber-500/10 bg-black/30">
                    <LoadingBar progress={ttsProgress} label="Loading voice model…" />
                </div>
            )}

            {/* TTS error (non-blocking) */}
            {ttsError && !ttsLoading && (
                <div className="flex-shrink-0 px-4 py-1 text-[10px] text-red-400/60 text-center">
                    Voice unavailable — text only
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {messages.length === 0 && !isThinking && (
                    <p className="text-zinc-600 text-xs text-center pt-4 uppercase tracking-widest">Ask about the portfolio…</p>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] text-xs leading-relaxed px-3 py-2 rounded-lg ${
                            msg.role === 'user'
                                ? 'bg-amber-500/20 text-amber-200 rounded-br-none'
                                : 'bg-white/5 text-zinc-300 rounded-bl-none'
                        }`}>{msg.content}</div>
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
                    onKeyDown={e => { if (e.key === 'Enter' && !isThinking && input.trim()) sendMessage(input); }}
                    placeholder={isThinking ? 'Thinking…' : 'Ask about the portfolio…'}
                    disabled={isThinking}
                    className="flex-1 bg-white/5 rounded-full px-4 py-2 text-xs text-white placeholder-zinc-600 outline-none border border-white/10 focus:border-amber-500/50 transition-colors disabled:opacity-40"
                />
                <button
                    onClick={() => { if (!isThinking && input.trim()) sendMessage(input); }}
                    disabled={isThinking || !input.trim()}
                    className="px-3 py-2 rounded-full text-sm text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-colors disabled:opacity-30"
                >➤</button>
            </div>
        </div>
    );
}
