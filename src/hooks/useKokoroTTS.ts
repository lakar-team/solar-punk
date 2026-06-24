/**
 * Kokoro-js WASM neural TTS hook.
 * NO caching — model always downloads fresh (intentional: Adam wants first-visitor experience).
 *
 * Usage:
 *   const { speak, stop, loading, progress, error } = useKokoroTTS();
 *   speak("Hello there"); // returns promise
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { createNaturalizer, type Naturalizer } from '@/utils/audioNaturalizer';

export interface KokoroTTSState {
    speak: (text: string) => Promise<void>;
    stop: () => void;
    loading: boolean;       // model is downloading/initialising
    progress: number;       // 0-100
    isSpeaking: boolean;
    error: string | null;
}

// Kokoro voice to use — af_heart is a warm female English voice
const VOICE = 'af_heart';

export function useKokoroTTS(): KokoroTTSState {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pipelineRef = useRef<unknown>(null);
    const naturalizerRef = useRef<Naturalizer | null>(null);

    useEffect(() => {
        if (!naturalizerRef.current) {
            naturalizerRef.current = createNaturalizer();
            naturalizerRef.current.onStart(() => setIsSpeaking(true));
            naturalizerRef.current.onEnd(() => setIsSpeaking(false));
        }
    }, []);

    const loadModel = useCallback(async () => {
        if (pipelineRef.current) return pipelineRef.current;

        setLoading(true);
        setProgress(0);
        setError(null);

        try {
            // Dynamic import keeps kokoro-js out of the initial bundle
            const { KokoroPipeline } = await import('kokoro-js');

            // KokoroPipeline accepts a progress callback — no cache option needed;
            // the WASM runtime doesn't use the browser cache for model weights by default.
            const pipeline = await KokoroPipeline.from_pretrained('onnx-community/Kokoro-82M-v1.0', {
                dtype: 'fp32',
                // Explicitly set cache to false so every load is a fresh download
                // (satisfies Adam's "no cache" constraint)
                cache_dir: null,
                progress_callback: (info: { progress?: number }) => {
                    if (typeof info.progress === 'number') {
                        setProgress(Math.round(info.progress));
                    }
                },
            });

            pipelineRef.current = pipeline;
            setProgress(100);
            return pipeline;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load voice model';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const speak = useCallback(async (text: string) => {
        if (!text.trim()) return;

        try {
            const pipeline = await loadModel() as {
                generate: (text: string, options: { voice: string }) => Promise<{ audio: Float32Array; sampling_rate: number }>;
            };

            const result = await pipeline.generate(text, { voice: VOICE });
            naturalizerRef.current?.play(result.audio, result.sampling_rate);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Speech synthesis failed';
            setError(msg);
            setIsSpeaking(false);
            console.error('[Kokoro TTS]', err);
        }
    }, [loadModel]);

    const stop = useCallback(() => {
        naturalizerRef.current?.stop();
    }, []);

    return { speak, stop, loading, progress, isSpeaking, error };
}
