/**
 * Kokoro-js 1.x WASM neural TTS hook — streaming mode.
 * Uses tts.stream() so the first sentence plays while the rest generates,
 * cutting perceived latency from (full-response inference) to (one sentence).
 * Model is pre-warmed on mount so it is ready by the time the first reply arrives.
 */
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { createNaturalizer, type Naturalizer } from '@/utils/audioNaturalizer';

export interface KokoroTTSState {
    speak: (text: string) => Promise<void>;
    stop: () => void;
    loading: boolean;
    progress: number;   // 0–100
    isSpeaking: boolean;
    error: string | null;
}

const VOICE = 'af_heart';

export function useKokoroTTS(): KokoroTTSState {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipelineRef = useRef<any>(null);
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

        setLoading(true);
        setProgress(0);
        setError(null);

        try {
            const { KokoroTTS } = await import('kokoro-js');

            const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
                dtype: 'q8',
                device: 'wasm',
                progress_callback: (info) => {
                    if ('progress' in info && typeof info.progress === 'number') {
                        setProgress(Math.round(info.progress));
                    }
                },
            });

            pipelineRef.current = tts;
            setProgress(100);
            return tts;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load voice model';
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Pre-warm the model on mount so it is ready when the first reply arrives.
    // The loading bar in AiboPanel gives the user feedback while it downloads.
    useEffect(() => {
        loadModel().catch(() => { /* error surfaced via state */ });
    }, [loadModel]);

    const speak = useCallback(async (text: string) => {
        if (!text.trim()) return;

        // Cancel any in-flight stream from a previous speak() call
        speakAbortRef.current?.abort();
        const abort = new AbortController();
        speakAbortRef.current = abort;

        try {
            const tts = await loadModel();
            // stream() splits text into sentences and yields each as audio is ready.
            // The first sentence starts playing while the rest is still generating.
            const stream = tts.stream(text, { voice: VOICE });
            for await (const { audio } of stream) {
                if (abort.signal.aborted) break;
                naturalizerRef.current?.enqueue(audio.audio, audio.sampling_rate);
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

    return { speak, stop, loading, progress, isSpeaking, error };
}
