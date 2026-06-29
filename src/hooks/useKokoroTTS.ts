/**
 * Kokoro-js TTS hook — offloads all WASM inference to a dedicated Web Worker.
 *
 * Moving WASM off the main thread eliminates 100-500ms UI freezes that occurred
 * per sentence when tts.generate() ran inline. Audio playback (audioNaturalizer)
 * stays on the main thread because it needs AudioContext / Web Audio API.
 *
 * Worker protocol (kokoro.worker.ts):
 *   → { type: 'warmup' }
 *   → { type: 'speak', id, sentences, voice }
 *   ← { type: 'ready' }
 *   ← { type: 'audio', id, index, samples: Float32Array, sampleRate }  (one per sentence)
 *   ← { type: 'done', id }
 *   ← { type: 'error', id, message }
 *
 * Cancellation: stop() increments responseGenRef and clears pendingRef, which
 * causes speakQueue's gen-check to skip stale chain links, and causes stale
 * 'audio' messages from the worker to be dropped.
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { createNaturalizer, type Naturalizer } from '@/utils/audioNaturalizer';

export interface KokoroTTSState {
    speak: (text: string) => Promise<void>;
    speakQueue: (text: string) => void;
    stop: () => void;
    warmup: () => void;
    loading: boolean;
    progress: number;
    isSpeaking: boolean;
    error: string | null;
}

const VOICE = 'af_heart';

function stripMarkdown(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/`{1,3}[^`]*`{1,3}/g, '')
        .replace(/^#+\s+/gm, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/^[-*]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .trim();
}

function splitSentences(text: string): string[] {
    const clean = stripMarkdown(text);
    if (!clean) return [];
    const delimited = clean
        .replace(/([!?…])\s+/g, '$1\x00')
        .replace(/\.\s+(?=[A-Z])/g, '.\x00')
        .replace(/\n\n+/g, '\x00');
    return delimited
        .split('\x00')
        .map(s => s.trim())
        .filter(s => s.length > 2);
}

type WorkerMessage =
    | { type: 'ready' }
    | { type: 'audio'; id: number; index: number; samples: Float32Array; sampleRate: number }
    | { type: 'done'; id: number }
    | { type: 'error'; id: number; message: string };

export function useKokoroTTS(): KokoroTTSState {
    const [loading, setLoading] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const workerRef = useRef<Worker | null>(null);
    const naturalizerRef = useRef<Naturalizer | null>(null);
    // Generation counter: incremented by stop() to cancel in-flight speakQueue chains.
    const responseGenRef = useRef(0);
    // Sequential promise chain so speakQueue sentences are generated one at a time.
    const genQueueRef = useRef<Promise<void>>(Promise.resolve());
    // Monotonic request ID for matching worker responses to pending promises.
    const reqIdRef = useRef(0);
    const pendingRef = useRef<Map<number, { resolve: () => void; reject: (e: Error) => void }>>(new Map());

    useEffect(() => {
        if (!naturalizerRef.current) {
            naturalizerRef.current = createNaturalizer();
            naturalizerRef.current.onStart(() => setIsSpeaking(true));
            naturalizerRef.current.onEnd(() => setIsSpeaking(false));
        }

        if (!workerRef.current && typeof window !== 'undefined') {
            const worker = new Worker(
                new URL('../workers/kokoro.worker.ts', import.meta.url)
            );

            worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
                const msg = e.data;

                if (msg.type === 'ready') {
                    setLoading(false);
                    return;
                }
                if (msg.type === 'audio') {
                    // Drop audio for cancelled/cleared requests.
                    if (pendingRef.current.has(msg.id)) {
                        naturalizerRef.current?.enqueue(msg.samples, msg.sampleRate);
                    }
                    return;
                }
                if (msg.type === 'done') {
                    const p = pendingRef.current.get(msg.id);
                    if (p) { pendingRef.current.delete(msg.id); p.resolve(); }
                    return;
                }
                if (msg.type === 'error') {
                    const p = pendingRef.current.get(msg.id);
                    if (p) { pendingRef.current.delete(msg.id); p.reject(new Error(msg.message)); }
                    if (msg.id === -1) {
                        setError(msg.message);
                        setLoading(false);
                    }
                }
            };

            worker.onerror = (e) => {
                setError(e.message ?? 'Worker error');
                setLoading(false);
            };

            workerRef.current = worker;
        }

        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    const warmup = useCallback(() => {
        if (!workerRef.current) return;
        setLoading(true);
        setError(null);
        workerRef.current.postMessage({ type: 'warmup' });
    }, []);

    // Send a single sentence to the worker and return a promise that resolves
    // when the worker sends 'done' for that request id.
    const sendToWorker = useCallback((sentence: string): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            const id = ++reqIdRef.current;
            pendingRef.current.set(id, { resolve, reject });
            workerRef.current?.postMessage({ type: 'speak', id, sentences: [sentence], voice: VOICE });
        });
    }, []);

    // speakQueue: enqueue a sentence without aborting other in-flight sentences
    // from the same response. Sentences chain sequentially so WASM is never
    // concurrent. stop() increments responseGenRef to cancel pending chain links.
    const speakQueue = useCallback((text: string): void => {
        if (!text.trim()) return;
        const myGen = responseGenRef.current;
        genQueueRef.current = genQueueRef.current.then(async () => {
            if (responseGenRef.current !== myGen) return;
            try { await sendToWorker(text); } catch { /* ignore single-sentence failures */ }
        });
    }, [sendToWorker]);

    const speak = useCallback(async (text: string): Promise<void> => {
        if (!text.trim()) return;
        const sentences = splitSentences(text);
        const myGen = responseGenRef.current;
        for (const sentence of sentences) {
            if (responseGenRef.current !== myGen) break;
            try { await sendToWorker(sentence); } catch { /* ignore */ }
        }
    }, [sendToWorker]);

    const stop = useCallback(() => {
        responseGenRef.current++;
        // Resolve all pending promises so the queue chains drain without hanging.
        for (const [, p] of pendingRef.current) p.resolve();
        pendingRef.current.clear();
        naturalizerRef.current?.stop();
    }, []);

    return {
        speak,
        speakQueue,
        stop,
        warmup,
        loading,
        progress: loading ? 0 : 100,
        isSpeaking,
        error,
    };
}
