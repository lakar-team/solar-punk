/**
 * Kokoro-js 1.x WASM neural TTS hook.
 * NO caching — model always downloads fresh (Adam's constraint: first-visitor experience).
 *
 * API: KokoroTTS.from_pretrained() → tts.generate(text, { voice }) → RawAudio { audio, sampling_rate }
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

const VOICE = 'af_heart'; // warm female English voice

export function useKokoroTTS(): KokoroTTSState {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipelineRef = useRef<any>(null);
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
            const { KokoroTTS } = await import('kokoro-js');

            const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
                dtype: 'q8',   // quantised — ~20MB vs ~80MB fp32, still good quality
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

    const speak = useCallback(async (text: string) => {
        if (!text.trim()) return;
        try {
            const tts = await loadModel();
            // RawAudio: { audio: Float32Array, sampling_rate: number }
            const result = await tts.generate(text, { voice: VOICE });
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
