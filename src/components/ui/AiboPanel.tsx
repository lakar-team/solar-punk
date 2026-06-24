'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { projects } from '@/data/projects';

// ── VRM model rendered inside r3f Canvas (shares no WebGL context with solar system) ──

function VrmModel({ onLoaded }: { onLoaded: (vrm: VRM) => void }) {
    const vrmRef = useRef<VRM | null>(null);
    const loadedRef = useRef(false);

    useEffect(() => {
        const loader = new (require('three/examples/jsm/loaders/GLTFLoader').GLTFLoader)();
        loader.register((parser: any) => new VRMLoaderPlugin(parser));
        loader.load('/avatar.vrm', (gltf: any) => {
            const vrm: VRM = gltf.userData.vrm;
            VRMUtils.removeUnnecessaryVertices(gltf.scene);
            VRMUtils.combineSkeletons(gltf.scene);
            vrm.scene.rotation.y = Math.PI;
            vrmRef.current = vrm;
            if (!loadedRef.current) { loadedRef.current = true; onLoaded(vrm); }
        });
    }, [onLoaded]);

    useFrame((_, delta) => {
        if (!vrmRef.current) return;
        const vrm = vrmRef.current;
        const t = performance.now() / 1000;
        vrm.update(delta);
        if (vrm.humanoid) {
            const spine = vrm.humanoid.getNormalizedBoneNode('spine');
            if (spine) { spine.rotation.z = Math.sin(t * 0.5) * 0.02; }
            const leftArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
            const rightArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
            if (leftArm) leftArm.rotation.z = 1.2;
            if (rightArm) rightArm.rotation.z = -1.2;
        }
    });

    return vrmRef.current ? <primitive object={vrmRef.current.scene} /> : null;
}

function VrmCanvas({ isSpeaking }: { isSpeaking: boolean }) {
    const vrmRef = useRef<VRM | null>(null);
    const handleLoaded = useCallback((vrm: VRM) => { vrmRef.current = vrm; }, []);

    // Lip sync effect
    useEffect(() => {
        if (!vrmRef.current) return;
        // handled inside VrmModel's useFrame
    }, [isSpeaking]);

    return (
        <Canvas
            camera={{ position: [0, 1.5, 1.4], fov: 30 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true, antialias: true }}
            frameloop="always"
        >
            <directionalLight position={[1, 1, 1]} intensity={1} />
            <ambientLight intensity={0.5} />
            <Suspense fallback={null}>
                <VrmModel onLoaded={handleLoaded} />
            </Suspense>
        </Canvas>
    );
}

// ── Chat panel ──

interface Message { role: 'user' | 'assistant'; content: string; }

export default function AiboPanel() {
    const activePlanetId = useStore(s => s.activePlanetId);
    const activePlanet = activePlanetId ? projects.find(p => p.id === activePlanetId) : null;

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

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
        try {
            const res = await fetch('/api/brain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, activePlanetId }),
            });
            const data = await res.json() as { reply?: string };
            const reply = data.reply || "I seem to have lost my crystal ball. Try again?";
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
            setIsSpeaking(true);
            setTimeout(() => setIsSpeaking(false), Math.min(reply.length * 60, 8000));
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection lost. Try again shortly." }]);
        } finally {
            setIsThinking(false);
        }
    }, [activePlanetId]);

    useEffect(() => {
        if (!hasGreeted.current) {
            hasGreeted.current = true;
            sendMessage('Greet the visitor warmly and briefly. Offer to guide them through the portfolio.', true);
        }
    }, [sendMessage]);

    return (
        <div className="flex flex-col h-full w-full">
            {/* VRM avatar — r3f Canvas, no conflict with solar system */}
            <div className="flex-shrink-0 h-44 relative bg-black/30">
                <VrmCanvas isSpeaking={isSpeaking} />
                {activePlanet && (
                    <div className="absolute bottom-1 left-0 right-0 text-center">
                        <span className="text-[10px] text-amber-400/50 uppercase tracking-widest">
                            Viewing: {activePlanet.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                {messages.length === 0 && !isThinking && (
                    <p className="text-zinc-600 text-xs text-center pt-4 uppercase tracking-widest">
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
