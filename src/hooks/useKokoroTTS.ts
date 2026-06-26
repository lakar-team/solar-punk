/**
 * Kokoro-js 1.x WASM/WebGPU neural TTS hook.
 *
 * Strategy:
 *  - Detect WebGPU on load; fall back to WASM. Chrome/Edge GPU inference is
 *    10-50x faster than WASM (~200ms/sentence vs 3-8s).
 *  - Model loading is deferred until warmup() is explicitly called (triggered
 *    by first panel open, which is a user gesture, avoiding AudioContext
 *    autoplay violations and WebGL context loss from WebGPU cold-start).
 *  - Run one short warmup inference after load to JIT-compile WASM/WebGPU
 *    compute graphs so the first real sentence doesn't pay the penalty.
 *  - Split text into sentences manually and generate each independently.
 *    Per-sentence try/catch means one failed phonemization can't cut off
 *    the rest of the response.
 *  - Promise deduplication in loadModel() prevents double-downloads if
 *    speak() fires before warmup finishes.
 *  - WebGPU uses fp16 (not fp32) to halve GPU memory and reduce Windows TDR
 *    (GPU timeout detection/recovery) risk that caused WebGL context loss.
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { createNaturalizer, type Naturalizer } from '@/utils/audioNaturalizer';

export interface KokoroTTSState {
    speak: (text: string) => Promise<void>;
    stop: () => void;
    warmup: () => void;
    loading: boolean;
    progress: number;
    isSpeaking: boolean;
    error: string | null;
}

const VOICE = 'af_heart';

function splitSentences(text: string): string[] {
    return text
        .split(/(?<=[.!?…])\s+|\n\n+/)
        .map(s => s.trim())
        .filter(s => s.length > 1);
}

async function detectDevice(): Promise<'webgpu' | 'wasm'> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gpu = (navigator as any).gpu;
        if (gpu) {
            const adapter = await gpu.requestAdapter();
            if (adapter) return 'webgpu';
        }
    } catch { /* ignore */ }
    return 'wasm';
}

export function useKokoroTTS(): KokoroTTSState {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipelineRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadingPromiseRef = useRef<Promise<any> | null>(null);
    const naturalizerRef = useRef<Naturalizer | null>(null);
    const speakAbortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!naturalizerRef.current) {
            naturalizerRef.current = createNaturalizer();
            naturalizerRef.current.onStart(() => setIsSpeaking(true));
            naturalizerRef.current.onEnd(() => setIsSpeaking(false));
        }
    }, []);

    const loadModel = useCallback(async () => {
        if (pipelineRef.current) return pipelineRef.current;
        // Return the in-flight promise so concurrent callers share one load
        if (loadingPromiseRef.current) return loadingPromiseRef.current;

        loadingPromiseRef.current = (async () => {
            setLoading(true);
            setProgress(0);
            setError(null);
            try {
                const { KokoroTTS } = await import('kokoro-js');
                const device = await detectDevice();
                // fp16 for WebGPU: 2x less VRAM than fp32, faster on tensor cores,
                // reduces Windows TDR risk that caused WebGL context loss.
                // q8 for WASM: smaller download + good quality on CPU.
                const dtype = device === 'webgpu' ? 'fp16' : 'q8';
                const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
                    dtype,
                    device,
                    progress_callback: (info) => {
                        if ('progress' in info && typeof info.progress === 'number') {
                            setProgress(Math.round(info.progress));
                        }
                    },
                });

                setProgress(100);
                setLoading(false);

                // Warmup: JIT-compiles WASM/WebGPU compute graphs so the first
                // real sentence doesn't pay the compilation penalty.
                try { await tts.generate('Hi', { voice: VOICE }); } catch { /* ignore */ }

                pipelineRef.current = tts;
                return tts;
            } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to load voice model';
                setError(msg);
                setLoading(false);
                loadingPromiseRef.current = null; // allow retry
                throw err;
            }
        })();

        return loadingPromiseRef.current;
    }, []);

    // Called by AiboPanel when the panel first opens (a user gesture),
    // so model download races the first API round-trip without violating
    // AudioContext autoplay policy or triggering WebGL context loss.
    const warmup = useCallback(() => {
        loadModel().catch(() => {});
    }, [loadModel]);

    const speak = useCallback(async (text: string) => {
        if (!text.trim()) return;

        speakAbortRef.current?.abort();
        const abort = new AbortController();
        speakAbortRef.current = abort;

        try {
            const tts = await loadModel();
            const sentences = splitSentences(text);

            for (const sentence of sentences) {
                if (abort.signal.aborted) break;
                try {
                    const result = await tts.generate(sentence, { voice: VOICE });
                    if (!abort.signal.aborted) {
                        naturalizerRef.current?.enqueue(result.audio, result.sampling_rate);
                    }
                } catch {
                    // One bad sentence (phonemizer error, etc.) — skip it, keep going
                }
            }
        } catch (err) {
            if (abort.signal.aborted) return;
            const msg = err instanceof Error ? err.message : 'Speech synthesis failed';
            setError(msg);
            setIsSpeaking(false);
            console.error('[Kokoro TTS]', err);
        }
    }, [loadModel]);

    const stop = useCallback(() => {
        speakAbortRef.current?.abort();
        naturalizerRef.current?.stop();
    }, []);

    return { speak, stop, warmup, loading, progress, isSpeaking, error };
}
